'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('GET /', () => {
  it('returns 200 with a running message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/running/i);
  });
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('includes a timestamp in the response', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('timestamp');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});

describe('POST /echo', () => {
  it('echoes back the request body', async () => {
    const payload = { hello: 'world', count: 42 };
    const res = await request(app).post('/echo').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ echo: payload });
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app)
      .post('/echo')
      .set('Content-Type', 'application/json')
      .send('{}');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when no body is sent', async () => {
    const res = await request(app)
      .post('/echo')
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
  });

  it('handles nested objects', async () => {
    const payload = { nested: { a: 1, b: [2, 3] } };
    const res = await request(app).post('/echo').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.echo).toEqual(payload);
  });
});

describe('404 catch-all', () => {
  it('returns 404 for unknown GET routes', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not found');
  });

  it('returns 404 for unknown POST routes', async () => {
    const res = await request(app).post('/unknown').send({ x: 1 });
    expect(res.status).toBe(404);
  });
});
