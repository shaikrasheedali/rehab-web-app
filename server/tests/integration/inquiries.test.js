import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('Inquiries API Integration Tests', () => {
  let createdInquiryId = '';

  test('GET /api/inquiries returns inquiries list', async () => {
    const res = await request(app).get('/api/inquiries');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/inquiries creates a new patient inquiry', async () => {
    const payload = {
      patient: 'Ramanathan Iyer',
      contact: 'Sita Iyer',
      phone: '+91 98480 99999',
      need: 'Post cardiac surgery rehabilitation',
      duration: '30 days',
      language: 'Telugu',
      room: 'Private room',
      currentLocation: 'Hospital',
      packageId: 'pkg-recovery',
      offPackageServiceIds: ['svc-neuro'],
      basket: ['Supported Recovery', 'Intensive neuro physiotherapy']
    };
    const res = await request(app).post('/api/inquiries').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.patient).toBe(payload.patient);
    expect(res.body.data.status).toBe('New');
    createdInquiryId = res.body.data.id;
  });

  test('GET /api/inquiries/:id returns inquiry details', async () => {
    const res = await request(app).get(`/api/inquiries/${createdInquiryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(createdInquiryId);
  });

  test('PUT /api/inquiries/:id updates status', async () => {
    const res = await request(app)
      .put(`/api/inquiries/${createdInquiryId}`)
      .send({ status: 'Contacted', priority: 'High' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('Contacted');
    expect(res.body.data.priority).toBe('High');
  });

  test('DELETE /api/inquiries/:id deletes inquiry', async () => {
    const res = await request(app).delete(`/api/inquiries/${createdInquiryId}`);
    expect(res.statusCode).toBe(200);
  });
});
