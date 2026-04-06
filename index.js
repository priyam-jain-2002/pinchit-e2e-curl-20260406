'use strict';

const express = require('express');

const app = express();
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from pinchit-e2e-curl-20260406' });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Only start listening when run directly (not when required by tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
