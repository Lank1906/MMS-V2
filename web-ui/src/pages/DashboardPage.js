import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
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
        setData(prev => ({ ...response.data, renterRevenue: response.data.renterRevenue || [] }));
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

  const UserRolePieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={[{ name: 'Admin', value: data.totalUsers?.Admin || 0 }, { name: 'Landlord', value: data.totalUsers?.Landlord || 0 }, { name: 'Renter', value: data.totalUsers?.Renter || 0 }]}
          cx="50%" cy="50%" outerRadius={100} label dataKey="value"
        >
          {COLORS.map((color, index) => (
            <Cell key={index} fill={color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const RoomsPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      
      <PieChart>
        <Pie
          data={[{ name: 'Phòng trống', value: data.availableRooms || 0 }, { name: 'Phòng đã thuê', value: data.rentedRooms || 0 },{name:'Phòng cần dọn dẹp',value:data.maintainRooms}]}
          cx="50%" cy="50%" outerRadius={100} label dataKey="value"
        >
          <Cell fill="#0088FE" />
          <Cell fill="#00C49F" />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const ContractsPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={[{ name: 'Active', value: data.totalContracts?.Active || 0 }, { name: 'Completed', value: data.totalContracts?.Completed || 0 }]}
          cx="50%" cy="50%" outerRadius={100} label dataKey="value"
        >
          <Cell fill="#FFBB28" />
          <Cell fill="#FF8042" />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const LandlordRevenueChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data.landlordRevenue || []}
        margin={{ left: 70, right: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="landlord_name" />
        <YAxis tickFormatter={(v) => Number(v).toLocaleString('vi-VN')} />
        <Tooltip formatter={(v) => `${Number(v).toLocaleString('vi-VN')} VND`} />
        <Legend />
        <Bar dataKey="totalRevenue" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );

  const RenterAggregateChart = () => {
    const summary = {};
    data.renterRevenue?.forEach(({ renter_id, renter_name, totalRevenue }) => {
      if (!renter_id || !renter_name) return;
      summary[renter_id] = summary[renter_id] || { renter_name, total: 0 };
      summary[renter_id].total += parseFloat(totalRevenue);
    });
    const chartData = Object.values(summary);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ left: 70, right: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="renter_name" angle={-15} textAnchor="end" />
          <YAxis tickFormatter={(v) => Number(v).toLocaleString('vi-VN')} />
          <Tooltip formatter={(v) => `${Number(v).toLocaleString('vi-VN')} VND`} />
          <Legend />
          <Bar dataKey="total" fill="#00C49F" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const RevenueLineChart = () => {
  if (!data.monthlyRevenue || data.monthlyRevenue.length === 0) {
    return <div>Không có dữ liệu doanh thu theo tháng</div>;
  }

  const chartData = data.monthlyRevenue.map((item) => ({
    ...item,
    revenue: Number(item.revenue)
  }));

  const maxValue = Math.max(...chartData.map((d) => d.revenue));
  const buffer = Math.ceil(maxValue * 0.1); // tăng biên độ 10% để đẹp hơn

  return (
    <div style={{ marginTop:'12px'}}>
      <div style={{ width: Math.max(600, chartData.length * 100), height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ right: 30, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              domain={[0, maxValue + buffer]}
              tickFormatter={(v) => v.toLocaleString('vi-VN')}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(v) => `${Number(v).toLocaleString('vi-VN')} VND`}
              labelFormatter={(label) => `Tháng: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

  return (
    <div className="dashboard-container">
      <header>
        <h1>Dashboard Tổng Quan</h1>
      </header>

      {role === 'Admin' && (
        <>
          <div className="grid-3">
            <div className="chart-card">
              <h3>Phân loại người dùng</h3>
              <UserRolePieChart />
            </div>
            <div className="chart-card">
              <h3>Tình trạng phòng</h3>
              <RoomsPieChart />
            </div>
            <div className="chart-card">
              <h3>Hợp đồng</h3>
              <ContractsPieChart />
            </div>
          </div>

          <div className="grid-2">
            <div className="chart-card">
              <h3>Doanh thu từng Landlord</h3>
              <LandlordRevenueChart />
            </div>
            <div className="chart-card">
              <h3>Tổng chi từng Renter</h3>
              <RenterAggregateChart />
            </div>
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
                <p className="label">Phí vệ sinh & an ninh</p>
                <p className="value">{(data.renterCount * 11000).toLocaleString('vi-VN')} VND</p>
              </div>
              <div className="info-card">
                <p className="label">Tiền điện dự tính</p>
                <p className="value">{Number(data.totalElectricity).toLocaleString('vi-VN')} VND</p>
              </div>
              <div className="info-card">
                <p className="label">Tiền nước dự tính</p>
                <p className="value">{Number(data.totalWater).toLocaleString('vi-VN')} VND</p>
              </div>
            </div>
          </div>

          <div className="flex-row">
            <div className="chart-box">
              <h3>Doanh thu 12 tháng gần nhất</h3>
              <RevenueLineChart />
            </div>
            <div className="chart-box" style={{width:'40%'}}>
              <h3>Tỷ lệ kín phòng</h3>
              <RoomsPieChart />
            </div>
            
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;