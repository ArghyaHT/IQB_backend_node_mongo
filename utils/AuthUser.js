const admin = require("../config/firebase.config")

const auth = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(404).json({
                success: false,
                message: "Token is required or invalid"
            })
        }

        const token = req.headers.authorization.split(" ")[1]

        const decodeValue = await admin.auth().verifyIdToken(token)

        if (!decodeValue) {
            return res.status(500).json({
                success: false,
                message: "UnAuthorized User"
            })
        }

        const barberdata = req.body.barber || false
        const admindata = req.body.admin || false
        const namedata = req.body.name || ""

        req.user = {decodeValue:decodeValue, barber:barberdata,admin:admindata,name:namedata}   
        next()

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error
        })
    }
}


module.exports = {
    auth
}