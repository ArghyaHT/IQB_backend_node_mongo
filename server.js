const express = require("express")
const connectDB = require("./db/db.js")
const cors = require("cors")

const registerCustomer = require("./routes/customerRegisterRoute.js")



connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/customer", registerCustomer)

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });