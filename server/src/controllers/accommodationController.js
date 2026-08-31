import { prisma } from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { cleanPlainText } from '../utils/sanitize.js';

export const getAllAccommodations = async (req, res, next) => {
  try {
    const accommodations = await prisma.accommodation.findMany({
      orderBy: { id: 'asc' }
    });

    // Check current occupancy against active admissions
    const activeAdmissions = await prisma.admission.findMany({
      where: {
        status: 'Admitted',
        stayType: 'staying',
        accommodationId: { not: null }
      },
      select: {
        id: true,
        patient: true,
        accommodationId: true,
        admissionDate: true
      }
    });

    const occupantMap = new Map();
    activeAdmissions.forEach(adm => {
      if (adm.accommodationId) {
        occupantMap.set(adm.accommodationId, {
          admissionId: adm.id,
          patient: adm.patient,
          admissionDate: adm.admissionDate
        });
      }
    });

    const enriched = accommodations.map(acc => ({
      ...acc,
      isOccupied: occupantMap.has(acc.id),
      occupant: occupantMap.get(acc.id) || null
    }));

    return successResponse(res, enriched, 'Accommodations retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createAccommodation = async (req, res, next) => {
  try {
    const { id, type, label, active } = req.body;
    const cleanId = cleanPlainText(id).toUpperCase();
    const cleanLabel = cleanPlainText(label);

    if (!cleanId || !cleanLabel || !type) {
      return errorResponse(res, 'ID, type (Room/Bed), and label are required', 400);
    }

    const existing = await prisma.accommodation.findUnique({ where: { id: cleanId } });
    if (existing) {
      return errorResponse(res, `Accommodation with ID ${cleanId} already exists`, 409);
    }

    const newAcc = await prisma.accommodation.create({
      data: {
        id: cleanId,
        type: type === 'Bed' ? 'Bed' : 'Room',
        label: cleanLabel,
        active: active !== undefined ? Boolean(active) : true
      }
    });

    return successResponse(res, newAcc, 'Accommodation created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateAccommodation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, label, active } = req.body;

    const existing = await prisma.accommodation.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Accommodation not found with id: ${id}`, 404);
    }

    const updated = await prisma.accommodation.update({
      where: { id },
      data: {
        ...(type && { type: type === 'Bed' ? 'Bed' : 'Room' }),
        ...(label && { label: cleanPlainText(label) }),
        ...(active !== undefined && { active: Boolean(active) })
      }
    });

    return successResponse(res, updated, 'Accommodation updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteAccommodation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.accommodation.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Accommodation not found with id: ${id}`, 404);
    }

    // Check if currently occupied
    const activeOccupant = await prisma.admission.findFirst({
      where: {
        status: 'Admitted',
        stayType: 'staying',
        accommodationId: id
      }
    });

    if (activeOccupant) {
      return errorResponse(
        res,
        `Cannot delete ${id} because it is currently assigned to active patient ${activeOccupant.patient} (${activeOccupant.id})`,
        400
      );
    }

    await prisma.accommodation.delete({ where: { id } });
    return successResponse(res, { id }, 'Accommodation deleted successfully');
  } catch (err) {
    next(err);
  }
};
