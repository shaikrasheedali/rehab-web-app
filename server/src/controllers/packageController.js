import { prisma } from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { parseJsonSafe } from '../utils/dateUtils.js';
import { cleanPlainText } from '../utils/sanitize.js';

export const getAllPackages = async (req, res, next) => {
  try {
    const { active } = req.query;
    const where = {};
    if (active !== undefined) where.active = active === 'true';

    const packages = await prisma.package.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    const parsed = packages.map(p => ({
      ...p,
      benefits: parseJsonSafe(p.benefits, []),
      serviceIds: parseJsonSafe(p.serviceIds, [])
    }));

    return successResponse(res, parsed, 'Packages retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (!pkg) {
      return errorResponse(res, `Package not found with id: ${id}`, 404);
    }
    const parsed = {
      ...pkg,
      benefits: parseJsonSafe(pkg.benefits, []),
      serviceIds: parseJsonSafe(pkg.serviceIds, [])
    };
    return successResponse(res, parsed, 'Package retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    const { id, name, rate, benefits, serviceIds, active } = req.body;
    const cleanName = cleanPlainText(name);
    if (!cleanName || Number(rate) < 0) {
      return errorResponse(res, 'Name and valid rate are required', 400);
    }

    const packageId = id || `pkg-${Date.now()}`;
    const newPackage = await prisma.package.create({
      data: {
        id: packageId,
        name: cleanName,
        rate: Number(rate) || 0,
        benefits: JSON.stringify(Array.isArray(benefits) ? benefits : []),
        serviceIds: JSON.stringify(Array.isArray(serviceIds) ? serviceIds : []),
        active: active !== undefined ? Boolean(active) : true
      }
    });

    const parsed = {
      ...newPackage,
      benefits: parseJsonSafe(newPackage.benefits, []),
      serviceIds: parseJsonSafe(newPackage.serviceIds, [])
    };

    return successResponse(res, parsed, 'Package created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, rate, benefits, serviceIds, active } = req.body;

    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Package not found with id: ${id}`, 404);
    }

    const updated = await prisma.package.update({
      where: { id },
      data: {
        name: name !== undefined ? cleanPlainText(name) : existing.name,
        rate: rate !== undefined ? Number(rate) : existing.rate,
        benefits: benefits !== undefined ? JSON.stringify(Array.isArray(benefits) ? benefits : []) : existing.benefits,
        serviceIds: serviceIds !== undefined ? JSON.stringify(Array.isArray(serviceIds) ? serviceIds : []) : existing.serviceIds,
        active: active !== undefined ? Boolean(active) : existing.active
      }
    });

    const parsed = {
      ...updated,
      benefits: parseJsonSafe(updated.benefits, []),
      serviceIds: parseJsonSafe(updated.serviceIds, [])
    };

    return successResponse(res, parsed, 'Package updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Package not found with id: ${id}`, 404);
    }
    await prisma.package.delete({ where: { id } });
    return successResponse(res, { id }, 'Package deleted successfully');
  } catch (err) {
    next(err);
  }
};
