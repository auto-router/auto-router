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
    ACCESS_TOKEN: 'access_token',
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
      const currentTime = Math.floor(Date.now() / 1000);
      return !payload?.exp || currentTime >= payload.exp;
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
    if (this.tokenManager.isTokenExpired(this.tokenManager.accessToken)) {
      const refreshToken = this.tokenManager.refreshToken;

      if (!refreshToken || this.tokenManager.isTokenExpired(refreshToken)) {
        this.tokenManager.clearAll();
        throw new AuthError('Session expired. Please login again.', 401);
      }

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

  async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.fetchWithAuth(endpoint, options);
  }

  async initializeAuth(): Promise<boolean> {
    try {
      const accessToken = this.tokenManager.accessToken;
      const refreshToken = this.tokenManager.refreshToken;

      if (!accessToken && !refreshToken) {
        return false;
      }

      if (!refreshToken || this.tokenManager.isTokenExpired(refreshToken)) {
        this.tokenManager.clearAll();
        return false;
      }

      if (!accessToken || this.tokenManager.isTokenExpired(accessToken)) {
        try {
          await this.refreshAccessToken();
          await this.getCurrentUser();
          return true;
        } catch (error) {
          this.tokenManager.clearAll();
          return false;
        }
      }

      try {
        await this.getCurrentUser();
        return true;
      } catch (error) {
        if (error instanceof AuthError && error.status === 401) {
          try {
            await this.refreshAccessToken();
            await this.getCurrentUser();
            return true;
          } catch (refreshError) {
            this.tokenManager.clearAll();
            return false;
          }
        }
        return !this.tokenManager.isTokenExpired(accessToken);
      }
    } catch (error) {
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
    const refreshToken = this.tokenManager.refreshToken;
    return !!refreshToken && !this.tokenManager.isTokenExpired(refreshToken);
  }

  hasValidAccessToken(): boolean {
    return !this.tokenManager.isTokenExpired(this.tokenManager.accessToken);
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
    setIsAuthenticated(authService.isAuthenticated());
    setHasValidAccessToken(authService.hasValidAccessToken());
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const isValid = await authService.initializeAuth();
        if (isValid) {
          refreshAuthState();
        } else {
          setIsAuthenticated(false);
          setHasValidAccessToken(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setHasValidAccessToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const handleStorageChange = () => refreshAuthState();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    try {
      const result = await authService.apiCall(endpoint, options);
      refreshAuthState();
      return result;
    } catch (error) {
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