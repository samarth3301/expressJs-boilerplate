import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { APIError } from '@/utils/APIError';

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, config.bcryptRounds);
    } catch (error) {
      throw new APIError(500, 'Error hashing password');
    }
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new APIError(500, 'Error comparing password');
    }
  }

  static generateToken(payload: object, expiresIn: string = config.jwt.expiresIn): string {
    try {
      return jwt.sign(payload, config.jwt.secret as string, { expiresIn } as any);
    } catch (error) {
      throw new APIError(500, 'Error generating token');
    }
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new APIError(401, 'Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new APIError(401, 'Invalid token');
      } else {
        throw new APIError(401, 'Token verification failed');
      }
    }
  }

  static generateRefreshToken(payload: object): string {
    return this.generateToken(payload, '30d');
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}