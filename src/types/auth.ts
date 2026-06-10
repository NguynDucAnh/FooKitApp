export interface AuthUser {
  id?: string;
  username: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  cookingGoal?: string;
  dietaryPreference?: string;
  allergies?: string;
  favoriteCuisine?: string;
  weeklyBudget?: string;
  role?: string;
  roles?: string[];
  isAdmin?: boolean;
  hasCredentials?: boolean;
  isGoogleAccount?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface SetCredentialsRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface UpdateProfileResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: Partial<AuthUser>;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    user?: Partial<AuthUser>;
  } | Partial<AuthUser>;
  message?: string;
}
