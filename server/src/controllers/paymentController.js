import { prisma } from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { cleanPlainText } from '../utils/sanitize.js';

export const getPaymentsByAdmission = async (req, res, next) => {
  try {
    const { admissionId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { admissionId },
      orderBy: { at: 'desc' }
    });
    return successResponse(
      res,
      payments,
      'Payments retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { admissionId, amount, note, notes, method, at } = req.body;
    const paymentAmount = Number(amount);

    if (!admissionId || !paymentAmount || paymentAmount <= 0) {
      return errorResponse(res, 'Valid admission ID and positive amount are required', 400);
    }

    const admission = await prisma.admission.findUnique({ where: { id: admissionId } });
    if (!admission) {
      return errorResponse(res, `Admission not found with id: ${admissionId}`, 404);
    }

    const id = `PAY-${admissionId.replace('ADM-', '')}-${Date.now().toString().slice(-4)}`;
    const newPayment = await prisma.payment.create({
      data: {
        id,
        admissionId,
        amount: paymentAmount,
        note: cleanPlainText(note || notes || 'Payment received'),
        method: method || 'UPI',
        at: at ? new Date(at) : new Date()
      }
    });

    return successResponse(
      res,
      { ...newPayment, receiptNo: `REC-${newPayment.id}` },
      'Payment recorded successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Payment not found with id: ${id}`, 404);
    }

    await prisma.payment.delete({ where: { id } });
    return successResponse(res, null, 'Payment record deleted successfully');
  } catch (err) {
    next(err);
  }
};
