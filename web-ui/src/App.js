import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { getCurrentUser } from './services/authService';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PropertyManagementPage from './pages/PropertyManagementPage';
import RoomManagementPage from './pages/RoomManagementPage';
import ContractManagementPage from './pages/ContractManagementPage';
import RoomTypeManagementPage from './pages/RoomTypeManagementPage';
import ServiceManagementPage from './pages/ServiceManagementPage';
import AdminUserManagementPage from './pages/AdminManagementPage';
import RoomDetailPage from './pages/RoomDetailPage';

import RoomDetailRenterPage from './pages/RoomDetailRenterPage'; 
import FreeRoomsPage from './pages/FreeRoomsPage';     
import MyRoomPage from './pages/MyRoomPage';           
import ProfilePage from './pages/ProfilePage'; 

import Sidebar from './components/Sidebar';
import './App.css';

const App = () => {
  const currentUser = getCurrentUser();

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar cho user đã đăng nhập */}
        {currentUser && <Sidebar />}

        <div className={`content ${!currentUser ? 'full-width' : ''}`}>
          <Routes>
            {/* Route public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Route sau khi đăng nhập */}
            {currentUser && (
              <>
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Admin */}
                {currentUser.role === 'Admin' && (
                  <>
                    <Route path="/user-management" element={<AdminUserManagementPage />} />
                  </>
                )}

                {/* Landlord */}
                {currentUser.role === 'Landlord' && (
                  <>
                    <Route path="/property-management" element={<PropertyManagementPage />} />
                    <Route path="/room-management" element={<RoomManagementPage />} />
                    <Route path="/room-management/:propertyId" element={<RoomManagementPage />} />
                    <Route path="/room-type-management" element={<RoomTypeManagementPage />} />
                    <Route path="/service-management" element={<ServiceManagementPage />} />
                    <Route path="/room-detail/:roomId" element={<RoomDetailPage />} />
                  </>
                )}

                {/* Renter */}
                {currentUser.role === 'Renter' && (
                  <>
                    <Route path="/free-rooms" element={<FreeRoomsPage />} />
                    <Route path="/renter-room-detail/:roomId" element={<RoomDetailRenterPage />} />
                    <Route path="/my-room" element={<MyRoomPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
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
