import { prisma } from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { parseJsonSafe } from '../utils/dateUtils.js';
import { cleanPlainText } from '../utils/sanitize.js';

export const getAllInquiries = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const where = {};
    if (status && status !== 'All') where.status = status;
    if (priority && priority !== 'All') where.priority = priority;

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    let parsed = inquiries.map(inq => ({
      ...inq,
      offPackageServiceIds: parseJsonSafe(inq.offPackageServiceIds, []),
      basket: parseJsonSafe(inq.basket, [])
    }));

    if (search) {
      const q = search.toLowerCase();
      parsed = parsed.filter(i =>
        i.patient.toLowerCase().includes(q) ||
        i.contact.toLowerCase().includes(q) ||
        i.phone.toLowerCase().includes(q) ||
        i.need.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
      );
    }

    return successResponse(res, parsed, 'Inquiries retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inq = await prisma.inquiry.findUnique({ where: { id } });
    if (!inq) {
      return errorResponse(res, `Inquiry not found with id: ${id}`, 404);
    }
    const parsed = {
      ...inq,
      offPackageServiceIds: parseJsonSafe(inq.offPackageServiceIds, []),
      basket: parseJsonSafe(inq.basket, [])
    };
    return successResponse(res, parsed, 'Inquiry retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createInquiry = async (req, res, next) => {
  try {
    const {
      patient,
      contact,
      phone,
      email,
      need,
      start,
      duration,
      language,
      room,
      currentLocation,
      packageId,
      offPackageServiceIds,
      basket,
      priority,
      consent,
      contactRequest
    } = req.body;

    const cleanPatient = cleanPlainText(patient);
    const cleanContact = cleanPlainText(contact);
    const cleanPhone = cleanPlainText(phone);
    const cleanNeed = cleanPlainText(need);

    if (!cleanPatient || !cleanContact || !cleanPhone) {
      return errorResponse(res, 'Patient name, contact name, and phone are required', 400);
    }

    const id = `INQ-${String(Date.now()).slice(-6)}`;
    const newInquiry = await prisma.inquiry.create({
      data: {
        id,
        patient: cleanPatient,
        contact: cleanContact,
        phone: cleanPhone,
        email: email ? cleanPlainText(email) : null,
        need: cleanNeed || 'Care inquiry',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        start: start || null,
        duration: duration || '30 days',
        language: language || 'English',
        room: room || 'No preference',
        currentLocation: currentLocation || 'At home',
        packageId: packageId || null,
        offPackageServiceIds: JSON.stringify(Array.isArray(offPackageServiceIds) ? offPackageServiceIds : []),
        status: 'New',
        priority: priority || 'Normal',
        basket: JSON.stringify(Array.isArray(basket) ? basket : []),
        consent: consent !== undefined ? Boolean(consent) : true,
        contactRequest: Boolean(contactRequest)
      }
    });

    const parsed = {
      ...newInquiry,
      offPackageServiceIds: parseJsonSafe(newInquiry.offPackageServiceIds, []),
      basket: parseJsonSafe(newInquiry.basket, [])
    };

    return successResponse(res, parsed, 'Inquiry created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Inquiry not found with id: ${id}`, 404);
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority })
      }
    });

    const parsed = {
      ...updated,
      offPackageServiceIds: parseJsonSafe(updated.offPackageServiceIds, []),
      basket: parseJsonSafe(updated.basket, [])
    };

    return successResponse(res, parsed, 'Inquiry updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Inquiry not found with id: ${id}`, 404);
    }
    await prisma.inquiry.delete({ where: { id } });
    return successResponse(res, { id }, 'Inquiry deleted successfully');
  } catch (err) {
    next(err);
  }
};
