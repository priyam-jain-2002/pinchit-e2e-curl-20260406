'use strict';

const request = require('supertest');
const app = require('../index');

// ─── Root route ──────────────────────────────────────────────────────────────

describe('GET /', () => {
  test('smoke test: returns 200 with expected message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Hello from pinchit-e2e-curl-20260406' });
  });

  test('response Content-Type is application/json', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

// ─── Health route ─────────────────────────────────────────────────────────────

describe('GET /health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('response Content-Type is application/json', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

// ─── 404 catch-all ───────────────────────────────────────────────────────────

describe('Unknown routes', () => {
  test('GET /unknown returns 404 with error body', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });

  test('POST /health returns 404 (method not defined)', async () => {
    const res = await request(app).post('/health').send({ foo: 'bar' });
    expect(res.status).toBe(404);
  });

  test('DELETE / returns 404', async () => {
    const res = await request(app).delete('/');
    expect(res.status).toBe(404);
  });
});

// ─── Edge cases ──────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  test('malformed JSON body on POST does not crash the server', async () => {
    const res = await request(app)
      .post('/')
      .set('Content-Type', 'application/json')
      .send('{ bad json }');
    // Express returns 400 for malformed JSON; server must not crash (5xx)
    expect(res.status).toBeLessThan(500);
  });

  test('very long URL path returns 404, not 500', async () => {
    const longPath = '/a'.repeat(500);
    const res = await request(app).get(longPath);
    expect(res.status).toBe(404);
  });

  test('query parameters on /health are ignored gracefully', async () => {
    const res = await request(app).get('/health?foo=bar&baz=1');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
