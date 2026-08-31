import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('Packages API Integration Tests', () => {
  let createdPackageId = '';

  test('GET /api/packages returns packages list', async () => {
    const res = await request(app).get('/api/packages');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/packages creates a care package', async () => {
    const payload = {
      name: 'Integration Test Package',
      rate: 4500,
      benefits: ['All inclusive test care', 'Weekly doctor review'],
      serviceIds: ['svc-nursing', 'svc-room'],
      active: true
    };
    const res = await request(app).post('/api/packages').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe(payload.name);
    createdPackageId = res.body.data.id;
  });

  test('GET /api/packages/:id retrieves package details', async () => {
    const res = await request(app).get(`/api/packages/${createdPackageId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(createdPackageId);
  });

  test('PUT /api/packages/:id updates package details', async () => {
    const res = await request(app)
      .put(`/api/packages/${createdPackageId}`)
      .send({ rate: 4600 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.rate).toBe(4600);
  });

  test('DELETE /api/packages/:id removes test package', async () => {
    const res = await request(app).delete(`/api/packages/${createdPackageId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
