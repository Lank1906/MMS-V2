import React, { useState, useEffect } from 'react';
import {
  getActiveContracts,
  leaveRoom,
  getRoomById,
  createPayment,
  cancelContract,
  simulatePayment,
  getBillsByContractId
} from '../services/renterService';
import '../assets/MyRoomPage.css';

const MyRoomPage = () => {
  const [contracts, setContracts] = useState([]);
  const [roomsMap, setRoomsMap] = useState({});
  const [billsMap, setBillsMap] = useState({});
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

        const uniqueRoomIds = [...new Set(dataContracts.map(c => c.room_id))];
        const rooms = await Promise.all(uniqueRoomIds.map(id => getRoomById(id)));
        const roomMap = {};
        rooms.forEach(r => { if (r) roomMap[r.room_id] = r; });
        setRoomsMap(roomMap);

        const billData = {};
        for (const contract of dataContracts) {
          const bills = await getBillsByContractId(contract.contract_id);
          billData[contract.contract_id] = bills;
        }
        setBillsMap(billData);
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

  const canLeave = (roomContracts) => {
    return roomContracts.every(contract => {
      const bills = billsMap[contract.contract_id] || [];
      return bills.length > 0 && bills.every(b => b.payment_status === 'Paid');
    });
  };

  const handleLeave = async (roomContracts, roomId) => {
    const unpaidContract = roomContracts.find(c => {
      const bills = billsMap[c.contract_id] || [];
      return bills.some(b => b.payment_status !== 'Paid');
    });

    if (unpaidContract) {
      return alert('Phải thanh toán tất cả hóa đơn trước khi trả phòng.');
    }

    const contractToLeave = roomContracts[0];
    if (!window.confirm(`Trả phòng ${roomsMap[roomId]?.room_number}?`)) return;

    setLeavingContractId(contractToLeave.contract_id);
    try {
      await leaveRoom(contractToLeave.contract_id);
      alert('Trả phòng thành công!');
      setContracts(prev => prev.filter(c => c.contract_id !== contractToLeave.contract_id));
    } catch {
      alert('Lỗi trả phòng');
    } finally {
      setLeavingContractId(null);
    }
  };

  const handlePayment = async (contract, bill) => {
    if (!contract.end_date) {
      alert("Chủ thuê chưa cập nhật số điện của bạn. Vui lòng chờ đợi!");
      return;
    }

    try {

      const paymentData = await createPayment(
        50000,
        contract.contract_id,
        `Thanh toán hợp đồng phòng ${roomsMap[contract.room_id]?.room_number}`,
        'https://lank1906.github.io/MMS-V2/#/my-room'
      );

      if (paymentData?.payUrl) {
        window.location.href = paymentData.payUrl;
      } else {
        alert('Không thể lấy URL thanh toán.');
      }
    } catch {
      alert('Lỗi khi tạo thanh toán.');
    }
  };

  const handleCancel = async (contract) => {
    const start = new Date(contract.start_date);
    const today = new Date();
    const diffInDays = Math.ceil((start.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000);
    if (diffInDays < 0 || diffInDays > 3) {
      alert('Bạn chỉ có thể hủy hợp đồng trong vòng 3 ngày sau khi bắt đầu.');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn hủy hợp đồng ${contract.contract_id}?`)) return;

    try {
      await cancelContract(contract.contract_id);
      alert('Hủy hợp đồng thành công!');
      setContracts(prev => prev.filter(c => c.contract_id !== contract.contract_id));
    } catch {
      alert('Lỗi khi hủy hợp đồng.');
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
                  <div className="myroom-room-number">{room?.room_number}</div>
                  <div className="myroom-room-address">{room?.property_address}</div>
                </div>
                <div className="myroom-owner">
                  <span><strong>Chủ nhà:</strong> {room?.landlord_name} ({room?.landlord_phone})</span>
                </div>
              </div>
              <button
                className="myroom-leave-btn"
                disabled={!leaveAllowed || leavingContractId !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeave(roomContracts, roomId);
                }}
              >
                {leavingContractId === roomContracts[0].contract_id
                  ? 'Đang xử lý...'
                  : 'Trả phòng'}
              </button>
            </div>
            {expanded && (
              <table className="myroom-contract-table">
                <thead>
                  <tr>
                    <th>Mã hóa đơn</th>
                    <th>Thời gian</th>
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
                  {roomContracts.map(c => {
                    const bills = billsMap[c.contract_id] || [];
                    return bills.map((bill, idx) => (
                      <tr key={`${c.contract_id}_${idx}`}>
                        <td>{bill?.bill_id}</td>
                        <td>{new Date(c.start_date).toLocaleDateString()} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : '-'}</td>
                        <td>{bill?.payment_status || 'Unpaid'}</td>
                        <td>{bill?.rent_amount?.toLocaleString('vi-VN') || 0}₫</td>
                        <td>{bill?.electricity_amount?.toLocaleString('vi-VN') || 0}₫</td>
                        <td>{bill?.water_amount?.toLocaleString('vi-VN') || 0}₫</td>
                        <td>{bill?.service_amount?.toLocaleString('vi-VN') || 0}₫</td>
                        <td><strong>{bill?.total_amount?.toLocaleString('vi-VN') || 0}₫</strong></td>
                        <td>
                          {bill?.payment_status === 'Unpaid' && (
                            <>
                              <button className="payment-btn" onClick={() => handlePayment(c, bill)}>
                                Tạo thanh toán
                              </button>
                              <br />
                              <button
                                className="cancel-btn payment-btn"
                                style={{ backgroundColor: '#f44336', color: 'white' }}
                                onClick={() => handleCancel(c)}
                              >
                                Hủy hợp đồng
                              </button>
                              <button
                                className="simulate-btn payment-btn"
                                style={{ backgroundColor: '#9c27b0', color: 'white', marginTop: '6px' }}
                                onClick={async () => {
                                  if (window.confirm('Bạn có chắc muốn giả lập thanh toán cho hóa đơn này?')) {
                                    try {
                                      await simulatePayment(c.contract_id);
                                      setBillsMap(prev => ({
                                        ...prev,
                                        [c.contract_id]: prev[c.contract_id].map(b =>
                                          b.bill_id === bill.bill_id
                                            ? { ...b, payment_status: 'Paid', payment_date: new Date() }
                                            : b
                                        )
                                      }));
                                      alert('Giả lập thanh toán thành công!');
                                    } catch {
                                      alert('Lỗi khi giả lập thanh toán!');
                                    }
                                  }
                                }}
                              >
                                Giả lập thanh toán
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ));
                  })}
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
