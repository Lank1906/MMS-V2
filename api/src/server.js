const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const roomRoutes = require('./routes/roomRoutes');
const roomTypeRoutes = require('./routes/roomTypeRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Cấu hình CORS cho frontend React
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Đăng ký routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/roomtypes', roomTypeRoutes);

// Route kiểm tra server
app.get('/', (req, res) => {
  res.send('Server API Quản lý Nhà Trọ Đang Chạy...');
});

// Global error handler (optional tốt cho dev)
app.use((err, req, res, next) => {
  console.error('Lỗi:', err.stack);
  res.status(500).json({ error: 'Lỗi server nội bộ' });
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
