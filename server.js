const express = require("express")
const connectDB = require("./db/db.js")
const cors = require("cors")

const registerCustomer = require("./routes/customer/customerRegisterRoute.js")

const registerAdmin = require("./routes/admin/adminRegisterRoutes.js")

const salonRegister = require("./routes/admin/salonRegisterRoute.js")

const barberRegister = require("./routes/barber/barberRegisterRoutes.js")

const serviceRegister = require("./routes/admin/serviceRegisterRoute.js")

const barberService = require("./routes/barber/barberService.js")

const barberAuth = require("./routes/barberAuth/barberAuthRoute.js")



connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/customer", registerCustomer)

app.use("/admin", registerAdmin)

app.use("/salon", salonRegister)

app.use("/barber", barberRegister)

app.use("/service", serviceRegister)

app.use("/barberService", barberService)

app.use("/api", barberAuth)

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });