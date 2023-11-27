const express = require("express")
const connectDB = require("./db/db.js")
const cors = require("cors")

const registerCustomer = require("./routes/customer/customerRegisterRoute.js")

const registerAdmin = require("./routes/admin/adminRegisterRoutes.js")

const salonRegister = require("./routes/admin/salonRegisterRoute.js")

const barberRegister = require("./routes/barber/barberRegisterRoutes.js")

const serviceRegister = require("./routes/admin/serviceRegisterRoute.js")

const barberService = require("./routes/barber/barberService.js")

const joinQ = require("./routes/Queueing/joinQueueRoutes.js")

const barberWorking = require("./routes/Queueing/barberWorkingRoutes.js")

const salonSettings = require("./routes/salonSettings/salonSettingsRoute.js")

const barberReports = require("./routes/reports/barberReportGraphRoutes.js")

const barberAuth = require("./routes/barberAuth/barberAuthRoute.js")

const appointments = require("./routes/Appointments/appointmentsRoutes.js")



connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/api/customer", registerCustomer)

app.use("/api/admin", registerAdmin)

app.use("/api/salon", salonRegister)

app.use("/api/barber", barberRegister)

app.use("/api/service", serviceRegister)

app.use("/api/barberService", barberService)

app.use("/api/queue", joinQ)

app.use("/api/barberWorking", barberWorking)

app.use("/api/salonSettings", salonSettings)

app.use("/api/barberReports", barberReports)

app.use("/api/appointments", appointments)

app.use("/api", barberAuth)

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });