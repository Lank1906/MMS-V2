const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');  // Import cors
const authRoutes = require('./routes/authRoutes');

// Sử dụng dotenv để tải các biến môi trường
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Sử dụng CORS để cho phép truy cập từ localhost:3000 (React)
const corsOptions = {
  origin: 'http://localhost:3000', // Cho phép frontend trên localhost:3000 truy cập
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); // Sử dụng cors middleware với cấu hình

// Middleware để xử lý JSON body
app.use(express.json());

// Đăng ký các route
app.use('/api/auth', authRoutes);  
app.use('/api/dashboard', dashboardRoutes);

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
