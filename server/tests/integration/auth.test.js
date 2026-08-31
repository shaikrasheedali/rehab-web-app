import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';
import { hashPassword } from '../../src/utils/authUtils.js';

const app = createApp();
jest.setTimeout(30000);

describe('Admin Authentication & Session API Integration Tests (Argon2id)', () => {
  const testUsername = 'testadmin';
  const testPassword = 'SecureAdminPassword!2026';
  let token = '';

  beforeAll(async () => {
    await prisma.adminUser.deleteMany({ where: { username: testUsername } });
    const passwordHash = await hashPassword(testPassword);
    await prisma.adminUser.create({
      data: {
        id: 'ADM-TEST-99',
        username: testUsername,
        passwordHash,
        name: 'Test Administrator',
        role: 'ADMIN',
        active: true
      }
    });
  });

  afterAll(async () => {
    await prisma.adminUser.deleteMany({ where: { username: testUsername } });
  });

  test('POST /api/auth/login with valid credentials returns JWT token and user info', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUsername,
        password: testPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.username).toBe(testUsername);
    token = res.body.data.token;
  });

  test('POST /api/auth/login with wrong password fails with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUsername,
        password: 'WrongPassword123'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me returns authenticated admin user session', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe(testUsername);
  });

  test('GET /api/auth/me without token fails with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/logout ends the session', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
