import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const RoomDetailRenterPage = () => {
  const { roomId } = useParams();

  // Mock dữ liệu giả lập
  const room = {
    room_id: roomId,
    room_number: 'B202',
    property_address: '456 Nguyễn Huệ',
    rent_price: 3500000,
    room_type_name: 'Phòng đôi',
  };

  const [isRented, setIsRented] = useState(false);

  const handleRent = () => {
    alert('Bạn đã thuê phòng thành công!');
    setIsRented(true);
  };

  return (
    <div>
      <h2>Chi tiết phòng (ID: {room.room_id})</h2>
      <p><b>Số phòng:</b> {room.room_number}</p>
      <p><b>Địa chỉ:</b> {room.property_address}</p>
      <p><b>Giá thuê:</b> {room.rent_price.toLocaleString()} VNĐ</p>
      <p><b>Loại phòng:</b> {room.room_type_name}</p>

      {!isRented ? (
        <button onClick={handleRent}>Thuê phòng này</button>
      ) : (
        <p>Bạn đang thuê phòng này.</p>
      )}
    </div>
  );
};

export default RoomDetailRenterPage;
