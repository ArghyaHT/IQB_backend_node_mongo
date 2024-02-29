const cron = require("node-cron");
const fs = require('fs');
const path = require('path');

const startCronJob = () => {
    // Schedule a cron job to run every 5 minutes
    cron.schedule("*/5 * * * *", () => {
        // Your task to be executed every 5 minutes goes here
        console.log("This cronjob will be called after every 5 minutes");
    });
};

const recreateLoggerCronJob = async() => {
    // Cron job to recreate the logger.log file every 1 Day
    cron.schedule('0 0 * * *', () => {
        const filePath = "logger.log";

        console.log('Attempting to recreate logger.log...');

        // Recreate the file
        fs.writeFile(filePath, '', (err) => {
            if (err) {
                console.error('Error recreating logger.log file:', err);
            } else {
                console.log('logger.log file recreated successfully.');
            }
        });
    }, {
        timezone: 'Asia/Kolkata' // Update with your timezone
    });
}

module.exports = {
startCronJob,
recreateLoggerCronJob,
}
