const jwt = require('jsonwebtoken')

const JWT_ACCESS_SECRET = "accessTokenAdmin"
const JWT_ACCESS_SECRET_BARBER = "accessTokenBarber"
// const JWT_REFRESH_SECRET = "refreshToken"

const verifyAuthToken = (req, res, next) => {

    // // accessToken aschena atar dutoi way ache either user page refresh koreche tai access token uregech or
    // // refresh token expire kore geche tai access token generate hochena
    try {
        const cookie = req.cookies

        // admincookie?.AdminToken (only check this condition)
        let resToken = (cookie.AdminToken == null || cookie.AdminToken === 'undefined') ? cookie.BarberToken : cookie.AdminToken
        

        console.log(cookie)

        if (!resToken) {
            return res.status(401).json({
                success: false,
                message: "UnAuthorized Admin"
            })
        }

        jwt.verify(
            resToken,
            cookie?.AdminToken ? JWT_ACCESS_SECRET : JWT_ACCESS_SECRET_BARBER,
            async (err, decoded) => {
                if (err) return res.status(403).json({success: false, message: 'Forbidden Admin' })

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

module.exports = verifyAuthToken 