const winston = require('winston');

const { createLogger, transports } = require('winston');

const logger = createLogger({
    format: winston.format.combine(
        winston.format.timestamp(), // Add timestamp to logs
        winston.format.json() // JSON format for logs
    ),
    transports: [
        // new transports.Console(),
        new transports.File({ filename: 'logger.log' }) // Log to file with timestamp
    ]
});

module.exports = logger;