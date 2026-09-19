/**
 * KSV — Identity DTO
 * Location: src/modules/identity/dto/identity.dto.ts
 * 
 * Data Transfer Objects សម្រាប់ Request/Response
 */

export interface CreateIdentityDto {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}

export interface UpdateIdentityDto {
  displayName?: string;
  phone?: string;
  twoFactorEnabled?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface IdentityResponseDto {
  userId: string;
  email: string;
  phone?: string;
  displayName: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: IdentityResponseDto;
}
