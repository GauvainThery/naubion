/**
 * Admin Authentication Middleware
 * Simple password-based authentication for admin routes
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getConfig } from '../../../config/index.js';
import logger from '../../../shared/logger.js';

interface AuthenticatedRequest extends Request {
  isAuthenticated?: boolean;
}

/**
 * Simple password verification
 */
function verifyPassword(inputPassword: string): boolean {
  const adminPassword = getConfig<string>('admin.password');

  if (!adminPassword) {
    logger.error('Admin password not configured');
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
  const correctHash = crypto.createHash('sha256').update(adminPassword).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(correctHash, 'hex'));
}

/**
 * Middleware to check admin authentication
 */
export function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Authorization header required'
    });
    return;
  }

  // Expected format: "Bearer password" or "Basic base64(admin:password)"
  let password: string;

  if (authHeader.startsWith('Bearer ')) {
    password = authHeader.substring(7);
  } else if (authHeader.startsWith('Basic ')) {
    try {
      const base64Credentials = authHeader.substring(6);
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, pass] = credentials.split(':');

      if (username !== 'admin') {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      password = pass;
    } catch (e) {
      logger.warn('Invalid authorization format', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        message: e instanceof Error ? e.message : 'Unknown error'
      });
      res.status(401).json({
        success: false,
        message: 'Invalid authorization format'
      });
      return;
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid authorization format'
    });
    return;
  }

  if (!verifyPassword(password)) {
    logger.warn('Failed admin login attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
    return;
  }

  // Mark request as authenticated
  req.isAuthenticated = true;
  logger.info('Admin authenticated successfully', { ip: req.ip });
  next();
}

/**
 * Session-based authentication (optional, more user-friendly)
 */
export function createAdminSession(req: Request, res: Response): void {
  const { password } = req.body;

  if (!password || !verifyPassword(password)) {
    logger.warn('Failed admin login attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(401).json({
      success: false,
      message: 'Invalid password'
    });
    return;
  }

  // In a real app, you'd use proper session management
  // For now, we'll return a simple token
  const sessionToken = crypto.randomBytes(32).toString('hex');

  logger.info('Admin session created', { ip: req.ip });

  res.json({
    success: true,
    message: 'Authentication successful',
    sessionToken,
    expiresIn: '1 hour'
  });
}
