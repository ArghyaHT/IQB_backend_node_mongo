const { getTimezone } = require("timezone-support");
const moment = require('moment-timezone');

function getTimezoneInfo(latitude, longitude) {
    const timezoneInfo = getTimezone(latitude, longitude);
    const timezoneName = timezoneInfo?.zoneName;
    return timezoneName;
  }
  
  function getCurrentTimeInTimezone(timezoneName) {
    return moment().tz(timezoneName).format('YYYY-MM-DD HH:mm:ss');
  }
  
  module.exports = {
    getTimezoneInfo,
    getCurrentTimeInTimezone
};