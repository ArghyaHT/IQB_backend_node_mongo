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

const students = require("./routes/ImageUploadDemo/student.js")

const mobileRoutes = require("./routes/MobileRoutes/MobileRoutes.js")

const advertisement = require("./routes/Dashboard/advertisementRoutes.js")

const rateLimiter = rateLimit({
  windowMs: 20 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many request from this IP.Please try again later',
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
})

connectDB()

const app = express()

// const allowedOrigins = [
//   "https://iqb-react-frontend.netlify.app",
//   "http://localhost:5173"
// ];

//Use Multiple Cors
// app.use(cors({
//   origin: function (origin, callback) {
//     // Check if the origin is in the allowed origins list or if it's undefined (like in case of same-origin requests)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true); // Allow the request
//     } else {
//       callback(new Error("Not allowed by CORS")); // Deny the request
//     }
//   },
//   credentials: true
// }));

app.use(cors({
  origin:"https://iqb-react-frontend.netlify.app",
  // origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser())
app.use(rateLimiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

//Image upload =============

const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const dotenv = require("dotenv").config();

console.log(process.env.CLOUDINARY_URL)

const NODE_ENV = "development";

if (NODE_ENV != "production") {
  app.use(morgan("dev"));
}

app.use(fileUpload({
  debug: true,
  useTempFiles: true,
  // tempFileDir: path.join(__dirname,"./temp")
}));
app.use(express.static("uploads"));
app.use("/api", students);

//======================

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

app.use("/api/mobileRoutes", mobileRoutes)

app.use("/api/advertisement", advertisement)

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});