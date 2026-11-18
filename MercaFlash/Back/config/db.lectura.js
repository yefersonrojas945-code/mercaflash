// Conexión de LECTURA a MySQL.
// La usan las consultas de la API: solo GET (routes/lectura).
//
// Si defines DB_READ_HOST (y opcionalmente DB_READ_PORT, DB_READ_USER, DB_READ_PASSWORD,
// DB_READ_NAME) en el .env, las lecturas se hacen contra ese servidor (por ejemplo una
// réplica de solo lectura). Si no los defines, usa los mismos datos que la escritura.
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_READ_HOST || process.env.DB_HOST,
    port: Number(process.env.DB_READ_PORT || process.env.DB_PORT || 3306),
    user: process.env.DB_READ_USER || process.env.DB_USER,
    password: process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.DB_READ_NAME || process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

module.exports = pool;
