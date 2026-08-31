import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('System Health & Smoke Tests', () => {
  test('GET /api/health responds with healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('Sri Thirumala Care Clinical API');
  });

  test('GET /api/stats/dashboard returns complete KPI structure', async () => {
    const res = await request(app).get('/api/stats/dashboard');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('activePatients');
    expect(res.body.data).toHaveProperty('totalAccommodations');
    expect(res.body.data).toHaveProperty('availableAccommodations');
    expect(res.body.data).toHaveProperty('openInquiries');
  });

  test('GET /api/openapi.json serves valid OpenAPI specification', async () => {
    const res = await request(app).get('/api/openapi.json');
    expect(res.statusCode).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toContain('Sri Thirumala');
  });

  test('GET /api/non-existent-route returns 404', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
