import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

const app = createApp();

describe('Billing API Integration Tests', () => {
  let testAdmissionId;

  beforeAll(async () => {
    const adm = await prisma.admission.create({
      data: {
        id: 'ADM-BILL-TEST',
        patient: 'Billing Test Patient',
        contact: 'Family Test',
        phone: '+91 99999 22222',
        admissionDate: '2026-08-01',
        packageId: 'pkg-recovery',
        status: 'Admitted',
        stayType: 'non-staying'
      }
    });
    testAdmissionId = adm.id;
  });

  afterAll(async () => {
    await prisma.billingProfile.deleteMany({
      where: { admissionId: testAdmissionId }
    });
    await prisma.payment.deleteMany({
      where: { admissionId: testAdmissionId }
    });
    await prisma.admission.deleteMany({
      where: { id: testAdmissionId }
    });
  });

  test('GET /api/billing/admission/:admissionId returns initial calculated bill', async () => {
    const res = await request(app)
      .get(`/api/billing/admission/${testAdmissionId}?through=2026-08-30`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('profile');
    expect(res.body.data).toHaveProperty('bill');
    expect(res.body.data.bill.days).toBe(30);
    expect(res.body.data.bill.total).toBeGreaterThan(0);
  });

  test('POST /api/billing/admission/:admissionId updates profile and custom lines', async () => {
    const profileUpdate = {
      start: '2026-08-01',
      end: '2026-08-30',
      packageId: 'pkg-recovery',
      packageRate: 5000,
      customLines: [
        {
          id: 'custom-lab-1',
          description: 'Specialist Blood Tests',
          amount: 2500,
          type: 'fixed'
        }
      ],
      discountType: 'percentage',
      discountValue: 10,
      taxPercent: 5
    };

    const res = await request(app)
      .post(`/api/billing/admission/${testAdmissionId}`)
      .send(profileUpdate);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bill.subtotal).toBeGreaterThan(0);
    expect(res.body.data.bill.discountAmount).toBeGreaterThan(0);
    expect(res.body.data.bill.taxAmount).toBeGreaterThan(0);
  });

  test('POST /api/billing/preview calculates draft without persisting', async () => {
    const previewPayload = {
      profile: {
        start: '2026-08-01',
        end: '2026-08-15',
        packageRate: 4000,
        addOns: [],
        customLines: []
      }
    };

    const res = await request(app)
      .post('/api/billing/preview')
      .send(previewPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bill.days).toBe(15);
    expect(res.body.data.bill.total).toBe(60000);
  });
});
