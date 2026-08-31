import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

const app = createApp();

describe('Payments API Integration Tests', () => {
  let testAdmissionId;
  let testPaymentId;

  beforeAll(async () => {
    const adm = await prisma.admission.create({
      data: {
        id: 'ADM-PAY-TEST',
        patient: 'Payment Test Patient',
        contact: 'Contact Person',
        phone: '+91 99999 33333',
        admissionDate: '2026-08-01',
        status: 'Admitted',
        stayType: 'non-staying'
      }
    });
    testAdmissionId = adm.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({
      where: { admissionId: testAdmissionId }
    });
    await prisma.admission.deleteMany({
      where: { id: testAdmissionId }
    });
  });

  test('POST /api/payments records a patient payment', async () => {
    const payload = {
      admissionId: testAdmissionId,
      amount: 25000,
      method: 'UPI / Bank Transfer',
      notes: 'Initial admission deposit'
    };

    const res = await request(app)
      .post('/api/payments')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(25000);
    expect(res.body.data.receiptNo).toBeDefined();
    testPaymentId = res.body.data.id;
  });

  test('GET /api/payments/admission/:admissionId returns payment history', async () => {
    const res = await request(app).get(`/api/payments/admission/${testAdmissionId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some(x => x.id === testPaymentId)).toBe(true);
  });

  test('DELETE /api/payments/:id removes a payment record', async () => {
    const res = await request(app).delete(`/api/payments/${testPaymentId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app).get(`/api/payments/admission/${testAdmissionId}`);
    expect(check.body.data.some(x => x.id === testPaymentId)).toBe(false);
  });
});
