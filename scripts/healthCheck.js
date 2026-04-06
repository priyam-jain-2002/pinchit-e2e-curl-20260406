'use strict';

/**
 * healthCheck.js
 *
 * Polls localhost:3000/health every 5 minutes (300 000 ms).
 * Logs the HTTP status code and response body on each attempt.
 * On network error it logs the error message and continues polling.
 */

const http = require('http');

const TARGET_HOST = process.env.HEALTH_HOST || 'localhost';
const TARGET_PORT = parseInt(process.env.HEALTH_PORT || '3000', 10);
const TARGET_PATH = process.env.HEALTH_PATH || '/health';
const INTERVAL_MS = parseInt(process.env.HEALTH_INTERVAL_MS || String(5 * 60 * 1000), 10);

/**
 * Perform a single HTTP GET request to the health endpoint.
 * Returns a Promise that resolves with { statusCode, body } or rejects on error.
 *
 * @returns {Promise<{statusCode: number, body: string}>}
 */
function checkHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: TARGET_PATH,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

/**
 * Run one health-check cycle and log the result.
 */
async function runCheck() {
  try {
    const { statusCode, body } = await checkHealth();
    console.log(`[health-check] ${new Date().toISOString()} status=${statusCode} body=${body}`);
  } catch (err) {
    console.error(`[health-check] ${new Date().toISOString()} ERROR: ${err.message}`);
  }
}

/* istanbul ignore next */
if (require.main === module) {
  console.log(`[health-check] Starting – polling ${TARGET_HOST}:${TARGET_PORT}${TARGET_PATH} every ${INTERVAL_MS / 1000}s`);
  runCheck(); // immediate first check
  setInterval(runCheck, INTERVAL_MS);
}

module.exports = { checkHealth, runCheck, INTERVAL_MS, TARGET_HOST, TARGET_PORT, TARGET_PATH };
