import { successResponse, errorResponse } from '../utils/responseHelper.js';
import path from 'path';

export const handleSingleUpload = (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }
    const category = req.query.category || req.body.category || 'general';
    const fileUrl = `/uploads/${category}/${req.file.filename}`;

    return successResponse(
      res,
      {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      'File uploaded successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const handleMultipleUploads = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No files uploaded', 400);
    }
    const category = req.query.category || req.body.category || 'general';
    const results = req.files.map(file => ({
      url: `/uploads/${category}/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    return successResponse(
      res,
      {
        files: results,
        count: results.length
      },
      `${results.length} files uploaded successfully`,
      201
    );
  } catch (err) {
    next(err);
  }
};
