const mysql = require('mysql2');

// Create a connection pool
const Mysqldb = mysql.createPool({
  host: process.env.DB_HOST, // Replace with your host name
  user: process.env.DB_USER,// Replace with your MySQL username
  password: process.env.DB_PASS,  // Replace with your MySQL password
  database: process.env.DB_NAME||"",      // Replace with your MySQL database name
  connectionLimit: 10    // Set connection limit (optional)
});

module.exports = Mysqldb.promise();

