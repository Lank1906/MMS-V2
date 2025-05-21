import React, { useState, useEffect } from 'react';
import renterService from '../services/renterService'; // import service đúng tên bạn dùng
import '../assets/FreeRoomsPage.css';

const FreeRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ address: '', minPrice: '', maxPrice: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 9; // Số phòng trên mỗi trang
  const [totalRooms, setTotalRooms] = useState(0);

  const fetchRooms = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        address: filters.address,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        page: pageNumber,
        limit,
      };
      const data = await renterService.getAvailableRooms(params);
      setRooms(data.rooms || []);
      setTotalRooms(data.total || 0);  // Giả sử API trả về total số phòng
      setPage(pageNumber);
    } catch (err) {
      setError('Lỗi khi lấy danh sách phòng');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms(1);
  }, []);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchRooms(1); // Tìm kiếm sẽ luôn bắt đầu từ trang 1
  };

  const totalPages = Math.ceil(totalRooms / limit);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchRooms(newPage);
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
          step={1000}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Giá đến (VNĐ)"
          value={filters.maxPrice}
          onChange={handleInputChange}
          step={1000}
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
              <p className="price">{Number(room.rent_price).toLocaleString('vi-VN')} VNĐ/tháng</p>
              <a href={`/renter-room-detail/${room.room_id}`} className="rent-button">Thuê ngay</a>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
            &laquo; Trang trước
          </button>

          <span>
            Trang {page} / {totalPages}
          </span>

          <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
            Trang sau &raquo;
          </button>
        </div>
      )}

    </div>
  );
};

export default FreeRoomsPage;
