const express = require("express")
const connectDB = require("./db/db.js")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { rateLimit } = require('express-rate-limit')

const registerCustomer = require("./routes/customer/customerRegisterRoute.js")

const registerAdmin = require("./routes/admin/adminRegisterRoutes.js")

const salonRegister = require("./routes/admin/salonRegisterRoute.js")

const barberRegister = require("./routes/barber/barberRegisterRoutes.js")

const joinQ = require("./routes/Queueing/joinQueueRoutes.js")

const salonSettings = require("./routes/salonSettings/salonSettingsRoute.js")

const barberReports = require("./routes/reports/barberReportGraphRoutes.js")

const customerReports = require("./routes/reports/customerReportGraphRoutes.js")

const salonReports = require("./routes/reports/salonReportGraphRoutes.js")

const appointments = require("./routes/Appointments/appointmentsRoutes.js")

const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many request from this IP.Please try again later',
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// store: ... , // Use an external store for more precise rate limiting
})

connectDB()

const app = express()

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))

app.use(cookieParser())
app.use(rateLimiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({extended:true,limit: '10mb'}))

app.use("/api/customer", registerCustomer)

app.use("/api/admin", registerAdmin)

app.use("/api/salon", salonRegister)

app.use("/api/barber", barberRegister)

app.use("/api/queue", joinQ)

app.use("/api/salonSettings", salonSettings)

app.use("/api/barberReports", barberReports)

app.use("/api/customerReports", customerReports)

app.use("/api/salonReports", salonReports)

app.use("/api/appointments", appointments)


const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });