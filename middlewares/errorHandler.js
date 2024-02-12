const logger = require("../utils/logger");

exports.ErrorHandler = (err, req, res, next) => {
    console.log("Middleware Error Hadnling");
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    logger.error(err.message)
    
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg ,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })
}

