import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService'; // Import đúng service
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import '../assets/DashboardPage.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardPage = () => {
  const [role, setRole] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await dashboardService.getDashboardData(); // Sử dụng service đã cập nhật
        setRole(response.role);
        setData(response.data);

        // Kiểm tra nếu không có dữ liệu renterRevenue thì khởi tạo mảng rỗng
        if (!response.data.renterRevenue) {
          setData(prevData => ({ ...prevData, renterRevenue: [] }));
        }
      } catch (err) {
        setError(err.message || 'Lỗi khi tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Lấy doanh thu Landlord
  const fetchLandlordRevenue = async () => {
    try {
      const revenueData = await dashboardService.getLandlordRevenue();
      setData(prevData => ({ ...prevData, landlordRevenue: revenueData.data }));
      console.log(revenueData)
    } catch (err) {
      setError('Lỗi khi tải doanh thu Landlord');
    }
  };

  // Lấy doanh thu Renter
  const fetchRenterRevenue = async () => {
    try {
      const revenueData = await dashboardService.getRenterRevenue();
      setData(prevData => ({ ...prevData, renterRevenue: revenueData.data }));
    } catch (err) {
      setError('Lỗi khi tải doanh thu Renter');
    }
  };

  useEffect(() => {
    if (role === 'Landlord') {
      fetchLandlordRevenue();
    }
    if (role === 'Admin') {
      fetchRenterRevenue();
    }
  }, [role]);

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  // --- Biểu đồ cho Admin: Pie phân bổ user roles ---
  const UserRolePieChart = () => {
    const chartData = [
      { name: 'Admin', value: data.totalUsers?.Admin || 0 },
      { name: 'Landlord', value: data.totalUsers?.Landlord || 0 },
      { name: 'Renter', value: data.totalUsers?.Renter || 0 },
    ];

    return (
      <PieChart width={300} height={300}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  };

  // --- Biểu đồ cho Admin: Bar chart số phòng ---
  const RoomsBarChart = () => {
    const chartData = [
      { name: 'Phòng trống', value: data.availableRooms || 0 },
      { name: 'Phòng đã thuê', value: data.rentedRooms || 0 },
    ];
    return (
      <BarChart width={400} height={300} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    );
  };

  // --- Biểu đồ cho Landlord: Line chart doanh thu theo ngày ---
  const RevenueLineChart = () => {
    if (!data.renterRevenue || data.renterRevenue.length === 0) {
      return <div>Không có dữ liệu doanh thu cho Renter</div>;
    }

    const revenueData = data.renterRevenue.map(item => ({
      date: item.payment_date,
      revenue: item.totalRevenue,
    }));

    return (
      <LineChart
        width={600}
        height={300}
        data={revenueData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    );
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Dashboard Tổng Quan</h1>
      </header>

      {role === 'Admin' && (
        <>
          <div className="stats-container">
            <div className="stat-card">
              <h3>Tổng số người dùng</h3>
              <p>{data.totalUsers.Admin || 0} Admin</p>
              <p>{data.totalUsers.Landlord || 0} Landlords</p>
              <p>{data.totalUsers.Renter || 0} Renters</p>
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

          <div className="flex-row">
            <UserRolePieChart />
            <RoomsBarChart />
          </div>

          <div className="flex-row">
            <h3>Doanh thu theo ngày</h3>
            <RevenueLineChart />
          </div>
        </>
      )}

      {role === 'Landlord' && (
        <>
          <h3>Doanh thu theo ngày</h3>
          <RevenueLineChart />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
