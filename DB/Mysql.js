const mysql = require('mysql2');

// Create a connection pool
const Mysqldb = mysql.createPool({
  host: 'localhost',     // Replace with your MySQL host
  user: 'root',          // Replace with your MySQL username
  password: '',  // Replace with your MySQL password
  database: 'localtraval',      // Replace with your MySQL database name
  connectionLimit: 10    // Set connection limit (optional)
});

module.exports = Mysqldb.promise();

