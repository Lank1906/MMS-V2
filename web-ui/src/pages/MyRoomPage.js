import React, { useState, useEffect } from 'react';
import { getActiveContracts, leaveRoom, getRoomById, createPayment } from '../services/renterService';
import '../assets/MyRoomPage.css';

const MyRoomPage = () => {
  const [contracts, setContracts] = useState([]);
  const [roomsMap, setRoomsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRooms, setExpandedRooms] = useState({});
  const [leavingContractId, setLeavingContractId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dataContracts = await getActiveContracts();
        setContracts(dataContracts || []);
        const uniqueRoomIds = [...new Set((dataContracts || []).map(c => c.room_id))];
        const rooms = await Promise.all(uniqueRoomIds.map(id => getRoomById(id)));
        const map = {};
        rooms.forEach(r => { if (r) map[r.room_id] = r; });
        setRoomsMap(map);
      } catch {
        setError('Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedContracts = contracts.reduce((acc, c) => {
    if (!acc[c.room_id]) acc[c.room_id] = [];
    acc[c.room_id].push(c);
    return acc;
  }, {});

  const toggle = (id) => {
    setExpandedRooms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const canLeave = (roomContracts) => roomContracts.some(c => c.payment_status === 'Paid');

  const handleLeave = async (roomContracts, roomId) => {
    const paid = roomContracts.find(c => c.payment_status === 'Paid');
    if (!paid) return alert('Phải thanh toán hợp đồng trước khi trả phòng');
    if (!window.confirm(`Trả phòng ${roomsMap[roomId]?.room_number}?`)) return;
    setLeavingContractId(paid.contract_id);
    try {
      await leaveRoom(paid.contract_id);
      alert('Trả phòng thành công!');
      setContracts(prev => prev.filter(c => c.contract_id !== paid.contract_id));
    } catch {
      alert('Lỗi trả phòng');
    } finally {
      setLeavingContractId(null);
    }
  };

  const getTotalAmount = (c) => {
    const rent = parseFloat(c.rent_price || '0');
    const elec = parseFloat(c.total_electricity_price || '0');
    const water = parseFloat(c.total_water_price || '0');
    const service = parseFloat(c.total_service_price || '0');
    return rent + elec + water + service;
  };

  const handlePayment = async (contract) => {
    if(!contract.end_date){
      alert("Chủ thuê chưa cập nhật số điện của bạn vui lòng chờ đợi!")
      return
    }
    try {
      const totalAmount = Math.floor(getTotalAmount(contract));
      const paymentData = await createPayment(
        totalAmount,
        contract.contract_id,
        `Thanh toán hợp đồng phòng ${roomsMap[contract.room_id]?.room_number}`,
        'http://localhost:3000/my-room'
      );

      if (paymentData && paymentData.payUrl) {
        window.location.href = paymentData.payUrl;
      } else {
        alert('Không thể lấy URL thanh toán');
      }
    } catch {
      alert('Lỗi khi tạo thanh toán');
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;
  if (!contracts.length) return <p>Bạn chưa thuê phòng nào.</p>;

  return (
    <div className="myroom-container">
      <h2>Phòng và hợp đồng thuê</h2>
      {Object.entries(groupedContracts).map(([roomId, roomContracts]) => {
        const room = roomsMap[roomId];
        const expanded = expandedRooms[roomId] || false;
        const leaveAllowed = canLeave(roomContracts);

        return (
          <div key={roomId} className="myroom-card">
            <div className="myroom-header" onClick={() => toggle(roomId)}>
              <div className="myroom-header-info">
                <img
                  src={'https://ho-ng-b-i-1.paiza-user-free.cloud:5000' + room.image_url}
                  alt={`Phòng ${room?.room_number}`}
                  className="myroom-img"
                />
                <div>
                  <div className="myroom-room-number">{room?.room_number || '...'}</div>
                  <div className="myroom-room-address">{room?.property_address || '...'}</div>
                </div>
              </div>
              <button
                className="myroom-leave-btn"
                disabled={!leaveAllowed || leavingContractId !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  leaveAllowed
                    ? handleLeave(roomContracts, roomId)
                    : alert('Phải thanh toán hợp đồng trước khi trả phòng');
                }}
              >
                {leavingContractId === roomContracts.find(c => c.payment_status === 'Paid')?.contract_id
                  ? 'Đang xử lý...'
                  : 'Trả phòng'}
              </button>
            </div>
            {expanded && (
              <table className="myroom-contract-table">
                <thead>
                  <tr>
                    <th>Mã hợp đồng</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Thanh toán</th>
                    <th>Tiền phòng</th>
                    <th>Điện</th>
                    <th>Nước</th>
                    <th>Dịch vụ</th>
                    <th><strong>Tổng</strong></th>
                    <th>Chức năng</th>
                  </tr>
                </thead>
                <tbody>
                  {roomContracts.map(c => (
                    <tr key={c.contract_id}>
                      <td>{c.contract_id}</td>
                      <td>{new Date(c.start_date).toLocaleDateString()} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : '-'}</td>
                      <td>{c.status}</td>
                      <td>{c.payment_status}</td>
                      <td>{parseFloat(c.rent_price).toLocaleString('vi-VN')}₫</td>
                      <td>{parseFloat(c.total_electricity_price).toLocaleString('vi-VN')}₫</td>
                      <td>{parseFloat(c.total_water_price).toLocaleString('vi-VN')}₫</td>
                      <td>{parseFloat(c.total_service_price).toLocaleString('vi-VN')}₫</td>
                      <td><strong>{getTotalAmount(c).toLocaleString('vi-VN')}₫</strong></td>
                      <td>
                        {c.payment_status === 'Unpaid' && (
                          <button
                            className="payment-btn"
                            onClick={() => handlePayment(c)}
                          >
                            Tạo thanh toán
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MyRoomPage;
