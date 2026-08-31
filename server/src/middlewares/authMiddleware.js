import { verifyToken } from '../utils/authUtils.js';
import { errorResponse } from '../utils/responseHelper.js';
import { prisma } from '../config/prisma.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-session-token'];
    if (!authHeader) {
      return errorResponse(res, 'Authentication required. Please sign in as administrator.', 401);
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return errorResponse(res, 'Invalid or expired session token. Please sign in again.', 401);
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.active) {
      return errorResponse(res, 'Administrator account inactive or not found.', 403);
    }

    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    };

    next();
  } catch (err) {
    next(err);
  }
};
