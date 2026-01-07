const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      _id: string;
      username: string;
      email: string;
      role: 'admin' | 'operator';
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  // Helper function to get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Helper function to remove token (for logout)
  removeToken(): void {
    localStorage.removeItem('token');
  },

  // Helper function to check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },
};