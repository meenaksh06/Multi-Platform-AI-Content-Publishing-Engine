const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

// Mock Prisma Client
jest.mock('../src/config/db', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock BullMQ
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
  })),
  Worker: jest.fn()
}));

describe('App & Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Health Check Test
  test('GET /health should return 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('healthy');
  });

  // 2. Validation Test (Zod Error handling)
  test('POST /api/auth/register should return 400 for invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('Validation Error');
  });

  // 3. Register Success Test
  test('POST /api/auth/register should return 201 for valid data', async () => {
    // Mock user doesn't exist
    prisma.user.findUnique.mockResolvedValue(null);
    // Mock user creation
    prisma.user.create.mockResolvedValue({
      id: 'uuid-1234',
      email: 'test@example.com',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.tokens).toHaveProperty('accessToken');
    expect(res.body.data.tokens).toHaveProperty('refreshToken');
  });

  // 4. Auth Middleware Test (No Token)
  test('GET /api/users/me should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe('Please authenticate');
  });

  // 5. Auth Middleware Test (Invalid Token)
  test('GET /api/users/me should return 401 for an invalid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid.token.string');

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe('Invalid or expired token');
  });
});
