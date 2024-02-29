const winston = require('winston');
const fs = require('fs');

const { createLogger, transports } = require('winston');
const { recreateLoggerCronJob } = require('../triggers/cronJobs.js');

// Function to recreate the logger file if it doesn't exist
function recreateLoggerFile() {
    const filePath = 'logger.log';

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        // Create the file
        fs.writeFileSync(filePath, '');
    }
}

// Function to create and configure the logger
function createLoggerInstance() {
    recreateLoggerFile();

    return createLogger({
        format: winston.format.combine(
            winston.format.timestamp(), // Add timestamp to logs
            winston.format.json() // JSON format for logs
        ),
        transports: [
            new transports.File({ filename: 'logger.log' }) // Log to file with timestamp
        ]
    });
}

const logger = createLoggerInstance();

module.exports = logger;