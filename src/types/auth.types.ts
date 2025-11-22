import type { user as PrismaUser } from '../../generated/prisma';

// User type without password for API responses
export type UserWithoutPassword = Omit<PrismaUser, 'password'>;

// User type for registration input
export type UserRegistrationInput = {
  name: string;
  email: string;
  password: string;
};

// User type for login input
export type UserLoginInput = {
  email: string;
  password: string;
};

// User type for profile update
export type UserProfileUpdateInput = {
  name?: string;
  email?: string;
};

// User type for password change
export type UserPasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
};

// Auth tokens response
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// Login response
export type LoginResponse = {
  user: UserWithoutPassword;
  accessToken: string;
  refreshToken: string;
};