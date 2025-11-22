import type { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '@/utils/auth.utils';
import { APIError } from '@/utils/APIError';
import { redis } from '@/config/database';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return next(new APIError(401, 'Access token required'));
    }

    // Check if token is blacklisted
    const isBlacklisted = await redis.getValue(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(new APIError(401, 'Token has been revoked'));
    }

    const decoded = AuthUtils.verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new APIError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new APIError(403, 'Insufficient permissions'));
    }

    next();
  };
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const isBlacklisted = await redis.getValue(`blacklist:${token}`);
      if (!isBlacklisted) {
        const decoded = AuthUtils.verifyToken(token);
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};