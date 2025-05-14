// src/config/db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Tải các biến môi trường từ tệp .env
dotenv.config();

// Cấu hình kết nối tới MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,         // Lấy biến DB_HOST từ .env
  user: process.env.DB_USER,         // Lấy biến DB_USER từ .env
  password: process.env.DB_PASSWORD, // Lấy biến DB_PASSWORD từ .env
  database: process.env.DB_NAME      // Lấy biến DB_NAME từ .env
});

db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối cơ sở dữ liệu: ' + err.stack);
    return;
  }
  console.log('Đã kết nối cơ sở dữ liệu MySQL');
});

module.exports = db;
