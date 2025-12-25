const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createPool({
    user: process.env.DB_USER || process.env.DB_user,
    password: process.env.DB_PASSWORD || process.env.DB_password,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
<<<<<<< Updated upstream
    // Fix: TiDB Requires SSL. Force it like debug_db.js
    ssl: {
        rejectUnauthorized: false
    },
=======
    ssl: { rejectUnauthorized: false },
>>>>>>> Stashed changes
    waitForConnections: true,
    connectionLimit: 10,
<<<<<<< Updated upstream
    queueLimit: 0
=======
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 5000
>>>>>>> Stashed changes
});

module.exports = connection.promise();
