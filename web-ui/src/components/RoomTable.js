import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoomTable = ({ rooms, onEdit, onDelete }) => {
  const navigate = useNavigate();
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ backgroundColor: '#eee' }}>
        <tr>
          <th>Số phòng</th>
          <th>Loại phòng</th>
          <th>Trạng thái</th>
          <th>Giá thuê</th>
          <th>Số người tối đa</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {rooms.length === 0 ? (
          <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không có phòng</td></tr>
        ) : rooms.map(room => (
          <tr key={room.room_id}>
            <td onClick={() => navigate(`/room-detail/${room.room_id}`)} style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>{room.room_number}</td>
            <td>{room.room_type_name}</td>
            <td>{room.status}</td>
            <td>{Number(room.rent_price)?.toLocaleString('vi-VN')}₫</td>
            <td>{room.max_occupants}</td>
            <td>
              <button onClick={() => onEdit(room)}>Sửa</button>{' '}
              <button onClick={() => onDelete(room.room_id)}>Xóa</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RoomTable;
