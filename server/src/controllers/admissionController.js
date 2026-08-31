import { prisma } from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { parseJsonSafe } from '../utils/dateUtils.js';
import { cleanPlainText } from '../utils/sanitize.js';
import {
  advanceBillingProfile,
  calculatePatientBill
} from '../utils/billingCalculator.js';

export const getAllAdmissions = async (req, res, next) => {
  try {
    const { status, stayType } = req.query;
    const where = {};
    if (status) where.status = status;
    if (stayType) where.stayType = stayType;

    const admissions = await prisma.admission.findMany({
      where,
      include: {
        billingProfile: true,
        payments: { orderBy: { at: 'desc' } },
        progressRecords: { orderBy: { at: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = admissions.map(a => ({
      ...a,
      offPackageServiceIds: parseJsonSafe(a.offPackageServiceIds, []),
      finalBill: a.finalBill ? parseJsonSafe(a.finalBill, null) : null,
      billingProfile: a.billingProfile
        ? {
            ...a.billingProfile,
            addOns: parseJsonSafe(a.billingProfile.addOns, []),
            customLines: parseJsonSafe(a.billingProfile.customLines, [])
          }
        : null
    }));

    return successResponse(res, parsed, 'Admissions retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getAdmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admission = await prisma.admission.findUnique({
      where: { id },
      include: {
        billingProfile: true,
        payments: { orderBy: { at: 'desc' } },
        progressRecords: { orderBy: { at: 'desc' } }
      }
    });

    if (!admission) {
      return errorResponse(res, `Admission not found with id: ${id}`, 404);
    }

    const parsed = {
      ...admission,
      offPackageServiceIds: parseJsonSafe(admission.offPackageServiceIds, []),
      finalBill: admission.finalBill ? parseJsonSafe(admission.finalBill, null) : null,
      billingProfile: admission.billingProfile
        ? {
            ...admission.billingProfile,
            addOns: parseJsonSafe(admission.billingProfile.addOns, []),
            customLines: parseJsonSafe(admission.billingProfile.customLines, [])
          }
        : null
    };

    return successResponse(res, parsed, 'Admission retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createAdmission = async (req, res, next) => {
  try {
    const {
      id,
      patient,
      age,
      gender,
      contact,
      phone,
      address,
      need,
      language,
      currentLocation,
      roomPreference,
      admissionDate,
      expectedDischarge,
      stayType,
      accommodationId,
      packageId,
      offPackageServiceIds,
      sourceInquiryId
    } = req.body;

    const cleanPatient = cleanPlainText(patient);
    const cleanContact = cleanPlainText(contact);
    const cleanPhone = cleanPlainText(phone);

    if (!cleanPatient || !cleanContact || !cleanPhone || !admissionDate) {
      return errorResponse(res, 'Patient name, contact, phone, and admission date are required', 400);
    }

    const isStaying = stayType === 'staying';
    if (isStaying && !accommodationId) {
      return errorResponse(res, 'Assigned room or bed is required for staying patients', 400);
    }

    if (isStaying && accommodationId) {
      // Check if accommodation is already occupied by an active admission
      const alreadyOccupied = await prisma.admission.findFirst({
        where: {
          status: 'Admitted',
          stayType: 'staying',
          accommodationId
        }
      });
      if (alreadyOccupied) {
        return errorResponse(res, `Accommodation ${accommodationId} is already occupied by ${alreadyOccupied.patient}`, 409);
      }
    }

    const admissionId = id || `ADM-${String(Date.now()).slice(-5)}`;
    const newAdmission = await prisma.admission.create({
      data: {
        id: admissionId,
        patient: cleanPatient,
        age: age ? Number(age) : null,
        gender: gender || 'Female',
        contact: cleanContact,
        phone: cleanPhone,
        address: address ? cleanPlainText(address) : null,
        need: need ? cleanPlainText(need) : null,
        language: language || 'English',
        currentLocation: currentLocation || 'At home',
        roomPreference: roomPreference || 'No preference',
        admissionDate,
        expectedDischarge: expectedDischarge || null,
        stayType: isStaying ? 'staying' : 'non-staying',
        accommodationId: isStaying ? accommodationId : null,
        packageId: packageId || null,
        offPackageServiceIds: JSON.stringify(Array.isArray(offPackageServiceIds) ? offPackageServiceIds : []),
        sourceInquiryId: sourceInquiryId || null,
        status: 'Admitted'
      }
    });

    // If converted from inquiry, update inquiry status
    if (sourceInquiryId) {
      await prisma.inquiry.updateMany({
        where: { id: sourceInquiryId },
        data: { status: 'Admitted' }
      });
    }

    // Auto-create initial billing profile
    const offPackages = Array.isArray(offPackageServiceIds) ? offPackageServiceIds : [];
    await prisma.billingProfile.create({
      data: {
        id: `bill-${admissionId}`,
        admissionId,
        start: admissionDate,
        end: expectedDischarge || admissionDate,
        packageId: packageId || null,
        packageDiscountType: 'percent',
        packageDiscount: 0,
        addOns: JSON.stringify(
          offPackages.map((svcId, idx) => ({
            id: `addon-${svcId}-${idx}`,
            serviceId: svcId,
            start: admissionDate,
            end: expectedDischarge || admissionDate,
            qty: 1,
            discountType: 'percent',
            discount: 0
          }))
        ),
        customLines: JSON.stringify([]),
        globalType: 'percent',
        globalDiscount: 0,
        tax: 0
      }
    });

    // Add initial admission care timeline note
    await prisma.residentProgress.create({
      data: {
        id: `prog-${Date.now().toString(16).slice(-6)}`,
        admissionId,
        author: 'Admissions Desk',
        status: 'Admitted',
        category: 'Care plan',
        note: `Patient admitted under ${packageId ? 'package' : 'custom plan'}. Placed in ${isStaying ? accommodationId : 'Non-staying attendance'}.`
      }
    });

    const enriched = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: {
        billingProfile: true,
        payments: true,
        progressRecords: true
      }
    });

    const parsed = {
      ...enriched,
      offPackageServiceIds: parseJsonSafe(enriched.offPackageServiceIds, []),
      billingProfile: enriched.billingProfile
        ? {
            ...enriched.billingProfile,
            addOns: parseJsonSafe(enriched.billingProfile.addOns, []),
            customLines: parseJsonSafe(enriched.billingProfile.customLines, [])
          }
        : null
    };

    return successResponse(res, parsed, 'Patient admitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      patient,
      age,
      gender,
      contact,
      phone,
      address,
      need,
      language,
      currentLocation,
      roomPreference,
      admissionDate,
      expectedDischarge,
      stayType,
      accommodationId,
      packageId,
      offPackageServiceIds
    } = req.body;

    const existing = await prisma.admission.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Admission not found with id: ${id}`, 404);
    }

    const isStaying = (stayType !== undefined ? stayType : existing.stayType) === 'staying';
    const targetAccId = isStaying ? (accommodationId !== undefined ? accommodationId : existing.accommodationId) : null;

    if (isStaying && targetAccId) {
      const alreadyOccupied = await prisma.admission.findFirst({
        where: {
          id: { not: id },
          status: 'Admitted',
          stayType: 'staying',
          accommodationId: targetAccId
        }
      });
      if (alreadyOccupied) {
        return errorResponse(res, `Accommodation ${targetAccId} is already occupied by ${alreadyOccupied.patient}`, 409);
      }
    }

    const updated = await prisma.admission.update({
      where: { id },
      data: {
        ...(patient && { patient: cleanPlainText(patient) }),
        ...(age !== undefined && { age: age ? Number(age) : null }),
        ...(gender && { gender }),
        ...(contact && { contact: cleanPlainText(contact) }),
        ...(phone && { phone: cleanPlainText(phone) }),
        ...(address !== undefined && { address: cleanPlainText(address) }),
        ...(need !== undefined && { need: cleanPlainText(need) }),
        ...(language && { language }),
        ...(currentLocation && { currentLocation }),
        ...(roomPreference && { roomPreference }),
        ...(admissionDate && { admissionDate }),
        ...(expectedDischarge !== undefined && { expectedDischarge }),
        stayType: isStaying ? 'staying' : 'non-staying',
        accommodationId: targetAccId,
        ...(packageId !== undefined && { packageId }),
        ...(offPackageServiceIds !== undefined && {
          offPackageServiceIds: JSON.stringify(Array.isArray(offPackageServiceIds) ? offPackageServiceIds : [])
        })
      },
      include: {
        billingProfile: true,
        payments: true,
        progressRecords: true
      }
    });

    const parsed = {
      ...updated,
      offPackageServiceIds: parseJsonSafe(updated.offPackageServiceIds, []),
      billingProfile: updated.billingProfile
        ? {
            ...updated.billingProfile,
            addOns: parseJsonSafe(updated.billingProfile.addOns, []),
            customLines: parseJsonSafe(updated.billingProfile.customLines, [])
          }
        : null
    };

    return successResponse(res, parsed, 'Admission updated successfully');
  } catch (err) {
    next(err);
  }
};

export const dischargePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actualDischarge, dischargeSummary } = req.body;

    const admission = await prisma.admission.findUnique({
      where: { id },
      include: {
        billingProfile: true,
        payments: true
      }
    });

    if (!admission) {
      return errorResponse(res, `Admission not found with id: ${id}`, 404);
    }
    if (admission.status === 'Discharged') {
      return errorResponse(res, 'Patient is already discharged', 400);
    }

    const cleanSummary = cleanPlainText(dischargeSummary);
    if (!cleanSummary) {
      return errorResponse(res, 'Discharge summary note is required', 400);
    }

    const dischargeDate = actualDischarge || new Date().toISOString().slice(0, 10);

    // Fetch care packages & services for financial verification
    const carePackages = await prisma.package.findMany();
    const services = await prisma.service.findMany();

    const parsedPackages = carePackages.map(p => ({
      ...p,
      benefits: parseJsonSafe(p.benefits, []),
      serviceIds: parseJsonSafe(p.serviceIds, [])
    }));
    const parsedServices = services.map(s => ({
      ...s,
      benefits: parseJsonSafe(s.benefits, []),
      images: parseJsonSafe(s.images, [])
    }));

    const totalPaid = admission.payments.reduce((sum, p) => sum + p.amount, 0);
    const profile = advanceBillingProfile(admission, admission.billingProfile, dischargeDate);
    const calculatedBill = calculatePatientBill(
      admission,
      profile,
      parsedPackages,
      parsedServices,
      totalPaid
    );

    if (calculatedBill.due > 0.01) {
      return errorResponse(
        res,
        `Cannot discharge: Outstanding balance of ₹${calculatedBill.due.toFixed(2)} must be cleared first.`,
        400,
        { bill: calculatedBill }
      );
    }

    // Update billing profile end date to discharge date
    if (admission.billingProfile) {
      await prisma.billingProfile.update({
        where: { admissionId: id },
        data: {
          end: dischargeDate,
          addOns: JSON.stringify(profile.addOns || []),
          customLines: JSON.stringify(profile.customLines || [])
        }
      });
    }

    // Log discharge progress note
    await prisma.residentProgress.create({
      data: {
        id: `prog-${Date.now().toString(16).slice(-6)}`,
        admissionId: id,
        author: 'Admissions Administrator',
        status: 'Discharged',
        category: 'Discharge',
        note: cleanSummary
      }
    });

    const updated = await prisma.admission.update({
      where: { id },
      data: {
        status: 'Discharged',
        actualDischarge: dischargeDate,
        dischargeSummary: cleanSummary,
        finalBill: JSON.stringify(calculatedBill)
      },
      include: {
        billingProfile: true,
        payments: true,
        progressRecords: true
      }
    });

    const parsed = {
      ...updated,
      offPackageServiceIds: parseJsonSafe(updated.offPackageServiceIds, []),
      finalBill: calculatedBill,
      billingProfile: updated.billingProfile
        ? {
            ...updated.billingProfile,
            addOns: parseJsonSafe(updated.billingProfile.addOns, []),
            customLines: parseJsonSafe(updated.billingProfile.customLines, [])
          }
        : null
    };

    return successResponse(res, parsed, 'Patient discharged and archived successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.admission.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Admission not found with id: ${id}`, 404);
    }

    await prisma.admission.delete({ where: { id } });
    return successResponse(res, { id }, 'Admission record deleted successfully');
  } catch (err) {
    next(err);
  }
};
