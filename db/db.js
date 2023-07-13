const mongoose = require("mongoose")

const connectDB = async() =>{
    try{
        const conn = await mongoose.connect("mongodb+srv://customertable:customertable@cluster0.6rw7owj.mongodb.net/")

        console.log(`MongoDB is successfully connected: ${conn.connection.host}`)
    }
    catch(error){
        console.log(error)
    }
}

module.exports = connectDB