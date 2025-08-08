const winston = require('winston');

// Create structured logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'buildledger-server',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${service}] ${level}: ${message} ${metaString}`;
        })
      )
    })
  ]
});

// Add file transport for production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
}

// Helper functions for structured logging
logger.webhook = (type, eventId, data = {}) => {
  logger.info('Webhook event processed', {
    type: 'webhook',
    provider: type,
    eventId,
    ...data
  });
};

logger.security = (event, details = {}) => {
  logger.warn('Security event', {
    type: 'security',
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.audit = (action, userId, details = {}) => {
  logger.info('Audit event', {
    type: 'audit',
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = logger;