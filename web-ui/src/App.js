import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { getCurrentUser } from './services/authService';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage'; // Chỉ cho Admin
import RoomManagementPage from './pages/RoomManagementPage'; // Cho Landlord và Renter
import Sidebar from './components/Sidebar'; // Import Sidebar
import './App.css';

const App = () => {
  const currentUser = getCurrentUser();

  return (
    <Router>
      <div className="app-container">
        {/* Hiển thị Sidebar khi người dùng đã đăng nhập */}
        {currentUser && <Sidebar />}

        <div className={`content ${!currentUser ? 'full-width' : ''}`}>
          <Routes>
            {/* Route cho Login và Register không có sidebar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Route chính khi người dùng đã đăng nhập */}
            {currentUser && (
              <>
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Route cho Admin */}
                {currentUser.role === 'Admin' && (
                  <Route path="/user-management" element={<UserManagementPage />} />
                )}

                {/* Route cho Landlord */}
                {currentUser.role === 'Landlord' && (
                  <>
                    <Route path="/room-management" element={<RoomManagementPage />} />
                    <Route path="/contract-management"  />
                  </>
                )}

                {/* Route cho Renter */}
                {currentUser.role === 'Renter' && (
                  <>
                    <Route path="/room-management" element={<RoomManagementPage />} />
                    <Route path="/contract-management" />
                  </>
                )}
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
