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
      return !payload?.exp || Date.now() >= payload.exp * 1000;
    } catch {
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
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.access_token && response.refresh_token && response.user_id) {
      this.tokenManager.saveTokens(response);
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

  async refreshAccessToken(): Promise<void> {
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

      // Save new tokens - backend should return both new access and refresh tokens
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

    // User is authenticated if:
    // 1. Access token exists and is not expired, OR
    // 2. Access token is expired but refresh token exists and is not expired
    return !this.tokenManager.isTokenExpired(accessToken) ||
      (!this.tokenManager.isTokenExpired(refreshToken) && !!refreshToken);
  }

  hasValidAccessToken(): boolean {
    return !this.tokenManager.isTokenExpired(this.tokenManager.accessToken);
  }
}

export const authService = new AuthService();

interface AuthContextType {
  isAuthenticated: boolean;
  hasValidAccessToken: boolean;
  setAuthenticated: (auth: boolean) => void;
  refreshAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [hasValidAccessToken, setHasValidAccessToken] = useState(authService.hasValidAccessToken());

  const refreshAuthState = () => {
    setIsAuthenticated(authService.isAuthenticated());
    setHasValidAccessToken(authService.hasValidAccessToken());
  };

  useEffect(() => {
    refreshAuthState();

    const handleStorageChange = () => refreshAuthState();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      hasValidAccessToken,
      setAuthenticated: setIsAuthenticated,
      refreshAuthState
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

// Route Protection Component
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { hasValidAccessToken } = useAuth();

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