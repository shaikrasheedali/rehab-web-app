import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('Uploads API Integration Tests', () => {
  test('POST /api/uploads/single uploads a buffer file', async () => {
    const dummyImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post('/api/uploads/single?category=services')
      .attach('file', dummyImageBuffer, 'test-image.png');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toContain('/uploads/services/');
  });

  test('POST /api/uploads/single without file returns 400 error', async () => {
    const res = await request(app).post('/api/uploads/single');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
