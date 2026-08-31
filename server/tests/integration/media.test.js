import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('Media & Blog API Integration Tests', () => {
  let createdMediaId = '';

  test('GET /api/media returns media items list', async () => {
    const res = await request(app).get('/api/media');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/media publishes a new blog article', async () => {
    const payload = {
      section: 'blog',
      subtype: 'article',
      title: 'Integration Test Article on Stroke Recovery',
      excerpt: 'Comprehensive guidance on early therapy milestones.',
      caption: 'Physiotherapy rehabilitation roadmap.',
      content: '<h2>Early Milestones</h2><p>Consistency builds mobility confidence.</p>',
      author: 'Sri Thirumala Care Team',
      images: ['https://images.unsplash.com/photo-1579684385127-1ef15d508118'],
      publishedAt: '2026-08-30',
      active: true
    };
    const res = await request(app).post('/api/media').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe(payload.title);
    createdMediaId = res.body.data.id;
  });

  test('GET /api/media/:id retrieves the published article', async () => {
    const res = await request(app).get(`/api/media/${createdMediaId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(createdMediaId);
  });

  test('PUT /api/media/:id updates the article', async () => {
    const res = await request(app)
      .put(`/api/media/${createdMediaId}`)
      .send({ title: 'Updated Stroke Recovery Guide' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Updated Stroke Recovery Guide');
  });

  test('DELETE /api/media/:id removes the test article', async () => {
    const res = await request(app).delete(`/api/media/${createdMediaId}`);
    expect(res.statusCode).toBe(200);
  });
});
