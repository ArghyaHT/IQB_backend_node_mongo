const cron = require("node-cron");

const startCronJob = () => {
    // Schedule a cron job to run every 5 minutes
    cron.schedule("*/5 * * * *", () => {
        // Your task to be executed every 5 minutes goes here
        console.log("This cronjob will be called after every 5 minutes");
    });
};

module.exports = {
startCronJob,
}
