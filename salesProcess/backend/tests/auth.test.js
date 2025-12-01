const jwt = require('jsonwebtoken');

describe('Authentication Middleware - Critical Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyToken - Core Security', () => {
    beforeEach(() => {
      jest.resetModules();
      
      jest.doMock('../controllers/prisma', () => ({
        user: {
          findUnique: jest.fn()
        }
      }));
    });

    afterEach(() => {
      jest.dontMock('../controllers/prisma');
    });

    test('should reject requests without authorization header', async () => {
      const { verifyToken } = require('../middleware/auth');
      
      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "No token provided" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject invalid JWT tokens', async () => {
      const { verifyToken } = require('../middleware/auth');
      mockReq.headers['authorization'] = 'Bearer invalid_token_here';
      
      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid token" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject malformed authorization header', async () => {
      const { verifyToken } = require('../middleware/auth');
      mockReq.headers['authorization'] = 'Bearer '; // Empty token
      
      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "No token provided" });
    });
  });

  describe('requireRole - Authorization', () => {
    test('should block users without proper role', () => {
      const { requireRole } = require('../middleware/auth');
      mockReq.user = { role: 'viewer' };
      const adminOnly = requireRole(['admin']);
      
      adminOnly(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Insufficient permissions" });
    });

    test('should allow users with correct role', () => {
      const { requireRole } = require('../middleware/auth');
      mockReq.user = { role: 'admin' };
      const adminOnly = requireRole(['admin']);
      
      adminOnly(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should block requests without user object', () => {
      const { requireRole } = require('../middleware/auth');
      const adminOnly = requireRole(['admin']);
      
      adminOnly(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Authentication required" });
    });
  });
});