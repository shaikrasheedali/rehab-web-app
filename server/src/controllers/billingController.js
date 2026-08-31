import { prisma } from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { parseJsonSafe, currentISODate, inclusiveDays } from '../utils/dateUtils.js';
import {
  advanceBillingProfile,
  calculatePatientBill,
  makeBillingProfile,
  normalizeBillingProfile
} from '../utils/billingCalculator.js';

const getCatalogAndPackages = async () => {
  const [packages, services] = await Promise.all([
    prisma.package.findMany(),
    prisma.service.findMany()
  ]);
  const parsedPackages = packages.map(p => ({
    ...p,
    benefits: parseJsonSafe(p.benefits, []),
    serviceIds: parseJsonSafe(p.serviceIds, [])
  }));
  const parsedServices = services.map(s => ({
    ...s,
    benefits: parseJsonSafe(s.benefits, []),
    images: parseJsonSafe(s.images, [])
  }));
  return { packages: parsedPackages, services: parsedServices };
};

export const getBillingByAdmission = async (req, res, next) => {
  try {
    const { admissionId } = req.params;
    const { through } = req.query;

    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: {
        billingProfile: true,
        payments: true
      }
    });

    if (!admission) {
      return errorResponse(res, `Admission not found with id: ${admissionId}`, 404);
    }

    const { packages, services } = await getCatalogAndPackages();
    const throughDate = through || admission.actualDischarge || currentISODate();

    let profile = admission.billingProfile;
    if (!profile) {
      profile = makeBillingProfile(admission, throughDate);
    } else {
      profile = normalizeBillingProfile(admission, profile, throughDate);
    }

    // Populate addOn names and rates if empty
    if (Array.isArray(profile.addOns)) {
      const start = profile.start || profile.billFrom || admission.admissionDate;
      const end = profile.end || profile.billTo || throughDate;
      profile.addOns = profile.addOns.map(a => {
        const svc = services.find(s => s.id === a.serviceId);
        return {
          ...a,
          name: a.name || svc?.name || 'Add-on service',
          rate: a.rate !== undefined && a.rate > 0 ? a.rate : (svc?.rate || 0),
          days: a.days !== undefined ? Number(a.days) : inclusiveDays(a.start || start, a.end || end, start, end)
        };
      });
    }

    // Populate package details if empty
    if (profile.packageId) {
      const pkg = packages.find(p => p.id === profile.packageId);
      if (pkg) {
        if (!profile.packageName) profile.packageName = pkg.name;
        if (!profile.packageRate) profile.packageRate = pkg.rate;
      }
    }

    const totalPaid = admission.payments.reduce((sum, p) => sum + p.amount, 0);
    const bill = calculatePatientBill(admission, profile, packages, services, totalPaid);

    return successResponse(
      res,
      {
        admission,
        profile: {
          ...profile,
          addOns: parseJsonSafe(profile.addOns, []),
          customLines: parseJsonSafe(profile.customLines, [])
        },
        bill,
        payments: admission.payments
      },
      'Billing profile and calculation retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const saveBillingProfile = async (req, res, next) => {
  try {
    const { admissionId } = req.params;
    const incoming = req.body;

    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { payments: true }
    });

    if (!admission) {
      return errorResponse(res, `Admission not found with id: ${admissionId}`, 404);
    }

    const { packages, services } = await getCatalogAndPackages();

    const start = incoming.start || incoming.billFrom || admission.admissionDate;
    const end = incoming.end || incoming.billTo || currentISODate();
    const packageDiscountType = incoming.packageDiscountType || 'percent';
    const packageDiscount = Number(incoming.packageDiscount || 0);
    const globalType = incoming.globalType || (incoming.discountType === 'fixed' ? 'fixed' : 'percent');
    const globalDiscount = Number(incoming.globalDiscount !== undefined ? incoming.globalDiscount : (incoming.discountValue || 0));
    const discountType = incoming.discountType || (globalType === 'fixed' ? 'fixed' : 'percentage');
    const discountValue = Number(incoming.discountValue !== undefined ? incoming.discountValue : globalDiscount);
    const tax = Number(incoming.tax !== undefined ? incoming.tax : (incoming.taxPercent || 0));
    const taxPercent = Number(incoming.taxPercent !== undefined ? incoming.taxPercent : tax);
    const packageName = incoming.packageName || '';
    const packageRate = incoming.packageRate !== undefined ? Number(incoming.packageRate) : 0;

    const addOns = Array.isArray(incoming.addOns) ? incoming.addOns : [];
    const customLines = Array.isArray(incoming.customLines) ? incoming.customLines : [];

    const updatedProfile = await prisma.billingProfile.upsert({
      where: { admissionId },
      create: {
        id: `BILL-${admissionId}`,
        admissionId,
        start,
        end,
        packageId: incoming.packageId || null,
        packageDiscountType,
        packageDiscount,
        addOns: JSON.stringify(addOns),
        customLines: JSON.stringify(customLines),
        globalType,
        globalDiscount,
        tax
      },
      update: {
        start,
        end,
        packageId: incoming.packageId || null,
        packageDiscountType,
        packageDiscount,
        addOns: JSON.stringify(addOns),
        customLines: JSON.stringify(customLines),
        globalType,
        globalDiscount,
        tax
      }
    });

    const parsedProfile = {
      ...updatedProfile,
      start,
      end,
      billFrom: start,
      billTo: end,
      packageName,
      packageRate,
      packageDiscountType,
      packageDiscount,
      discountType,
      discountValue,
      globalType,
      globalDiscount,
      tax,
      taxPercent,
      addOns: parseJsonSafe(updatedProfile.addOns, []),
      customLines: parseJsonSafe(updatedProfile.customLines, [])
    };

    const totalPaid = admission.payments.reduce((sum, p) => sum + p.amount, 0);
    const bill = calculatePatientBill(admission, parsedProfile, packages, services, totalPaid);

    return successResponse(
      res,
      {
        profile: parsedProfile,
        bill,
        payments: admission.payments
      },
      'Billing profile saved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const previewBill = async (req, res, next) => {
  try {
    const { admissionId, profile: customProfile, through } = req.body;
    let admission = null;
    let totalPaid = 0;

    if (admissionId) {
      admission = await prisma.admission.findUnique({
        where: { id: admissionId },
        include: { payments: true }
      });
      if (admission) {
        totalPaid = admission.payments.reduce((sum, p) => sum + p.amount, 0);
      }
    }

    const { packages, services } = await getCatalogAndPackages();
    const effectiveProfile = normalizeBillingProfile(admission, customProfile, through || currentISODate());
    const bill = calculatePatientBill(admission, effectiveProfile, packages, services, totalPaid);

    return successResponse(
      res,
      {
        profile: effectiveProfile,
        bill
      },
      'Bill preview computed successfully'
    );
  } catch (err) {
    next(err);
  }
};
