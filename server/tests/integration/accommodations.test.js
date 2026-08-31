import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

const app = createApp();

describe('Accommodations API Integration Tests', () => {
  const testAccId = 'TEST-ROOM-99';

  afterAll(async () => {
    await prisma.accommodation.deleteMany({
      where: { id: testAccId }
    });
  });

  test('GET /api/accommodations returns accommodation units with occupancy metadata', async () => {
    const res = await request(app).get('/api/accommodations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const first = res.body.data[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('isOccupied');
      expect(typeof first.isOccupied).toBe('boolean');
    }
  });

  test('POST /api/accommodations creates a new room unit', async () => {
    const payload = {
      id: testAccId,
      label: 'Test Executive Room (2nd Floor)',
      type: 'Room'
    };

    const res = await request(app)
      .post('/api/accommodations')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testAccId);
    expect(res.body.data.label).toBe('Test Executive Room (2nd Floor)');
  });

  test('PUT /api/accommodations/:id updates unit attributes', async () => {
    const updatePayload = {
      label: 'Updated Test Room Suite (3rd Floor)'
    };

    const res = await request(app)
      .put(`/api/accommodations/${testAccId}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.label).toBe('Updated Test Room Suite (3rd Floor)');
  });

  test('DELETE /api/accommodations/:id removes the unit', async () => {
    const res = await request(app).delete(`/api/accommodations/${testAccId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app).get('/api/accommodations');
    expect(check.body.data.some(x => x.id === testAccId)).toBe(false);
  });
});
