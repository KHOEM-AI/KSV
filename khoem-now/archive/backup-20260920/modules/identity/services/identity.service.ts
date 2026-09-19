/**
 * KSV — Identity Service
 * Location: src/modules/identity/services/identity.service.ts
 * 
 * Business Logic សម្រាប់គណនី
 */

import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { identityRepository } from '../repositories/identity.repository';
import type {
  CreateIdentityDto,
  UpdateIdentityDto,
  LoginDto,
  IdentityResponseDto,
  LoginResponseDto,
} from '../dto/identity.dto';

const BCRYPT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is not set. Refusing to start without it.');
}
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is not set. Refusing to start without it.');
}
const JWT_EXPIRES = '15m';
const REFRESH_EXPIRES = '30d';

export class IdentityService {
  private toResponse(user: any): IdentityResponseDto {
    return {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async register(dto: CreateIdentityDto): Promise<IdentityResponseDto> {
    const existing = await identityRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const userId = `USR-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const user = await identityRepository.create({
      userId,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      displayName: dto.displayName,
      passwordHash,
    });

    return this.toResponse(user);
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await identityRepository.findByEmail(dto.email);
    if (!user) throw new Error('Invalid credentials');
    if (user.status !== 'active') throw new Error('Account is not active');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const accessToken = jwt.sign(
      {
        sub: user.userId,
        role: user.role || 'Viewer',
        organizationId: user.organizationId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { sub: user.userId, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES }
    );

    return {
      accessToken,
      refreshToken,
      user: this.toResponse(user),
    };
  }

  async getProfile(userId: string): Promise<IdentityResponseDto> {
    const user = await identityRepository.findByUserId(userId);
    if (!user) throw new Error('User not found');
    return this.toResponse(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateIdentityDto
  ): Promise<IdentityResponseDto> {
    const allowed: Partial<UpdateIdentityDto> = {};
    if (dto.displayName !== undefined) allowed.displayName = dto.displayName;
    if (dto.phone !== undefined) allowed.phone = dto.phone;
    if (dto.twoFactorEnabled !== undefined) {
      allowed.twoFactorEnabled = dto.twoFactorEnabled;
    }
    const user = await identityRepository.update(userId, allowed as any);
    if (!user) throw new Error('User not found');
    return this.toResponse(user);
  }

  async deleteAccount(userId: string): Promise<void> {
    const ok = await identityRepository.delete(userId);
    if (!ok) throw new Error('User not found');
  }
}

export const identityService = new IdentityService();
