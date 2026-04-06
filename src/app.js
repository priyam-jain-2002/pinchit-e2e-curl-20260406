'use strict';

const express = require('express');

const app = express();

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

/** GET /health  – liveness probe */
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/** GET /  – root */
app.get('/', (_req, res) => {
  res.status(200).json({ message: 'pinchit-e2e-curl is running' });
});

/** POST /echo  – echo the request body back */
app.post('/echo', (req, res) => {
  const body = req.body;
  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ error: 'Request body must not be empty' });
  }
  res.status(200).json({ echo: body });
});

/** 404 catch-all */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Server ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

/* istanbul ignore next */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app; // exported for Supertest
