import { prisma } from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { cleanPlainText } from '../utils/sanitize.js';

export const getProgressByAdmission = async (req, res, next) => {
  try {
    const { admissionId } = req.params;
    const records = await prisma.residentProgress.findMany({
      where: { admissionId },
      orderBy: { at: 'desc' }
    });
    return successResponse(res, records, 'Progress records retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createProgressRecord = async (req, res, next) => {
  try {
    const { admissionId, author, status, category, note, at } = req.body;
    const cleanAuthor = cleanPlainText(author);
    const cleanNote = cleanPlainText(note);

    if (!admissionId || !cleanAuthor || !cleanNote) {
      return errorResponse(res, 'Admission ID, author, and note are required', 400);
    }

    const admission = await prisma.admission.findUnique({ where: { id: admissionId } });
    if (!admission) {
      return errorResponse(res, `Admission not found with id: ${admissionId}`, 404);
    }

    const id = `prog-${Date.now().toString(16).slice(-6)}`;
    const newRecord = await prisma.residentProgress.create({
      data: {
        id,
        admissionId,
        author: cleanAuthor,
        status: status || 'On track',
        category: category || 'Daily review',
        note: cleanNote,
        at: at ? new Date(at) : new Date()
      }
    });

    return successResponse(res, newRecord, 'Progress record logged successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const deleteProgressRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.residentProgress.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Progress record not found with id: ${id}`, 404);
    }
    await prisma.residentProgress.delete({ where: { id } });
    return successResponse(res, { id }, 'Progress record deleted successfully');
  } catch (err) {
    next(err);
  }
};
