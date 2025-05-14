import React, { useState, useEffect } from 'react';
import { getAdminDashboardData } from '../services/dashboardService'; // Import service lấy dữ liệu
import '../assets/DashboardPage.css'; // Import CSS cho trang

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy dữ liệu tổng quan cho Admin
    const fetchData = async () => {
      try {
        const response = await getAdminDashboardData();
        setData(response);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard - Quản lý tổng quan</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Tổng số người dùng</h3>
          <p>{data.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Tổng số phòng</h3>
          <p>{data.totalRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Phòng trống</h3>
          <p>{data.availableRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Phòng đã thuê</h3>
          <p>{data.rentedRooms}</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Biểu đồ trạng thái phòng</h3>
          {/* Có thể sử dụng thư viện như Chart.js hoặc Recharts để vẽ biểu đồ */}
          <div className="chart">Biểu đồ phòng</div>
        </div>

        <div className="chart-card">
          <h3>Biểu đồ thanh toán</h3>
          <div className="chart">Biểu đồ thanh toán</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
