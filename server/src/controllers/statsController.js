import { prisma } from '../config/prisma.js';
import { successResponse } from '../utils/responseHelper.js';
import { parseJsonSafe } from '../utils/dateUtils.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      activeAdmissionsCount,
      dischargedAdmissionsCount,
      allAccommodations,
      openInquiriesCount,
      inquiriesByStatus,
      payments,
      recentAdmissions
    ] = await Promise.all([
      prisma.admission.count({ where: { status: 'Admitted' } }),
      prisma.admission.count({ where: { status: 'Discharged' } }),
      prisma.accommodation.findMany(),
      prisma.inquiry.count({ where: { status: { not: 'Admitted' } } }),
      prisma.inquiry.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true }
      }),
      prisma.admission.findMany({
        where: { status: 'Admitted' },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate accommodation occupancy
    const occupiedStaying = await prisma.admission.findMany({
      where: {
        status: 'Admitted',
        stayType: 'staying',
        accommodationId: { not: null }
      },
      select: { accommodationId: true }
    });

    const occupiedIds = new Set(occupiedStaying.map(a => a.accommodationId));
    const totalUnits = allAccommodations.length;
    const occupiedUnits = allAccommodations.filter(a => occupiedIds.has(a.id)).length;
    const availableUnits = totalUnits - occupiedUnits;

    const stats = {
      activePatients: activeAdmissionsCount,
      dischargedPatients: dischargedAdmissionsCount,
      totalAccommodations: totalUnits,
      occupiedAccommodations: occupiedUnits,
      availableAccommodations: availableUnits,
      roomsCount: allAccommodations.filter(a => a.type === 'Room').length,
      bedsCount: allAccommodations.filter(a => a.type === 'Bed').length,
      openInquiries: openInquiriesCount,
      inquiryBreakdown: inquiriesByStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
      }, {}),
      totalRevenueCollected: payments._sum.amount || 0,
      recentAdmissions: recentAdmissions.map(a => ({
        ...a,
        offPackageServiceIds: parseJsonSafe(a.offPackageServiceIds, [])
      }))
    };

    return successResponse(res, stats, 'Dashboard stats retrieved successfully');
  } catch (err) {
    next(err);
  }
};
