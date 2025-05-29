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
}

export interface UserProfile {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

export class AuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    });

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making request to:', url);
    console.log('Request options:', {
      method: options.method,
      headers: Object.fromEntries(headers.entries()),
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('Response status:', response.status);
      const responseData = await response.json().catch(() => ({}));
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new AuthError(
          responseData.message || `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return responseData;
    } catch (error) {
      console.error('Request failed:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Network error occurred');
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Attempting login with:', { email: credentials.email });
    const response = await this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('Login response:', response);

    if (response.access_token) {
      this.token = response.access_token;
      localStorage.setItem('auth_token', response.access_token);
      console.log('Token stored successfully');
    } else {
      console.warn('No access token in response');
    }

    return response;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.access_token) {
      this.token = response.access_token;
      localStorage.setItem('auth_token', response.access_token);
    }

    return response;
  }

  async googleAuth(): Promise<void> {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/logout', {
        method: 'POST',
      });
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/refresh', {
      method: 'POST',
    });

    if (response.access_token) {
      this.token = response.access_token;
      localStorage.setItem('auth_token', response.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<UserProfile> {
    return this.request<UserProfile>('/me');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService(); 