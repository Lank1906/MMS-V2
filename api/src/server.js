const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const roomRoutes = require('./routes/roomRoutes');
const roomTypeRoutes = require('./routes/roomTypeRoutes');
const contractRoutes = require('./routes/contractRoutes');
const roomServiceRoutes = require('./routes/roomServiceRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const roomRenterRoutes = require('./routes/roomRenterRoutes'); 
const renterRoutes = require('./routes/renterRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/roomtypes', roomTypeRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/room-services', roomServiceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/room-renter', roomRenterRoutes);
app.use('/api/renter', renterRoutes);

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
