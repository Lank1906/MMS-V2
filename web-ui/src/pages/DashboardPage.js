import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
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
        const response = await dashboardService.getDashboardData();
        setRole(response.role);
        setData(response.data);

        if (!response.data.renterRevenue) {
          setData(prev => ({ ...prev, renterRevenue: [] }));
        }
      } catch (err) {
        setError(err.message || 'Lỗi khi tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const fetchLandlordRevenue = async () => {
    try {
      const revenueData = await dashboardService.getLandlordRevenue();
      setData(prev => ({ ...prev, landlordRevenue: revenueData.data }));
    } catch {
      setError('Lỗi khi tải doanh thu Landlord');
    }
  };

  const fetchRenterRevenue = async () => {
    try {
      const revenueData = await dashboardService.getRenterRevenue();
      setData(prev => ({ ...prev, renterRevenue: revenueData.data }));
    } catch {
      setError('Lỗi khi tải doanh thu Renter');
    }
  };

  useEffect(() => {
    if (role === 'Admin') {
      fetchRenterRevenue();
      fetchLandlordRevenue();
    }
  }, [role]);

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

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
          cx="50%" cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  };

  const RoomsPieChart = () => {
    const chartData = [
      { name: 'Phòng trống', value: data.availableRooms || 0 },
      { name: 'Phòng đã thuê', value: data.rentedRooms || 0 },
    ];
    return (
      <PieChart width={300} height={300}>
        <Pie
          data={chartData}
          cx="50%" cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  };

  const LandlordRevenueChart = () => {
    if (!data.landlordRevenue || data.landlordRevenue.length === 0) {
      return <div>Không có dữ liệu doanh thu Landlord</div>;
    }
    return (
      <BarChart width={600} height={300} data={data.landlordRevenue}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="landlord_name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalRevenue" fill="#8884d8" />
      </BarChart>
    );
  };

  const RenterSpendingChart = () => {
    if (!data.renterRevenue || data.renterRevenue.length === 0) {
      return <div>Không có dữ liệu tổng chi Renter</div>;
    }
    const aggregateData = data.renterRevenue.reduce((acc, curr) => {
      const { renter_id, renter_name, totalRevenue } = curr;
      if (!acc[renter_id]) {
        acc[renter_id] = { renter_name, total: 0 };
      }
      acc[renter_id].total += Number(totalRevenue);
      return acc;
    }, {});
    const chartData = Object.values(aggregateData).map(({ renter_name, total }) => ({ renter_name, total }));

    return (
      <BarChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="renter_name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#00C49F" />
      </BarChart>
    );
  };

  const RevenueLineChart = () => {
    if (!data.monthlyRevenue || data.monthlyRevenue.length === 0) {
      return <div>Không có dữ liệu doanh thu theo tháng</div>;
    }
    return (
      <LineChart width={600} height={300} data={data.monthlyRevenue}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
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
          <div className="flex-row">
            <UserRolePieChart />
            <RoomsPieChart />
          </div>

          <div className="flex-row">
            <h3>Doanh thu từng Landlord</h3>
            <LandlordRevenueChart />
          </div>

          <div className="flex-row">
            <h3>Tổng chi từng Renter</h3>
            <RenterSpendingChart />
          </div>
        </>
      )}

      {role === 'Landlord' && (
        <>
          <div className="flex-row">
            <div className="card-container">
              <div className="info-card">
                <p className="label">Tổng số người thuê</p>
                <p className="value">{data.renterCount}</p>
              </div>
              <div className="info-card">
                <p className="label">Tiền vệ sinh, an ninh, ...</p>
                <p className="value">{(data.renterCount*11000).toLocaleString('vi-VN')} VND</p>
              </div>
              <div className="info-card">
                <p className="label">Tiền điện dự tính</p>
                <p className="value">{data.totalElectricity?.toLocaleString('vi-VN')} VND</p>
              </div>
              <div className="info-card">
                <p className="label">Tiền nước dự tính</p>
                <p className="value">{data.totalWater?.toLocaleString('vi-VN')} VND</p>
              </div>
            </div>
          </div>

          <div className="flex-row">
            <h3>Doanh thu 12 tháng gần nhất</h3>
            <RevenueLineChart />
            <RoomsPieChart />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
