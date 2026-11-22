/**
 * Architecture Client REST prête pour l'intégration avec un backend Spring Boot (JWT + MySQL).
 * En mode démonstration frontend, le MaritimeContext gère l'état réactif localement
 * tout en conservant les contrats de requêtes/réponses Spring Boot.
 */

export interface ApiConfig {
  baseUrl: string;
  mode: 'demo' | 'spring-boot';
}

export const API_CONFIG: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  mode: 'demo',
};

export interface AuthResponseDTO {
  token: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

class SpringBootApiClient {
  private tokenKey = 'bahripay_jwt_token';

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  public clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erreur HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

export const apiClient = new SpringBootApiClient();

export const SPRING_BOOT_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  SAILORS: '/sailors',
  VESSELS: '/vessels',
  TRIPS: '/fishing-trips',
  SALES: '/finances/sales',
  EXPENSES: '/finances/expenses',
  PAYMENTS: '/finances/payments',
  AI_ANALYZE: '/ocean-ai/analyze',
  REPORTS_EXPORT: '/reports/export',
} as const;
