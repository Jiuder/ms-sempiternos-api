const fs = require('fs');
const crypto = require('crypto');

const services = ['auth-service', 'payment-gateway', 'inventory-manager', 'order-processor', 'notification-hub', 'user-profile', 'core-engine'];
const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
const messages = [
  'User login successful',
  'Failed to process payment',
  'Inventory stock low',
  'Order created successfully',
  'Notification sent',
  'Profile updated',
  'Database connection timeout',
  'Invalid API key provided',
  'Cache miss for key',
  'External API returned 500',
  'Rate limit exceeded for user',
  'Background job completed',
  'Security alert: unauthorized access attempt'
];

const writeStream = fs.createWriteStream('large-logs.ndjson');

console.log('Starting generation of 100,000 logs...');

for (let i = 0; i < 100000; i++) {
  const log = {
    id: crypto.randomUUID(),
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(), // Last 24 hours
    level: levels[Math.floor(Math.random() * levels.length)],
    service: services[Math.floor(Math.random() * services.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    metadata: {
      index: i,
      requestId: crypto.randomUUID().split('-')[0],
      latency: Math.floor(Math.random() * 1000)
    }
  };
  writeStream.write(JSON.stringify(log) + '\n');
}

writeStream.on('finish', () => {
  console.log('SUCCESS: Generated 100,000 logs in large-logs.ndjson');
});

writeStream.end();
