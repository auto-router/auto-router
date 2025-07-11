"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE_URL = 'http://localhost:8080';

export class AuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private userId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') this.loadTokens();
  }

  private loadTokens() {
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.userId = localStorage.getItem('user_id');
  }

  private saveTokens({ access_token, refresh_token, user_id }: any) {
    this.token = access_token;
    this.refreshToken = refresh_token;
    this.userId = user_id;
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user_id', user_id);
  }

  private clearTokens() {
    this.token = null;
    this.refreshToken = null;
    this.userId = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_data_timestamp');
  }


  private async fetchWithAuth(endpoint: string, options: RequestInit = {}, retryWithRefresh = true): Promise<any> {
    const headers = new Headers({ 'Content-Type': 'application/json', ...(options.headers as any || {}) });
    if (this.token) headers.set('Authorization', `Bearer ${this.token}`);
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      // Check if access token is expired before making the request
      if (this.isAccessTokenExpired() && this.refreshToken && !this.isRefreshTokenExpired()) {
        try {
          await this.refreshAccessToken();
          // Set new Authorization header with refreshed token
          const newHeaders = new Headers(headers);
          newHeaders.set('Authorization', `Bearer ${this.token}`);
          return this.fetchWithAuth(endpoint, { ...options, headers: newHeaders }, false);
        } catch {
          this.clearTokens();
          throw new AuthError('Session expired. Please login again.', 401);
        }
      }
      const response = await fetch(url, { ...options, headers });
      const responseData = await response.json().catch(() => ({}));
      // If access token expired (e.g. backend returns 401), try to refresh and retry once
      if (response.status === 401 && retryWithRefresh && this.refreshToken && !this.isRefreshTokenExpired()) {
        try {
          await this.refreshAccessToken();
          const newHeaders = new Headers(headers);
          newHeaders.set('Authorization', `Bearer ${this.token}`);
          return this.fetchWithAuth(endpoint, { ...options, headers: newHeaders }, false);
        } catch {
          this.clearTokens();
          throw new AuthError('Session expired. Please login again.', 401);
        }
      }
      if (!response.ok) throw new AuthError(responseData.message || `HTTP error! status: ${response.status}`, response.status);
      return responseData;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Network error occurred');
    }
  }

  async login({ email, password }: { email: string; password: string }) {
    const response = await this.fetchWithAuth('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    // response should contain access_token, refresh_token, user_id
    if (response.access_token && response.refresh_token && response.user_id) {
      this.saveTokens(response);
    }
    return response;
  }

  async register(data: any) {
    const response = await this.fetchWithAuth('/register', { method: 'POST', body: JSON.stringify(data) });
    // response should contain access_token, refresh_token, user_id
    if (response.access_token && response.refresh_token && response.user_id) {
      this.saveTokens(response);
    }
    return response;
  }

  async googleAuth() {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  async logout() {
    try {
      if (this.refreshToken) {
        await this.fetchWithAuth('/logout', { method: 'POST', body: JSON.stringify({ refresh_token: this.refreshToken }) });
      }
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken() {
    // Backend returns: { user_id, access_token, refresh_token }
    if (!this.refreshToken || this.isRefreshTokenExpired()) {
      this.clearTokens();
      throw new AuthError('No valid refresh token available');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      if (!response.ok) {
        this.clearTokens();
        throw new AuthError('Failed to refresh token', response.status);
      }
      const data = await response.json();
      if (data.access_token) {
        this.token = data.access_token;
        localStorage.setItem('auth_token', data.access_token);
        if (data.refresh_token) {
          this.refreshToken = data.refresh_token;
          localStorage.setItem('refresh_token', data.refresh_token);
        }
      } else {
        this.clearTokens();
        throw new AuthError('Invalid refresh response');
      }
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  async getCurrentUser() {
    const cachedUser = localStorage.getItem('user_data');
    const cachedTimestamp = localStorage.getItem('user_data_timestamp');
    if (cachedUser && cachedTimestamp) {
      const MAX_CACHE_AGE = 60 * 60 * 1000;
      const cacheAge = Date.now() - parseInt(cachedTimestamp);
      if (cacheAge < MAX_CACHE_AGE) return JSON.parse(cachedUser);
    }
    const userData = await this.fetchWithAuth('/me');
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('user_data_timestamp', Date.now().toString());
    return userData;
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Decode a JWT and return its payload as an object
  private decodeJWT(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // Check if a JWT token is expired (returns true if expired)
  private isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const payload = this.decodeJWT(token);
    if (!payload || !payload.exp) return true;
    // exp is in seconds, Date.now() is ms
    return Date.now() >= payload.exp * 1000;
  }

  // Example usage: check if access or refresh token is expired
  isAccessTokenExpired() {
    return this.isTokenExpired(this.token);
  }

  isRefreshTokenExpired() {
    return this.isTokenExpired(this.refreshToken);
  }
}

export const authService = new AuthService();

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  refreshAuthState: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const refreshAuthState = () => setIsAuthenticated(authService.isAuthenticated());

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    const handleStorage = () => setIsAuthenticated(authService.isAuthenticated());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated: setIsAuthenticated, refreshAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};