"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE_URL = 'http://localhost:8080';

export class AuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

interface Tokens {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

class TokenManager {
  private static readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
    USER_DATA: 'user_data',
    USER_DATA_TIMESTAMP: 'user_data_timestamp'
  } as const;

  get accessToken(): string | null {
    return this.getItem(TokenManager.STORAGE_KEYS.ACCESS_TOKEN);
  }

  get refreshToken(): string | null {
    return this.getItem(TokenManager.STORAGE_KEYS.REFRESH_TOKEN);
  }

  get userId(): string | null {
    return this.getItem(TokenManager.STORAGE_KEYS.USER_ID);
  }

  private getItem(key: string): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  }

  saveTokens({ access_token, refresh_token, user_id }: Tokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TokenManager.STORAGE_KEYS.ACCESS_TOKEN, access_token);
    localStorage.setItem(TokenManager.STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
    localStorage.setItem(TokenManager.STORAGE_KEYS.USER_ID, user_id);
  }

  clearAll(): void {
    if (typeof window === 'undefined') return;
    Object.values(TokenManager.STORAGE_KEYS).forEach(key =>
      localStorage.removeItem(key)
    );
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
      const expTime = payload?.exp;
      
      console.log('Token expiration check:', {
        current_time: currentTime,
        exp_time: expTime,
        time_diff: expTime ? (expTime - currentTime) : 'no exp',
        is_expired: !expTime || currentTime >= expTime,
        token_preview: token.substring(0, 20) + '...'
      });
      
      // Add a small buffer (5 seconds) to account for clock skew
      const bufferTime = 5;
      return !expTime || (currentTime + bufferTime) >= expTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  getCachedUserData(): any | null {
    const cachedUser = this.getItem(TokenManager.STORAGE_KEYS.USER_DATA);
    const cachedTimestamp = this.getItem(TokenManager.STORAGE_KEYS.USER_DATA_TIMESTAMP);

    if (!cachedUser || !cachedTimestamp) return null;

    const MAX_CACHE_AGE = 60 * 60 * 1000; // 1 hour
    const cacheAge = Date.now() - parseInt(cachedTimestamp);

    return cacheAge < MAX_CACHE_AGE ? JSON.parse(cachedUser) : null;
  }

  cacheUserData(userData: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TokenManager.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(TokenManager.STORAGE_KEYS.USER_DATA_TIMESTAMP, Date.now().toString());
  }
}

