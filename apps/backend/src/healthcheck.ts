/**
 * Health check script for monitoring deployment
 * Tests if the application is running and responding
 */

import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const healthCheck = http.request(options, res => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', error => {
  console.error('Health check failed:', error.message);
  process.exit(1);
});

healthCheck.on('timeout', () => {
  console.error('Health check timed out');
  healthCheck.destroy();
  process.exit(1);
});

healthCheck.end();
