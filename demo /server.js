const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDatabase = require("./config/database");
const fileUpload = require("express-fileupload");
const path = require("path")
const cors = require("cors")

dotenv.config({ path: "./config/config.env" });

connectDatabase();

const students = require("./routes/students");

const app = express({ limit: '5mb' });
app.use(cors())

if (process.env.NODE_ENV != "production") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use(fileUpload({
  debug:true,
  useTempFiles:true,
  // tempFileDir: path.join(__dirname,"./temp")
}));


app.use(express.static("uploads"));
app.use("/api", students);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running at port: ${PORT}`)
);
