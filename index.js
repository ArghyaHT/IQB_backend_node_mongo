const express = require("express")
const connectDB = require("./db/db.js")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { rateLimit } = require('express-rate-limit')
const admin = require('firebase-admin');

require("dotenv").config();


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

const notifications =  require("./routes/Notifications/notificationRoutes.js")

const rating = require("./routes/Ratings/ratingRoutes.js")

const rateLimiter = rateLimit({
  windowMs: 20 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many request from this IP.Please try again later',
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
})

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Perform necessary actions to handle the error gracefully
  // For example, log the error, perform cleanup, and gracefully exit the process if needed
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Perform necessary actions to handle the rejection gracefully
  // For example, log the rejection, perform cleanup, and handle the promise rejection if needed
});
connectDB()

const app = express()

// const allowedOrigins = [
//   "https://iqb-react-frontend.netlify.app",
//   "http://localhost:5173"
// ];

// //Use Multiple Cors
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



// console.log(process.env.NODE_ENV)
// const result = require("dotenv").config({path: process.env.NODE_ENV === "development"? ".env.dev":".env.prod"})
// console.log(result)
// process.env = {
//   ...process.env,
//   ...result.parsed
// }


app.use(cors({
  origin:"http://localhost:5173",
  credentials: true
}));

// Initialize Firebase Admin SDK
const serviceAccount = require("./notification_push_service_key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// notification_service_key.json

// {
//   "type": "service_account",
//   "project_id": "notificationapp-af121",
//   "private_key_id": "2e638ca85c1bb38596699ec847c202b56b97ee32",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCf4/nBS2WHiQrb\nZiOsTg3MPfWE/Lv14n9Gez1TDERutwuEG9OJAumvE9eRoRasptceME/++1RL/QzV\nWX5RBgfx+AsHzM8YRXhnMDy3stTNZG2mdErXlDWlfQwT9erd5JRtnoPH3M2NN/Zn\nZRrG6i14axmTkgAeH//CAzGC3sJu67+s7nhWPvny5IWDrHggnGtgfLZS+6RcWyXL\no/vN2Ni3qQGdOisdrUtJVR8F+udFCuUvdpwq3jaXBKdd154FI5SldExgsImPOfBL\nt8T4p0576mYd4lOURlEA4Ew/ixBOEbp8CPaLP/PuIeFZv/DNYjTmUrFkBqoV3k88\nXuFxte4lAgMBAAECggEAA49XXxA3L/0t997pJMEjedctUWsxIiiLWJM439GnmmbK\nmQPnl1GFyMdNJum/xVNSTyft4rRPgaueLrKMkfBA8AhrnR5YbrwT517saH37p/Zi\n90WilEnb/JXGquZwTBrL7+Q2H0E8IGH3w1Xoco0B5dWjSaUCtKkAuvNIQGzbm7hC\nACL582eAIYx0hyE7bwtcugmM6gCaKDBp7/nz++vL6CJkP5mc2Z/H6u10Tj9X87c6\n8XwYt6PbyLzFUuzLr3N1/1vyAV0tUk8RUEY/ma9MUmT1xIEhQRkrUMuinJKZh/+3\nYoA6fLU0NkeE+vfB4DqvNKzJhyN2uMHTbRUBHFQklwKBgQDSyohhz6GPt8spMZM+\ngmsFCieDx1ok2G8AAX0UXQENteyW6rWaucrzGFF7z50a5lJ2EniW9m1OuIRPx60z\nq3q2E9Ne7rPjdy7sECzm2OmtSwXUWQvl4yCYEFRDUHF/hBs6TUvXcjz58yDcUqLR\nCZnrw6VUWQ1Qa4qjPlvd5VQ39wKBgQDCLr/mNlvDlLwv6zbdHHWv5QG5exPySplJ\nim1SbKQ+Oem7FKxPfktl5dwIyZhU+I03z6Tyn/la2t2qtkeqbmUKZxCIZQBb6dVW\nv2BuusqU/kHn2+Wlh8kalGPJgRbqbDusvHKAgj5gu/q+8NHx8ob5VXCYcXaVEogJ\n3sQVeQnbwwKBgEo5YP64Ixa9TD+MImIfgFm88p8Xgml5ANUKsSWLfkR6q/2UVjBO\nfeVNyduEBrkjIyRKasYVrfXLSWPiVt3b4xDcOFC0UwmkvRQIuhbriJUp1rqoRGVF\nrgN9tH4jhGO3e/LypuMNaeVFtGuAea6L5/Q55yylUuffhmjnG2guSZKPAoGAC/Sa\n5g6kubb3my+tMhHlgQ3lfEkComFLbMa0EmYT+qzQIi+UqFRLShvL31KiKWEgOLZ1\nHmcREDH3geI1KV4gpHJSB0PIsOAFvZCM3GRtwpyg7CiSzA0/KX7HYgmrooVFa04y\n8oySUJxiRM1I78+R1doX05rwxR7d91Wa1wObwscCgYBHPA7G+DiEFk/fZZA0QL0T\ntEEojTXKmlBDaUBgOmGLI91XHU660uWRBvajGLduw7jU3YHQKLHgiZ2WHBElJ2ti\n/N0ZLLhSLOhCTKIBv06o5GzyzdJiOGX2ZEFF9fDylChSlZZ1X1StsSalvKZJhjjY\nHkx34WCP8/JpSdlm+szHTQ==\n-----END PRIVATE KEY-----\n",
//   "client_email": "firebase-adminsdk-ni0pu@notificationapp-af121.iam.gserviceaccount.com",
//   "client_id": "104801369971578018120",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ni0pu%40notificationapp-af121.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// }

// dwWVEfvc21toFvKsKpNo5g:APA91bE9nBzRABQtlzG3wc_RgltVXoec2S97h_invNEKB4D1wp-4MuzjuGvgBmMF4ySNla0YxYNT_2uYXak001VgoLkA1Sc2mzZwFY5qwjzJbMITdhhZW8nD_eCyLeUtqjZbSjSkeRc7


app.use(cookieParser())
app.use(rateLimiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

//Image upload =============

const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const Customer = require("./models/customerRegisterModel.js")

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

// // Initialize Firebase Admin SDK
// const serviceAccount = require("./notification_push_service_key.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

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

app.use("/api/ratings", rating)


// app.post('/send-notification', async (req, res) => {
//   const { title, body } = req.body;

//   if (!title || !body) {
//     return res.status(400).json({ error: 'Title and body are required' });
//   }

//   try {
//     const users = await Customer.find();
//     const registrationTokens = users.map((user) => user.fcmToken);

//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       tokens: registrationTokens, // Pass tokens as an array
//     };

//     const response = await admin.messaging().sendMulticast(message);
//     console.log('Notification sent:', response);
//     res.status(200).json({ message: 'Notification sent successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


app.use("/api/notifications", notifications)

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// // Handle process termination signals for graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('Received SIGTERM signal');
//   // Perform cleanup and graceful shutdown
//   server.close(() => {
//     console.log('Server closed');
//     process.exit(0);
//   });
// });



