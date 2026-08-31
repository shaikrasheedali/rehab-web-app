import { prisma } from '../config/prisma.js';
import { hashPassword, verifyPassword, signToken } from '../utils/authUtils.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { cleanPlainText } from '../utils/sanitize.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return errorResponse(res, 'Username and password are required', 400);
    }

    const cleanUser = cleanPlainText(username.trim().toLowerCase());
    const admin = await prisma.adminUser.findUnique({
      where: { username: cleanUser }
    });

    if (!admin || !admin.active) {
      return errorResponse(res, 'Invalid administrator credentials', 401);
    }

    const isValid = await verifyPassword(admin.passwordHash, password);
    if (!isValid) {
      return errorResponse(res, 'Invalid administrator credentials', 401);
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    const token = signToken({
      userId: admin.id,
      username: admin.username,
      role: admin.role
    });

    return successResponse(
      res,
      {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
          lastLogin: admin.lastLogin
        }
      },
      'Authentication successful'
    );
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    return successResponse(
      res,
      {
        user: req.user
      },
      'Current session active'
    );
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    return successResponse(res, null, 'Session ended successfully');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters', 400);
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: req.user.id }
    });

    const isValid = await verifyPassword(admin.passwordHash, currentPassword);
    if (!isValid) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.adminUser.update({
      where: { id: req.user.id },
      data: { passwordHash }
    });

    return successResponse(res, null, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};
