const mysql = require('mysql2/promise');
require('dotenv').config();

// Initialize MySQL connection pool with parameterized query support
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'college_placement',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

// Test initial connection on server boot
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[MySQL] Database pool connected successfully to:', process.env.DB_NAME || 'college_placement');
    connection.release();
  } catch (error) {
    console.error('[MySQL] Database connection failed:', error.message);
    console.warn('[MySQL] Please ensure MySQL is running and database/schema.sql has been executed.');
  }
}

testConnection();

module.exports = pool;
