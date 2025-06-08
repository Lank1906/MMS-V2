import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getContractById } from '../services/contractService';
import { getRoomById } from '../services/roomService';
import { getRoomServices } from '../services/roomServiceService';
import { getBillsByContract, createBill, deleteBill } from '../services/billService';
import '../assets/ContractDetailPage.css';

const ContractDetailPage = () => {
  const { contractId } = useParams();
  const [contract, setContract] = useState(null);
  const [room, setRoom] = useState(null);
  const [bills, setBills] = useState([]);
  const [lastBill, setLastBill] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [newBill, setNewBill] = useState({
    old_water: '',
    new_water: '',
    old_electric: '',
    new_electric: '',
    service_cost: '',
    electricity_amount: '',
    water_amount: '',
    rent_amount: '',
    amount: '',
    due_date: '',
    status: '',
    term_extended: 1
  });

  const fetchData = async () => {
    try {
      const contractData = await getContractById(contractId);
      setContract(contractData);
      const roomData = await getRoomById(contractData.room_id);
      setRoom(roomData);
      const billData = await getBillsByContract(contractId);
      setBills(billData);
      setLastBill(billData.length > 0 ? billData[billData.length - 1] : null);

      const services = await getRoomServices(roomData.room_id);
      const totalService = services.reduce((sum, s) => sum + (Number(s.service_price) || 0), 0);
      setNewBill(prev => ({
        ...prev,
        old_water: roomData.current_water_usage,
        old_electric: roomData.current_electricity_usage,
        service_cost: totalService
      }));
    } catch {
      alert('Lỗi tải dữ liệu!');
    }
  };

  useEffect(() => {
    fetchData();
  }, [contractId]);

  useEffect(() => {
    if (!room || !contract) return;

    const oldWater = parseFloat(newBill.old_water) || 0;
    const newWater = parseFloat(newBill.new_water) || 0;
    const oldElectric = parseFloat(newBill.old_electric) || 0;
    const newElectric = parseFloat(newBill.new_electric) || 0;
    const serviceCost = parseFloat(newBill.service_cost) || 0;
    const termExtended = parseInt(newBill.term_extended) || 0;

    let waterAmount = 0;
    let electricAmount = 0;
    if (newWater >= oldWater) {
      waterAmount = (newWater - oldWater) * room.water_price;
    }
    if (newElectric >= oldElectric) {
      electricAmount = (newElectric - oldElectric) * room.electricity_price;
    }

    const dueDate = new Date(newBill.due_date);
    const contractStart = new Date(contract.start_date);
    const isExpired = contract.term_months > 0 && lastBill && (() => {
      const monthsDiff = (new Date(lastBill.bill_month).getFullYear() - contractStart.getFullYear()) * 12 +
        (new Date(lastBill.bill_month).getMonth() - contractStart.getMonth());
      return monthsDiff >= contract.term_months;
    })();

    const rentAmount = isExpired ? (parseFloat(room.rent_price) || 0) * termExtended : 0;

    setNewBill(prev => ({
      ...prev,
      water_amount: Math.round(waterAmount),
      electricity_amount: Math.round(electricAmount),
      rent_amount: Math.round(rentAmount),
      amount: Math.round(waterAmount + electricAmount + serviceCost + rentAmount)
    }));
  }, [newBill.new_water, newBill.new_electric, newBill.service_cost, newBill.due_date, newBill.term_extended]);

  const handleOpenModal = () => {
    if (!contract || contract.status === 'Completed') return;
    let nextDueDate;
    if (lastBill) {
      const lastDate = new Date(lastBill.bill_month);
      nextDueDate = new Date(lastDate.setMonth(lastDate.getMonth() + 1)).toISOString().split("T")[0];
    } else {
      nextDueDate = new Date().toISOString().split("T")[0];
    }

    const startDate = new Date(contract.start_date);
    const monthsPassed = lastBill ? new Date(lastBill.bill_month).getMonth() - startDate.getMonth() +
      (12 * (new Date(lastBill.bill_month).getFullYear() - startDate.getFullYear())) : 0;

    const expired = contract.term_months > 0 && monthsPassed >= contract.term_months;

    setNewBill(prev => ({
      ...prev,
      due_date: nextDueDate,
      rent_amount: expired ? parseFloat(room.rent_price) : 0,
      term_extended: expired ? 1 : 0
    }));

    setShowBillModal(true);
  };

  const handleCreateBill = async (e) => {
  e.preventDefault();
  if (newBill.amount <= 0) {
    alert('Số điện hoặc nước mới không hợp lệ.');
    return;
  }
  try {
    await createBill({
      contract_id: parseInt(contractId),
      room_id: room.room_id,
      bill_month: newBill.due_date,
      total_amount: newBill.amount,
      electricity_amount: newBill.electricity_amount,
      water_amount: newBill.water_amount,
      service_amount: newBill.service_cost,
      rent_amount: newBill.rent_amount,
      term_extended: newBill.term_extended,
      payment_status: 'Unpaid',
      new_water: parseFloat(newBill.new_water),
      new_electric: parseFloat(newBill.new_electric)
    });
    setShowBillModal(false);
    fetchData();
  } catch {
    alert('Lỗi khi tạo hóa đơn!');
  }
};

  const handleDeleteBill = async (billId) => {
    if (!window.confirm('Bạn có chắc muốn xoá hóa đơn này không?')) return;
    try {
      await deleteBill(billId);
      fetchData();
    } catch {
      alert('Lỗi khi xoá!');
    }
  };

  return (
    <div className="contract-page">
      <div className="contract-room-info">
        {room && contract ? (
          <div className="info-grid">
            <div><strong>Số phòng:</strong> {room.room_number}</div>
            <div><strong>Loại phòng:</strong> {room.room_type_name}</div>
            <div><strong>Trạng thái:</strong> {room.status}</div>
            <div><strong>Người hiện tại:</strong> {room.current_occupants}</div>
            <div><strong>Sức chứa tối đa:</strong> {room.max_occupants}</div>
            <div><strong>Giá thuê phòng:</strong> {Number(room.rent_price).toLocaleString('vi-VN')} đ</div>
            <div><strong>Giá điện (đ/kWh):</strong> {Number(room.electricity_price).toLocaleString('vi-VN')} đ</div>
            <div><strong>Giá nước (đ/m³):</strong> {Number(room.water_price).toLocaleString('vi-VN')} đ</div>
            <div><strong>Loại tính phí:</strong> {room.charge_type === 'per_person' ? 'Theo người' : 'Theo đơn vị'}</div>
            <div><strong>Ngày bắt đầu HĐ:</strong> {new Date(contract.start_date).toLocaleDateString()}</div>
            <div><strong>Ngày kết thúc HĐ:</strong> {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : '-'}</div>
            <div><strong>Trạng thái HĐ:</strong> {contract.status}</div>
            <div><strong>Loại hợp đồng:</strong> {contract.term_months} tháng</div>
          </div>
        ) : <p>Đang tải thông tin...</p>}
      </div>

      <div className="bill-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Danh sách hóa đơn</h2>
          {contract && contract.status !== 'Completed' && (
            <button className="btn-add" onClick={handleOpenModal}>+ Thêm hóa đơn</button>
          )}
        </div>
        {bills.length === 0 ? (
          <p>Không có hóa đơn</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Số tiền</th>
                <th>Ngày đến hạn</th>
                <th>Trạng thái</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.bill_id}>
                  <td>{Number(bill.total_amount).toLocaleString('vi-VN')} đ</td>
                  <td>{new Date(bill.bill_month).toLocaleDateString()}</td>
                  <td>{bill.payment_status || '-'}</td>
                  <td>{bill.description || '-'}</td>
                  <td>
                    {contract && contract.status !== 'Completed' && (
                      <button className="btn-delete" onClick={() => handleDeleteBill(bill.bill_id)}>Xoá</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showBillModal && (
        <div className="bill-modal-overlay">
          <div className="bill-modal">
            <button className="close" onClick={() => setShowBillModal(false)}>×</button>
            <h3>Thêm hóa đơn</h3>
            <form onSubmit={handleCreateBill}>
              <label>Số điện cũ <input type="number" value={newBill.old_electric} readOnly /></label>
              <label>Số điện mới <input type="number" value={newBill.new_electric} onChange={e => setNewBill(p => ({ ...p, new_electric: e.target.value }))} required min={newBill.old_electric} /></label>
              <label>Tiền điện <input type="number" value={newBill.electricity_amount} readOnly /></label>
              <label>Số nước cũ <input type="number" value={newBill.old_water} readOnly /></label>
              <label>Số nước mới <input type="number" value={newBill.new_water} onChange={e => setNewBill(p => ({ ...p, new_water: e.target.value }))} required min={newBill.old_water} /></label>
              <label>Tiền nước <input type="number" value={newBill.water_amount} readOnly /></label>
              <label>Tiền dịch vụ <input type="number" value={newBill.service_cost} readOnly /></label>
              {newBill.rent_amount > 0 && (
                <>
                  <label>Tiền thuê phòng <input type="number" value={newBill.rent_amount} readOnly /></label>
                  <label>Gia hạn trước (tháng) <input type="number" value={newBill.term_extended} onChange={e => setNewBill(p => ({ ...p, term_extended: e.target.value }))} min={1} /></label>
                </>
              )}
              <label>Tổng tiền <input type="number" value={newBill.amount} readOnly /></label>
              <label>Ngày đến hạn <input type="date" value={newBill.due_date} onChange={e => setNewBill(p => ({ ...p, due_date: e.target.value }))} required /></label>
              <button type="submit">Lưu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetailPage;