class AuthService {
  private tokenManager = new TokenManager();
  private refreshPromise: Promise<void> | null = null;

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    });

    if (this.tokenManager.accessToken) {
      headers.set('Authorization', `Bearer ${this.tokenManager.accessToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new AuthError(data.message || `HTTP error! status: ${response.status}`, response.status);
    }

    return data;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Check if access token is expired before making request
    if (this.tokenManager.isTokenExpired(this.tokenManager.accessToken)) {
      const refreshToken = this.tokenManager.refreshToken;

      // If refresh token is also expired or missing, clear tokens and throw error
      if (!refreshToken || this.tokenManager.isTokenExpired(refreshToken)) {
        this.tokenManager.clearAll();
        throw new AuthError('Session expired. Please login again.', 401);
      }

      // Use existing refresh promise if one is in progress to avoid multiple refresh calls
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshAccessToken();
      }

      try {
        await this.refreshPromise;
        this.refreshPromise = null;
      } catch (error) {
        this.refreshPromise = null;
        throw error;
      }
    }

    try {
      return await this.makeRequest(endpoint, options);
    } catch (error) {
      // If we get 401 even after refresh, clear tokens
      if (error instanceof AuthError && error.status === 401) {
        this.tokenManager.clearAll();
      }
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<any> {
    console.log('Attempting login with:', { email: credentials.email });

    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    console.log('Login response received');

    if (response.access_token && response.refresh_token && response.user_id) {
      console.log('Validating tokens before saving...');
      
      const accessTokenExpired = this.tokenManager.isTokenExpired(response.access_token);
      const refreshTokenExpired = this.tokenManager.isTokenExpired(response.refresh_token);
      
      // If refresh token is immediately expired, this is a backend issue
      if (refreshTokenExpired) {
        console.error('BACKEND ISSUE: Refresh token is immediately expired. Check backend JWT generation.');
        // For now, we'll still save the tokens but log the issue
      }
      
      this.tokenManager.saveTokens(response);
      console.log('Tokens saved to storage');
      
    } else {
      console.error('Invalid login response - missing required fields:', {
        has_access_token: !!response.access_token,
        has_refresh_token: !!response.refresh_token,
        has_user_id: !!response.user_id
      });
    }

    return response;
  }

  async register(data: any): Promise<any> {
    const response = await this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response.access_token && response.refresh_token && response.user_id) {
      this.tokenManager.saveTokens(response);
    }

    return response;
  }

  async googleAuth(): Promise<void> {
    window.location.href = `${API_BASE_URL}/oauth/google`;
  }

  async logout(): Promise<void> {
    const promises = [];

    if (this.tokenManager.refreshToken) {
      promises.push(
        this.makeRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: this.tokenManager.refreshToken })
        }).catch(console.warn)
      );
    }

    promises.push(
      fetch(`${API_BASE_URL}/oauth/logout/google`, {
        method: 'GET',
        credentials: 'include'
      }).catch(console.warn)
    );

    await Promise.allSettled(promises);
    this.tokenManager.clearAll();
  }

  private async refreshAccessToken(): Promise<void> {
    const refreshToken = this.tokenManager.refreshToken;

    if (!refreshToken || this.tokenManager.isTokenExpired(refreshToken)) {
      this.tokenManager.clearAll();
      throw new AuthError('No valid refresh token available', 401);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        this.tokenManager.clearAll();
        throw new AuthError('Failed to refresh token', response.status);
      }

      const data = await response.json();

      if (!data.access_token) {
        this.tokenManager.clearAll();
        throw new AuthError('Invalid refresh response');
      }

      this.tokenManager.saveTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        user_id: data.user_id || this.tokenManager.userId!
      });
    } catch (error) {
      this.tokenManager.clearAll();
      throw error;
    }
  }

  // Enhanced API client that automatically handles token refresh
  async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.fetchWithAuth(endpoint, options);
  }

  // Initialize auth state on app start
  async initializeAuth(): Promise<boolean> {
    try {
      const accessToken = this.tokenManager.accessToken;
      const refreshToken = this.tokenManager.refreshToken;

      console.log('Auth initialization - tokens check:', {
        has_access_token: !!accessToken,
        access_token_expired: this.tokenManager.isTokenExpired(accessToken),
        has_refresh_token: !!refreshToken,
        refresh_token_expired: this.tokenManager.isTokenExpired(refreshToken)
      });

      // If no tokens at all, user is not authenticated
      if (!accessToken && !refreshToken) {
        console.log('No tokens found, user not authenticated');
        return false;
      }

      // If refresh token is expired or missing, clear everything
      if (!refreshToken || this.tokenManager.isTokenExpired(refreshToken)) {
        console.log('Refresh token expired or missing, clearing all tokens');
        this.tokenManager.clearAll();
        return false;
      }

      // If access token is expired or missing, try to refresh it
      if (!accessToken || this.tokenManager.isTokenExpired(accessToken)) {
        console.log('Access token expired/missing, attempting refresh...');
        try {
          await this.refreshAccessToken();
          console.log('Token refreshed successfully');
          // After refresh, verify the new token works
          await this.getCurrentUser();
          console.log('User verification successful after refresh');
          return true;
        } catch (error) {
          console.error('Token refresh failed during initialization:', error);
          this.tokenManager.clearAll();
          return false;
        }
      }

      // If access token exists and is not expired, verify it with the server
      console.log('Access token valid, verifying with server...');
      try {
        await this.getCurrentUser();
        console.log('Server verification successful');
        return true;
      } catch (error) {
        // If verification fails with 401, try to refresh
        if (error instanceof AuthError && error.status === 401) {
          console.log('Server verification failed with 401, attempting refresh...');
          try {
            await this.refreshAccessToken();
            await this.getCurrentUser();
            console.log('Token refresh and verification successful');
            return true;
          } catch (refreshError) {
            console.error('Token verification and refresh failed:', refreshError);
            this.tokenManager.clearAll();
            return false;
          }
        }
        // For other errors, still consider user authenticated if token is valid
        console.log('Server verification failed with non-401 error, but token is valid');
        return !this.tokenManager.isTokenExpired(accessToken);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.tokenManager.clearAll();
      return false;
    }
  }

  async getCurrentUser(): Promise<any> {
    const cachedUser = this.tokenManager.getCachedUserData();
    if (cachedUser) return cachedUser;

    const userData = await this.fetchWithAuth('/me');
    this.tokenManager.cacheUserData(userData);
    return userData;
  }

  isAuthenticated(): boolean {
    const accessToken = this.tokenManager.accessToken;
    const refreshToken = this.tokenManager.refreshToken;

    console.log('Authentication check:');
    
    if (!refreshToken) {
      console.log('No refresh token found');
      return false;
    }

    const isRefreshExpired = this.tokenManager.isTokenExpired(refreshToken);
    
    // TEMPORARY FIX: If both tokens exist but refresh is expired immediately,
    // check if access token is still valid (backend issue workaround)
    if (isRefreshExpired && accessToken) {
      const isAccessExpired = this.tokenManager.isTokenExpired(accessToken);
      if (!isAccessExpired) {
        console.warn('WORKAROUND: Using valid access token despite expired refresh token (backend issue)');
        return true;
      }
    }

    const isAuth = !!refreshToken && !isRefreshExpired;
    
    console.log('Authentication result:', {
      has_refresh_token: !!refreshToken,
      refresh_token_expired: isRefreshExpired,
      result: isAuth
    });

    return isAuth;
  }

  hasValidAccessToken(): boolean {
    const accessToken = this.tokenManager.accessToken;
    console.log('Checking access token validity:');

    if (accessToken) {
      const isExpired = this.tokenManager.isTokenExpired(accessToken);
      const isValid = !isExpired;

      console.log('hasValidAccessToken result:', {
        has_access_token: !!accessToken,
        is_expired: isExpired,
        is_valid: isValid
      });

      return isValid;
    }

    console.log('No access token found');
    return false;
  }
}

export const authService = new AuthService();

interface AuthContextType {
  isAuthenticated: boolean;
  hasValidAccessToken: boolean;
  isLoading: boolean;
  setAuthenticated: (auth: boolean) => void;
  refreshAuthState: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasValidAccessToken, setHasValidAccessToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuthState = () => {
    const authStatus = authService.isAuthenticated();
    const tokenStatus = authService.hasValidAccessToken();

    console.log('Refreshing auth state:', {
      previous_auth: isAuthenticated,
      new_auth: authStatus,
      previous_token: hasValidAccessToken,
      new_token: tokenStatus
    });

    setIsAuthenticated(authStatus);
    setHasValidAccessToken(tokenStatus);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        console.log('Initializing auth...');
        const isValid = await authService.initializeAuth();
        console.log('Auth initialization result:', isValid);

        if (isValid) {
          refreshAuthState();
        } else {
          setIsAuthenticated(false);
          setHasValidAccessToken(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsAuthenticated(false);
        setHasValidAccessToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const handleStorageChange = () => {
      console.log('Storage changed, refreshing auth state...');
      refreshAuthState();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Wrapper for API calls that automatically handles auth
  const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    try {
      const result = await authService.apiCall(endpoint, options);
      // Refresh auth state after successful API call
      refreshAuthState();
      return result;
    } catch (error) {
      // If auth error, refresh auth state
      if (error instanceof AuthError) {
        refreshAuthState();
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      hasValidAccessToken,
      isLoading,
      setAuthenticated: setIsAuthenticated,
      refreshAuthState,
      apiCall
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// Enhanced Route Protection Component with loading state
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { hasValidAccessToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasValidAccessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">Your session has expired. Please login again.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};