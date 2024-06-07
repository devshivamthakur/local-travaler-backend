const mongoose = require('mongoose');
require('dotenv').config()
const mongoUrl = process.env.DB_URL
const dbName = process.env.DB_NAME

const ConnectMongo=async ()=>{
    try {
     await mongoose.connect(`${mongoUrl}/${dbName}`,{
      writeConcern: { w: 'majority' },
      dbName: dbName,  // Specify the database name here
    
     })
    //  console.log('Connected to',mongoose)
    } catch (error) {
      console.log(error)
      console.log("error")
      
    }
  }

module.exports = {
  ConnectMongo
};

