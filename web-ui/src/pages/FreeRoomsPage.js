import React, { useState, useEffect } from 'react';
import renterService from '../services/renterService'; // import service đúng tên bạn dùng
import '../assets/FreeRoomsPage.css';

const FreeRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ address: '', minPrice: '', maxPrice: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      // Chuyển minPrice và maxPrice sang số hoặc undefined để API xử lý chuẩn
      const params = {
        address: filters.address,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        page: 1,
        limit: 20,
      };
      const data = await renterService.getAvailableRooms(params);
      setRooms(data.rooms || []);
    } catch (err) {
      setError('Lỗi khi lấy danh sách phòng');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  return (
    <div className="free-rooms-page">
      <header className="header">
        <h1>Khám phá phòng trống đẹp - Giá hợp lý</h1>
        <p>Chọn phòng phù hợp, tiện nghi, dễ dàng thuê ngay hôm nay!</p>
      </header>

      <form className="filter-form" onSubmit={handleFilterSubmit}>
        <input
          type="text"
          name="address"
          placeholder="Nhập địa chỉ muốn tìm"
          value={filters.address}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Giá từ (VNĐ)"
          value={filters.minPrice}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Giá đến (VNĐ)"
          value={filters.maxPrice}
          onChange={handleInputChange}
        />
        <button type="submit">Tìm kiếm</button>
      </form>

      {loading && <p>Đang tải phòng...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && rooms.length === 0 && !error && (
        <p>Không tìm thấy phòng phù hợp.</p>
      )}

      <div className="rooms-list">
        {rooms.map(room => (
          <div key={room.room_id} className="room-card">
            <div className="room-image">
              <img
                src={"https://ho-ng-b-i-1.paiza-user-free.cloud:5000"+room.image_url}
                alt={`Phòng ${room.room_number}`}
              />
            </div>
            <div className="room-info">
              <h3>Phòng {room.room_number}</h3>
              <p><b>Địa chỉ:</b> {room.property_address}</p>
              <p><b>Loại phòng:</b> {room.room_type_name}</p>
              <p className="price">{room.rent_price.toLocaleString()} VNĐ/tháng</p>
              <a href={`/renter-room-detail/${room.room_id}`} className="rent-button">Thuê ngay</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreeRoomsPage;
