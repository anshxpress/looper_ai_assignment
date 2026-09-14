import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, requireAdmin } from '../../src/middleware/auth.middleware';
import '../../src/types/express.d'; // ensure global Express augmentation is loaded

// ── authMiddleware ────────────────────────────────────────────────────────────
describe('authMiddleware', () => {
  const mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const mockNext = vi.fn() as unknown as NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns 401 when no Authorization header', () => {
    const req = { headers: {} } as Request;
    authMiddleware(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'No token provided' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', () => {
    const req = { headers: { authorization: 'Bearer bad.token.here' } } as Request;
    authMiddleware(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Invalid or expired token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('calls next() and sets req.userId when token is valid', () => {
    const token = jwt.sign({ sub: 'user123', role: 'admin' }, 'test-secret');
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request & { userId?: string; userRole?: string };
    authMiddleware(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.userId).toBe('user123');
    expect(req.userRole).toBe('admin');
  });
});

// ── requireAdmin ──────────────────────────────────────────────────────────────
describe('requireAdmin', () => {
  const mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const mockNext = vi.fn() as unknown as NextFunction;

  beforeEach(() => vi.clearAllMocks());

  it('calls next() when userRole is admin', () => {
    const req = { userRole: 'admin' } as unknown as Request;
    requireAdmin(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('returns 403 when userRole is viewer', () => {
    const req = { userRole: 'viewer' } as unknown as Request;
    requireAdmin(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden: admin only' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 403 when userRole is missing', () => {
    const req = {} as unknown as Request;
    requireAdmin(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden: admin only' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
