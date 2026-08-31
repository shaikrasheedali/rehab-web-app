import { errorResponse } from '../utils/responseHelper.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
};
