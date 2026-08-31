import { errorResponse } from '../utils/responseHelper.js';

export const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return errorResponse(
        res,
        `Missing required fields: ${missing.join(', ')}`,
        400,
        { missingFields: missing }
      );
    }
    next();
  };
};
