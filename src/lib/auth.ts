const API_BASE_URL = 'http://localhost:8080';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

export interface UserProfile {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  id?: string;
}

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
    if (typeof window !== 'undefined') {
      this.loadTokens();
    }
  }

  // Centralized token management
  private loadTokens(): void {
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.userId = localStorage.getItem('user_id');
  }

  private saveTokens(tokens: AuthResponse): void {
    this.token = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.userId = tokens.user_id;

    localStorage.setItem('auth_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('user_id', tokens.user_id);
  }

  private clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    this.userId = null;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_data_timestamp');
  }

  // Simple fetch wrapper without generics
  private async fetchWithAuth(
    endpoint: string,
    options: RequestInit = {},
    retryWithRefresh = true
  ): Promise<any> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    });

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, { ...options, headers });
      const responseData = await response.json().catch(() => ({}));

      // Handle expired token
      if (response.status === 401 && retryWithRefresh && this.refreshToken) {
        try {
          await this.refreshAccessToken();
          return this.fetchWithAuth(endpoint, options, false); // prevent infinite refresh loops
        } catch (error) {
          this.clearTokens();
          throw new AuthError('Session expired. Please login again.', 401);
        }
      }

      if (!response.ok) {
        throw new AuthError(
          responseData.message || `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Network error occurred');
    }
  }

  // Specific endpoint methods instead of generic request
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.fetchWithAuth('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.access_token) {
      this.saveTokens(response);
    }

    return response;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.fetchWithAuth('/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.access_token) {
      this.saveTokens(response);
    }

    return response;
  }

  async googleAuth(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await this.fetchWithAuth('/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });
      }
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      this.clearTokens();
      throw new AuthError('No refresh token available');
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

  async getCurrentUser(): Promise<UserProfile> {
    const cachedUser = localStorage.getItem('user_data');
    const cachedTimestamp = localStorage.getItem('user_data_timestamp');

    if (cachedUser && cachedTimestamp) {
      const MAX_CACHE_AGE = 60 * 60 * 1000; // 1 hour
      const cacheAge = Date.now() - parseInt(cachedTimestamp);

      if (cacheAge < MAX_CACHE_AGE) {
        return JSON.parse(cachedUser);
      }
    }

    const userData = await this.fetchWithAuth('/me');

    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('user_data_timestamp', Date.now().toString());

    return userData;
  }

  // Simple helper methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }
}

export const authService = new AuthService();