import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import renterService from '../services/renterService';

const RoomDetailRenterPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRented, setIsRented] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        const data = await renterService.getRoomById(roomId);
        setRoom(data);
      } catch (err) {
        setError('Lấy thông tin phòng thất bại.');
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [roomId]);

  const handleRent = async () => {
    try {
      await renterService.rentRoom({
        room_id: room.room_id,
        rent_price: room.rent_price,
      });
      alert('Bạn đã thuê phòng thành công!');
      setIsRented(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi thuê phòng');
    }
  };

  if (loading) return <p>Đang tải thông tin phòng...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!room) return <p>Không tìm thấy phòng.</p>;

  return (
    <div className="room-container">
      <div className="room-card">
        <img
          className="room-image"
          src={room.image_url || 'https://via.placeholder.com/500x300?text=No+Image'}
          alt="Phòng"
        />
        <div className="room-content">
          <h2>{room.room_type_name}</h2>
          <p><strong>Số phòng:</strong> {room.room_number}</p>
          <p><strong>Địa chỉ:</strong> {room.property_address}</p>
          <p><strong>Giá thuê:</strong> {Number(room.rent_price).toLocaleString('vi-VN')} VNĐ</p>
          <p><strong>Giá điện:</strong> {Number(room.electricity_price).toLocaleString('vi-VN')} VNĐ/kWh</p>
          <p><strong>Giá nước:</strong> {Number(room.water_price).toLocaleString('vi-VN')} VNĐ/m³</p>
          <p><strong>Sức chứa tối đa:</strong> {room.max_occupants} người</p>
          <p><strong>Trạng thái:</strong> {room.status === 'Available' ? 'Còn trống' : 'Đã thuê hoặc bảo trì'}</p>
          <p><strong>Mô tả:</strong> {room.description || 'Không có mô tả.'}</p>

          {!isRented && room.status === 'Available' ? (
            <button className="rent-button" onClick={handleRent}>Thuê phòng này</button>
          ) : (
            <p className="rented-msg">{isRented ? 'Bạn đang thuê phòng này.' : 'Phòng hiện không sẵn sàng.'}</p>
          )}
        </div>
      </div>

      <style>{`
        .room-container {
          padding: 24px;
          display: flex;
          justify-content: center;
        }

        .room-card {
          max-width: 800px;
          width: 100%;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .room-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
        }

        .room-content {
          padding: 24px;
        }

        .room-content h2 {
          font-size: 24px;
          margin-bottom: 16px;
          color: #333;
        }

        .room-content p {
          margin: 8px 0;
          font-size: 16px;
        }

        .rent-button {
          margin-top: 20px;
          padding: 12px 20px;
          font-size: 16px;
          font-weight: bold;
          color: white;
          background-color: #007bff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .rent-button:hover {
          background-color: #0056b3;
        }

        .rented-msg {
          margin-top: 20px;
          font-size: 16px;
          font-weight: bold;
          color: #28a745;
        }

        @media (max-width: 768px) {
          .room-image {
            height: 200px;
          }

          .room-content h2 {
            font-size: 20px;
          }

          .room-content p {
            font-size: 14px;
          }

          .rent-button {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default RoomDetailRenterPage;
