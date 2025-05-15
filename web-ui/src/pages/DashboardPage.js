import React, { useState, useEffect } from 'react';
import { getAdminDashboardData } from '../services/dashboardService'; // Import service lấy dữ liệu
import '../assets/DashboardPage.css'; // Import CSS cho trang

const DashboardPage = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminDashboardData();
        setData(response);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-page">
      <h1>Dashboard - Quản lý tổng quan</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Tổng số người dùng</h3>
          <p>{data?.totalUsers ?? '-'}</p>
        </div>
        <div className="stat-card">
          <h3>Tổng số phòng</h3>
          <p>{data?.totalRooms ?? '-'}</p>
        </div>
        <div className="stat-card">
          <h3>Phòng trống</h3>
          <p>{data?.availableRooms ?? '-'}</p>
        </div>
        <div className="stat-card">
          <h3>Phòng đã thuê</h3>
          <p>{data?.rentedRooms ?? '-'}</p>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
