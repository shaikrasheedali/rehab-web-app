import { prisma } from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { parseJsonSafe } from '../utils/dateUtils.js';
import { sanitizeHtml, cleanPlainText } from '../utils/sanitize.js';

export const getAllServices = async (req, res, next) => {
  try {
    const { kind, active } = req.query;
    const where = {};
    if (kind) where.kind = kind;
    if (active !== undefined) where.active = active === 'true';

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    const parsed = services.map(s => ({
      ...s,
      benefits: parseJsonSafe(s.benefits, []),
      images: parseJsonSafe(s.images, [])
    }));

    return successResponse(res, parsed, 'Services retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return errorResponse(res, `Service not found with id: ${id}`, 404);
    }
    const parsed = {
      ...service,
      benefits: parseJsonSafe(service.benefits, []),
      images: parseJsonSafe(service.images, [])
    };
    return successResponse(res, parsed, 'Service retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createService = async (req, res, next) => {
  try {
    const { id, name, kind, rate, summary, content, benefits, images, active } = req.body;
    const cleanName = cleanPlainText(name);
    const cleanSummary = cleanPlainText(summary);
    if (!cleanName || !cleanSummary || Number(rate) < 0) {
      return errorResponse(res, 'Name, summary, and valid rate are required', 400);
    }

    const serviceId = id || `svc-${Date.now()}`;
    const newService = await prisma.service.create({
      data: {
        id: serviceId,
        name: cleanName,
        kind: kind || 'in-package',
        rate: Number(rate) || 0,
        summary: cleanSummary,
        content: sanitizeHtml(content || `<p>${cleanSummary}</p>`),
        benefits: JSON.stringify(Array.isArray(benefits) ? benefits : []),
        images: JSON.stringify(Array.isArray(images) ? images : []),
        active: active !== undefined ? Boolean(active) : true
      }
    });

    const parsed = {
      ...newService,
      benefits: parseJsonSafe(newService.benefits, []),
      images: parseJsonSafe(newService.images, [])
    };

    return successResponse(res, parsed, 'Service created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, kind, rate, summary, content, benefits, images, active } = req.body;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Service not found with id: ${id}`, 404);
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name: name !== undefined ? cleanPlainText(name) : existing.name,
        kind: kind !== undefined ? kind : existing.kind,
        rate: rate !== undefined ? Number(rate) : existing.rate,
        summary: summary !== undefined ? cleanPlainText(summary) : existing.summary,
        content: content !== undefined ? sanitizeHtml(content) : existing.content,
        benefits: benefits !== undefined ? JSON.stringify(Array.isArray(benefits) ? benefits : []) : existing.benefits,
        images: images !== undefined ? JSON.stringify(Array.isArray(images) ? images : []) : existing.images,
        active: active !== undefined ? Boolean(active) : existing.active
      }
    });

    const parsed = {
      ...updated,
      benefits: parseJsonSafe(updated.benefits, []),
      images: parseJsonSafe(updated.images, [])
    };

    return successResponse(res, parsed, 'Service updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Service not found with id: ${id}`, 404);
    }
    await prisma.service.delete({ where: { id } });
    return successResponse(res, { id }, 'Service deleted successfully');
  } catch (err) {
    next(err);
  }
};
