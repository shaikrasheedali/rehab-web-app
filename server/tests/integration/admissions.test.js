import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('Admissions & Clinical Flow Integration Tests', () => {
  let createdAdmissionId = '';

  test('GET /api/admissions returns active admissions', async () => {
    const res = await request(app).get('/api/admissions');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/admissions registers a new admission', async () => {
    const payload = {
      patient: 'Srinivas Murthy',
      age: 65,
      gender: 'Male',
      contact: 'Rajesh Murthy',
      phone: '+91 98480 88888',
      address: 'Khammam Central',
      need: 'Post-stroke balance and mobility recovery',
      admissionDate: '2026-08-25',
      expectedDischarge: '2026-08-30',
      stayType: 'staying',
      accommodationId: 'ROOM-102',
      packageId: 'pkg-recovery',
      offPackageServiceIds: ['svc-neuro']
    };

    const res = await request(app).post('/api/admissions').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.patient).toBe(payload.patient);
    createdAdmissionId = res.body.data.id;
  });

  test('POST /api/progress logs a clinical note', async () => {
    const res = await request(app).post('/api/progress').send({
      admissionId: createdAdmissionId,
      author: 'Dr. Kavya',
      status: 'On track',
      category: 'Mobility',
      note: 'Assisted walk accomplished without pain'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.admissionId).toBe(createdAdmissionId);
  });

  test('GET /api/billing/admission/:id returns computed bill', async () => {
    const res = await request(app).get(`/api/billing/admission/${createdAdmissionId}?through=2026-08-30`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.bill.days).toBe(6); // 25 Aug to 30 Aug inclusive
    expect(res.body.data.bill.subtotal).toBeGreaterThan(0);
    expect(res.body.data.bill.due).toBeGreaterThan(0);
  });

  test('POST /api/admissions/:id/discharge blocks discharge when due > 0', async () => {
    const res = await request(app)
      .post(`/api/admissions/${createdAdmissionId}/discharge`)
      .send({
        actualDischarge: '2026-08-30',
        dischargeSummary: 'Patient improved significantly'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Outstanding balance');
  });

  test('POST /api/payments records full settlement and allows discharge', async () => {
    // 1. Get current due
    const billRes = await request(app).get(`/api/billing/admission/${createdAdmissionId}?through=2026-08-30`);
    const dueAmount = billRes.body.data.bill.due;

    // 2. Pay the exact due amount
    const payRes = await request(app).post('/api/payments').send({
      admissionId: createdAdmissionId,
      amount: dueAmount,
      method: 'UPI',
      note: 'Full final settlement'
    });
    expect(payRes.statusCode).toBe(201);

    // 3. Discharge now succeeds
    const dischargeRes = await request(app)
      .post(`/api/admissions/${createdAdmissionId}/discharge`)
      .send({
        actualDischarge: '2026-08-30',
        dischargeSummary: 'Patient achieved recovery goals and is fit for home transfer.'
      });
    expect(dischargeRes.statusCode).toBe(200);
    expect(dischargeRes.body.data.status).toBe('Discharged');
  });

  test('DELETE /api/admissions/:id cleans up test admission', async () => {
    const res = await request(app).delete(`/api/admissions/${createdAdmissionId}`);
    expect(res.statusCode).toBe(200);
  });
});
