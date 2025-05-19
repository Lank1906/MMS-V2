import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import renterService from '../services/renterService'; // Đường dẫn tùy file bạn lưu

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
      // Giả sử rentRoom cần room_id và rent_price
      await renterService.rentRoom({
        room_id: room.room_id,
        rent_price: room.rent_price,
      });
      alert('Bạn đã thuê phòng thành công!');
      setIsRented(true);
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  if (loading) return <p>Đang tải thông tin phòng...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!room) return <p>Không tìm thấy phòng.</p>;

  return (
    <div className="room-detail-container">
      <h2>Chi tiết phòng (ID: {room.room_id})</h2>
      <div className="room-info">
        <p><b>Số phòng:</b> {room.room_number}</p>
        <p><b>Địa chỉ:</b> {room.property_address}</p>
        <p><b>Giá thuê:</b> {room.rent_price.toLocaleString()} VNĐ</p>
        <p><b>Loại phòng:</b> {room.room_type_name}</p>
      </div>

      {!isRented ? (
        <button className="rent-btn" onClick={handleRent}>Thuê phòng này</button>
      ) : (
        <p className="rented-msg">Bạn đang thuê phòng này.</p>
      )}

      <style>{`
        .room-detail-container {
          max-width: 500px;
          margin: 20px auto;
          padding: 24px;
          background: #fff;
          box-shadow: 0 0 10px rgb(0 0 0 / 0.1);
          border-radius: 12px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }
        h2 {
          margin-bottom: 20px;
          font-weight: 600;
          text-align: center;
          color: #222;
        }
        .room-info p {
          font-size: 16px;
          margin: 8px 0;
          line-height: 1.4;
        }
        .room-info b {
          color: #555;
        }
        .rent-btn {
          display: block;
          width: 100%;
          padding: 12px;
          margin-top: 24px;
          background-color: #007bff;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.25s ease;
        }
        .rent-btn:hover {
          background-color: #0056b3;
        }
        .rented-msg {
          margin-top: 24px;
          font-weight: 600;
          color: #28a745;
          text-align: center;
          font-size: 16px;
        }
        @media (max-width: 600px) {
          .room-detail-container {
            margin: 10px;
            padding: 16px;
          }
          h2 {
            font-size: 20px;
          }
          .rent-btn {
            font-size: 14px;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default RoomDetailRenterPage;
