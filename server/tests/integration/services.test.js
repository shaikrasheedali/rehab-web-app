import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('Services API Integration Tests', () => {
  let createdServiceId = '';

  test('GET /api/services returns list of catalog services', async () => {
    const res = await request(app).get('/api/services');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/services?kind=in-package filters in-package services', async () => {
    const res = await request(app).get('/api/services?kind=in-package');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every(s => s.kind === 'in-package')).toBe(true);
  });

  test('POST /api/services creates a new service', async () => {
    const payload = {
      name: 'Integration Test Physiotherapy',
      kind: 'off-package',
      rate: 1200,
      summary: 'Specialized test therapy session',
      benefits: ['Guided exercise', 'Post-test review'],
      images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d'],
      active: true
    };
    const res = await request(app).post('/api/services').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(payload.name);
    createdServiceId = res.body.data.id;
  });

  test('GET /api/services/:id retrieves the created service', async () => {
    const res = await request(app).get(`/api/services/${createdServiceId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(createdServiceId);
  });

  test('PUT /api/services/:id updates service attributes', async () => {
    const res = await request(app)
      .put(`/api/services/${createdServiceId}`)
      .send({ rate: 1350, summary: 'Updated summary note' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.rate).toBe(1350);
  });

  test('DELETE /api/services/:id deletes the test service', async () => {
    const res = await request(app).delete(`/api/services/${createdServiceId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
