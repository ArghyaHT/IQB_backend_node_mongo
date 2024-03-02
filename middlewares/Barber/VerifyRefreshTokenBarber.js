const jwt = require('jsonwebtoken')

const JWT_ACCESS_SECRET_BARBER = "accessTokenBarber"
// const JWT_REFRESH_SECRET_BARBER = "refreshTokenBarber"


const verifyRefreshTokenBarber = (req, res, next) => {
    try {
        const barbercookie = req.cookies

        console.log(barbercookie)

        if (!barbercookie?.BarberToken) {
            return res.status(401).json({
                success: false,
                message: "UnAuthorized Barber"
            })
        }

        jwt.verify(
            barbercookie?.BarberToken,
            JWT_ACCESS_SECRET_BARBER,
            async (err, decoded) => {
                if (err) return res.status(403).json({ success: false, message: 'Forbidden Admin' })
                req.email = decoded.email
                req.role = decoded.role
                next()
            }
        )
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}


module.exports = verifyRefreshTokenBarber; 