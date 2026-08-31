import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

const app = createApp();

describe('Progress Notes API Integration Tests', () => {
  let testAdmissionId;
  let testProgressId;

  beforeAll(async () => {
    const adm = await prisma.admission.create({
      data: {
        id: 'ADM-PROG-TEST',
        patient: 'Progress Test Patient',
        contact: 'Test Contact',
        phone: '+91 99999 11111',
        admissionDate: '2026-08-01',
        status: 'Admitted',
        stayType: 'non-staying'
      }
    });
    testAdmissionId = adm.id;
  });

  afterAll(async () => {
    await prisma.residentProgress.deleteMany({
      where: { admissionId: testAdmissionId }
    });
    await prisma.admission.deleteMany({
      where: { id: testAdmissionId }
    });
  });

  test('POST /api/progress creates a clinical progress record', async () => {
    const payload = {
      admissionId: testAdmissionId,
      author: 'Dr. Srinivas',
      note: 'Patient walked 25 meters with frame; balance improved.',
      category: 'Therapy & Mobility'
    };

    const res = await request(app)
      .post('/api/progress')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.admissionId).toBe(testAdmissionId);
    expect(res.body.data.author).toBe(payload.author);
    testProgressId = res.body.data.id;
  });

  test('GET /api/progress/admission/:admissionId returns notes for admission', async () => {
    const res = await request(app).get(`/api/progress/admission/${testAdmissionId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some(x => x.id === testProgressId)).toBe(true);
  });

  test('DELETE /api/progress/:id deletes the progress note', async () => {
    const res = await request(app).delete(`/api/progress/${testProgressId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app).get(`/api/progress/admission/${testAdmissionId}`);
    expect(check.body.data.some(x => x.id === testProgressId)).toBe(false);
  });
});
