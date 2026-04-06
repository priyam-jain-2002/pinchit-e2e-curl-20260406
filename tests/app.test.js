'use strict';

/**
 * tests/app.test.js
 *
 * Integration tests for the Node.js HTTP server (index.js).
 * Uses the built-in `http` module + supertest so no extra server
 * process is needed — the app is imported directly.
 */

const supertest = require('supertest');
const app = require('../index');

describe('Node.js App – route tests', () => {
  let request;

  beforeAll(() => {
    // supertest wraps the http.Server; no explicit listen() call needed
    request = supertest(app);
  });

  // ── Happy-path ────────────────────────────────────────────────────────────

  describe('GET /', () => {
    it('returns 200 with the greeting text', async () => {
      const res = await request.get('/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Hello from pinchit-e2e-curl-20260406');
    });
  });

  describe('GET /health', () => {
    it('returns 200 with JSON { status: "ok" }', async () => {
      const res = await request.get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  // ── Edge-cases ────────────────────────────────────────────────────────────

  describe('Unknown routes', () => {
    it('returns 404 for an unknown GET path', async () => {
      const res = await request.get('/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 404 for a POST to /', async () => {
      const res = await request.post('/');
      expect(res.status).toBe(404);
    });

    it('returns 404 for a deeply nested unknown path', async () => {
      const res = await request.get('/a/b/c/d');
      expect(res.status).toBe(404);
    });
  });

  describe('Malformed / edge-case requests', () => {
    it('handles a request with a very long URL gracefully (404)', async () => {
      const longPath = '/' + 'x'.repeat(2048);
      const res = await request.get(longPath);
      expect([404, 400, 414]).toContain(res.status);
    });

    it('handles a request with special characters in the path (404)', async () => {
      const res = await request.get('/path?foo=<script>alert(1)</script>');
      expect(res.status).toBe(404);
    });
  });
});
