import React, { useState, useEffect } from 'react';
import { getRoomById, getActiveContracts, leaveRoom } from '../services/renterService'; // Import service
import '../assets/MyRoomPage.css'; // Thêm CSS nếu cần

const MyRoomPage = () => {
  const [room, setRoom] = useState(null); // Thông tin phòng đang thuê
  const [contracts, setContracts] = useState([]); // Danh sách hợp đồng chưa thanh toán
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch thông tin phòng và hợp đồng chưa thanh toán
  useEffect(() => {
    const fetchRoomAndContracts = async () => {
      try {
        // Lấy thông tin phòng đang thuê
        const roomData = await getRoomById(1); // Lấy phòng theo userId hoặc roomId
        if (roomData) {
          setRoom(roomData);
        } else {
          setRoom(null); // Nếu chưa thuê phòng
        }

        // Lấy danh sách hợp đồng chưa thanh toán
        const contractData = await getActiveContracts();
        setContracts(contractData);
      } catch (error) {
        setError('Không thể lấy thông tin phòng và hợp đồng');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomAndContracts();
  }, []);

  // Xử lý trả phòng
  const handleLeaveRoom = async () => {
    if (contracts.length > 0 && contracts[0].payment_status === 'Paid') {
      try {
        // Trả phòng
        await leaveRoom(contracts[0].contract_id);
        alert('Bạn đã trả phòng thành công!');
        setRoom(null); // Reset phòng sau khi trả
        setContracts([]); // Reset hợp đồng sau khi trả phòng
      } catch (error) {
        alert('Lỗi khi trả phòng');
      }
    } else {
      alert('Bạn cần hoàn thành thanh toán hợp đồng trước khi rời phòng');
    }
  };

  if (loading) return <p>Đang tải thông tin...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="room-lease-container">
      <h2>Thông tin phòng đang thuê</h2>

      {room ? (
        <div className="room-info">
          <h3>Thông tin phòng</h3>
          <div className="room-field">
            <label>Số phòng:</label>
            <span>{room.room_number}</span>
          </div>

          <div className="room-field">
            <label>Loại phòng:</label>
            <span>{room.room_type_name}</span>
          </div>

          <div className="room-field">
            <label>Địa chỉ phòng:</label>
            <span>{room.property_address}</span>
          </div>

          <div className="room-field">
            <label>Trạng thái phòng:</label>
            <span>{room.status}</span>
          </div>

          <div className="room-field">
            <label>Ảnh phòng:</label>
            {room.image_url ? (
              <img src={room.image_url} alt="Room" style={{ width: '200px', height: '150px' }} />
            ) : (
              <span>Chưa có ảnh phòng</span>
            )}
          </div>

          {contracts.length === 0 ? (
            <p>Hiện tại bạn chưa thuê phòng nào.</p>
          ) : (
            <button 
              onClick={handleLeaveRoom} 
              disabled={contracts.length === 0 || contracts[0].payment_status !== 'Paid'}
            >
              {contracts.length === 0 || contracts[0].payment_status !== 'Paid' ? 
                'Hoàn thành thanh toán trước khi rời phòng' : 'Rời phòng'}
            </button>
          )}
        </div>
      ) : (
        <p>Bạn chưa thuê phòng nào. Hãy tìm và thuê phòng ngay!</p>
      )}

      {contracts.length > 0 && (
        <div className="contract-info">
          <h3>Thông tin hợp đồng</h3>
          <div className="contract-field">
            <label>Thời gian thuê:</label>
            <span>{contracts[0].start_date} - {contracts[0].end_date}</span>
          </div>

          <div className="contract-field">
            <label>Trạng thái hợp đồng:</label>
            <span>{contracts[0].status}</span>
          </div>

          <div className="contract-field">
            <label>Trạng thái thanh toán:</label>
            <span>{contracts[0].payment_status}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRoomPage;
