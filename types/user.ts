export type UserType = 'CUSTOMER' | 'BREWERY_SELLER' | 'LIQUOR_SELLER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  nickname: string;
  phone: string;
  userType: UserType;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    sessionId: string;
    refreshToken: string;
  };
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionId: string | null;
  refreshToken: string | null;
}