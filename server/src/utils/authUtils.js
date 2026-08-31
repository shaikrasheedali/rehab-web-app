import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const JWT_SECRET = process.env.JWT_SECRET || 'thirumala-rehab-secret-session-key-2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Hash a plain text password using Argon2id
 */
export const hashPassword = async (plainPassword) => {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1
  });
};

/**
 * Verify a plain text password against an Argon2 hash
 */
export const verifyPassword = async (hash, plainPassword) => {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
};

/**
 * Sign a secure JWT session token
 */
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT session token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
