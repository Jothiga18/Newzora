const mysql = require('mysql2/promise');
require('dotenv').config();

// Log database configuration (without sensitive data)
console.log('📊 Database Config:');
console.log('   Host:', process.env.DB_HOST || 'localhost');
console.log('   User:', process.env.DB_USER || 'root');
console.log('   Database:', process.env.DB_NAME || 'newzora');
console.log('   Port:', process.env.DB_PORT || 3306);

// Create connection pool for MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'newzora',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔌 Attempting to connect to MySQL...');
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Database connection failed!');
    console.error('   Error:', error.message);
    console.error('   Please check your .env file and ensure MySQL is running.');
    return false;
  }
};

module.exports = { pool, testConnection };
