export interface AuthUser {
  id?: string;
  Id?: string;
  user_id?: string;
  username: string;
  userName?: string;
  name: string;
  fullName?: string;
  full_name?: string;
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
  has_credentials?: boolean;
  isGoogleAccount?: boolean;
  is_google_account?: boolean;
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
  avatarUri?: string | null;
}

export interface UpdateProfileResponse {
  id: string;
  Id?: string;
  userId?: string;
  user_id?: string;
  username: string;
  userName?: string;
  UserName?: string;
  email: string;
  fullName?: string;
  FullName?: string;
  full_name?: string;
  name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  AvatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface DietaryProfile {
  diets: number[];
  allergies: string[];
  favoriteCuisines: string[];
  weeklyBudget: number;
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
