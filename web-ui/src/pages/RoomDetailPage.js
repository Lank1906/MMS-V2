import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getContracts, createContract, deleteContract } from '../services/contractService';
import { getRoomServices, createRoomService, deleteRoomService } from '../services/roomServiceService';
import { getRoomById } from '../services/roomService';
import { getServices } from '../services/serviceService';
import { getRoomRentersByRoomId, deleteRoomRenter } from '../services/roomRenterService';
import '../assets/RoomDetailPage.css'

const RoomDetailPage = () => {
    const { roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [services, setServices] = useState([]);
    const [roomRenters, setRoomRenters] = useState([]);

    const [showContractModal, setShowContractModal] = useState(false);
    const [newContract, setNewContract] = useState({
        start_date: '',
        end_date: '',
        rent_price: 0,
        status: '',
        old_water_usage: 0,
        old_electricity_usage: 0,
        new_water_usage: '',
        new_electricity_usage: '',
        total_water_price: 0,
        total_electricity_price: 0,
        total_service_price: 0,
    });

    const [showServiceModal, setShowServiceModal] = useState(false);
    const [newServiceId, setNewServiceId] = useState('');
    const [allServices, setAllServices] = useState([]);

    const fetchAll = async () => {
        try {
            const roomData = await getRoomById(roomId);
            setRoom(roomData);
            setNewContract(prev => ({
                ...prev,
                rent_price: roomData.rent_price,
                old_water_usage: roomData.current_water_usage || 0,
                old_electricity_usage: roomData.current_electricity_usage || 0,
            }));
            const contractsData = await getContracts(roomId);
            setContracts(contractsData);
            const servicesData = await getRoomServices(roomId);
            setServices(servicesData);
            const allSvcData = await getServices(1, 100);
            setAllServices(allSvcData);
            const rentersData = await getRoomRentersByRoomId(roomId);
            setRoomRenters(rentersData);
        } catch {
            alert('Lỗi tải dữ liệu');
        }
    };

    useEffect(() => { fetchAll(); }, [roomId]);

    useEffect(() => {
        if (!room) return;
        const waterPrice = room.water_price || 0;
        const elecPrice = room.electricity_price || 0;
        const newWater = parseFloat(newContract.new_water_usage);
        const newElec = parseFloat(newContract.new_electricity_usage);
        const oldWater = parseFloat(newContract.old_water_usage);
        const oldElec = parseFloat(newContract.old_electricity_usage);
        let waterUsed = 0;
        if (!isNaN(newWater) && newWater >= oldWater) waterUsed = newWater - oldWater;
        let elecUsed = 0;
        if (!isNaN(newElec) && newElec >= oldElec) elecUsed = newElec - oldElec;
        const waterCost = waterUsed * waterPrice;
        const elecCost = elecUsed * elecPrice;
        setNewContract(prev => ({
            ...prev,
            total_water_price: waterCost,
            total_electricity_price: elecCost,
        }));
    }, [newContract.new_water_usage, newContract.new_electricity_usage, room]);

    useEffect(() => {
        if (!services) return;
        const totalService = services.reduce((sum, svc) => sum + (svc.service_price || 0), 0);
        setNewContract(prev => ({ ...prev, total_service_price: totalService }));
    }, [services]);

    const handleAddContract = async (e) => {
        e.preventDefault();
        const { start_date, rent_price, status } = newContract;
        if (!start_date || !rent_price || !status) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        try {
            await createContract({ ...newContract, room_id: parseInt(roomId) });
            setNewContract({
                start_date: '',
                end_date: '',
                rent_price: room?.rent_price || 0,
                status: '',
                old_water_usage: room?.current_water_usage || 0,
                old_electricity_usage: room?.current_electricity_usage || 0,
                new_water_usage: '',
                new_electricity_usage: '',
                total_water_price: 0,
                total_electricity_price: 0,
                total_service_price: 0,
            });
            setShowContractModal(false);
            fetchAll();
        } catch {
            alert('Lỗi khi thêm hợp đồng');
        }
    };

    const handleDeleteContract = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) return;
        try {
            await deleteContract(id);
            fetchAll();
        } catch {
            alert('Lỗi khi xóa hợp đồng');
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        if (!newServiceId) {
            alert('Vui lòng chọn dịch vụ');
            return;
        }
        try {
            await createRoomService({ room_id: parseInt(roomId), service_id: parseInt(newServiceId) });
            setNewServiceId('');
            setShowServiceModal(false);
            fetchAll();
        } catch {
            alert('Lỗi khi thêm dịch vụ');
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
        try {
            await deleteRoomService(parseInt(roomId), serviceId);
            fetchAll();
        } catch {
            alert('Lỗi khi xóa dịch vụ');
        }
    };

    const handleDeleteRoomRenter = async (roomRenterId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xoá người thuê này khỏi phòng?')) return;
        try {
            await deleteRoomRenter(roomId, roomRenterId);
            fetchAll();
        } catch {
            alert('Lỗi khi xoá người thuê');
        }
    };

    return (
        <div style={{ display: 'flex', padding: 24, gap: 20, minHeight: '100vh', background: '#f5f7fa' }}>
            {/* Thông tin phòng (bên trái) */}
            <div style={{
                flexBasis: '32%',
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                lineHeight: 1.6,
            }}>
                {room ? (
                    <div className="room-info-box">
                        <h2>Thông tin phòng</h2>
                        <div className="room-info-grid">
                            <div className="label">Số phòng</div>
                            <div className="value">{room.room_number || '-'}</div>

                            <div className="label">Loại phòng</div>
                            <div className="value">{room.room_type_name || '-'}</div>

                            <div className="label">Trạng thái</div>
                            <div className="value">{room.status || '-'}</div>

                            <div className="label">Người hiện tại</div>
                            <div className="value">{room.current_occupants || 0}</div>

                            <div className="label">Sức chứa tối đa</div>
                            <div className="value">{room.max_occupants || 0}</div>

                            <div className="label">Giá thuê phòng</div>
                            <div className="value">{room.rent_price?.toLocaleString() || '0'} đ</div>

                            <div className="label">Giá điện (đ/kWh)</div>
                            <div className="value">{room.electricity_price || '0'}</div>

                            <div className="label">Giá nước (đ/m³)</div>
                            <div className="value">{room.water_price || '0'}</div>

                            <div className="label">Loại tính phí</div>
                            <div className="value">{room.charge_type === 'per_person' ? 'Theo người' : 'Theo đơn vị'}</div>

                            <div className="label">Mô tả</div>
                            <div
                                className="value"
                                style={{
                                    gridColumn: '1 / span 2',
                                    whiteSpace: 'pre-wrap',
                                    fontWeight: 500,
                                    fontSize: '16px',
                                    color: '#3949ab',
                                    marginTop: 6,
                                }}
                            >
                                {room.description || '-'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Đang tải thông tin phòng...</p>
                )}
            </div>

            {/* Phần bên phải: Hợp đồng + Dịch vụ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Danh sách hợp đồng */}
                <div style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    flexBasis: '33%',
                    overflowY: 'auto',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h2 style={{ margin: 0, color: '#333' }}>Hợp đồng phòng</h2>
                        <button
                            onClick={() => setShowContractModal(true)}
                            style={{
                                background: '#3f51b5',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            + Thêm hợp đồng
                        </button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#3f51b5', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: 12 }}>Ngày bắt đầu</th>
                                <th style={{ padding: 12 }}>Ngày kết thúc</th>
                                <th style={{ padding: 12 }}>Tiền thuê</th>
                                <th style={{ padding: 12 }}>Tiền nước</th>
                                <th style={{ padding: 12 }}>Tiền điện</th>
                                <th style={{ padding: 12 }}>Tiền dịch vụ</th>
                                <th style={{ padding: 12 }}>Trạng thái</th>
                                <th style={{ padding: 12 }}>Phương thức</th>
                                <th style={{ padding: 12 }}>Trang thái thanh toán</th>
                                <th style={{ padding: 12 }}>Ngày</th>
                                <th style={{ padding: 12 }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: 12, textAlign: 'center' }}>Không có hợp đồng</td>
                                </tr>
                            ) : (
                                contracts.map(contract => (
                                    <tr key={contract.contract_id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 12 }}>{new Date(contract.start_date).toLocaleDateString()}</td>
                                        <td style={{ padding: 12 }}>{contract.end_date ? new Date(contract.end_date).toLocaleDateString() : '-'}</td>
                                        <td style={{ padding: 12 }}>{contract.rent_price.toLocaleString()} đ</td>
                                        <td style={{ padding: 12 }}>{contract.total_water_price?.toLocaleString() || 0} đ</td>
                                        <td style={{ padding: 12 }}>{contract.total_electricity_price?.toLocaleString() || 0} đ</td>
                                        <td style={{ padding: 12 }}>{contract.total_service_price?.toLocaleString() || 0} đ</td>
                                        <td style={{ padding: 12 }}>{contract.status}</td>
                                        <td style={{ padding: 12 }}>{contract.payment_method}</td>
                                        <td style={{ padding: 12 }}>{contract.payment_status}</td>
                                        <td style={{ padding: 12 }}>{contract.payment_date}</td>
                                        <td style={{ padding: 12 }}>
                                            <button
                                                onClick={() => handleDeleteContract(contract.contract_id)}
                                                style={{ background: '#f44336', color: 'white', padding: '6px 12px', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Danh sách dịch vụ */}
                <div style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    flexBasis: '33%',
                    overflowY: 'auto',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h2 style={{ margin: 0, color: '#333' }}>Dịch vụ phòng</h2>
                        <button
                            onClick={() => setShowServiceModal(true)}
                            style={{
                                background: '#3f51b5',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            + Thêm dịch vụ
                        </button>
                    </div>
                    {services.length === 0 ? (
                        <p>Chưa có dịch vụ</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {services.map(service => (
                                <li
                                    key={service.service_id}
                                    style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', color: '#555' }}
                                >
                                    <div>
                                        <div><b>{service.service_name}</b></div>
                                        <div>Giá: {service.service_price?.toLocaleString()} đ</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteService(service.service_id)}
                                        style={{ background: '#f44336', color: 'white', padding: '6px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', height: 'fit-content' }}
                                    >
                                        Xóa
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    flexBasis: '33%',
                    overflowY: 'auto',
                }}>
                    <h2 style={{ marginBottom: 12, color: '#333' }}>Người thuê trong phòng</h2>
                    {roomRenters.length === 0 ? (
                        <p>Không có người thuê</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ background: '#3f51b5', color: 'white', textAlign: 'left' }}>
                                    <th style={{ padding: 12 }}>Tên</th>
                                    <th style={{ padding: 12 }}>SĐT</th>
                                    <th style={{ padding: 12 }}>Ngày vào</th>
                                    <th style={{ padding: 12 }}>Trạng thái</th>
                                    <th style={{ padding: 12 }}>Ngày rời</th>
                                    <th style={{ padding: 12 }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomRenters.map(renter => (
                                    <tr key={renter.room_renter_id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 12 }}>{renter.username}</td>
                                        <td style={{ padding: 12 }}>{renter.phone}</td>
                                        <td style={{ padding: 12 }}>{renter.join_date ? new Date(renter.join_date).toLocaleDateString() : '-'}</td>
                                        <td style={{ padding: 12 }}>{renter.status}</td>
                                        <td style={{ padding: 12 }}>{renter.leave_date ? new Date(renter.leave_date).toLocaleDateString() : '-'}</td>
                                        <td style={{ padding: 12 }}>
                                            <button
                                                onClick={() => handleDeleteRoomRenter(renter.room_renter_id)}
                                                style={{ background: '#f44336', color: 'white', padding: '6px 12px', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                            >
                                                Xoá
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {/* Modal thêm hợp đồng */}
            {showContractModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                }}>
                    <div style={{
                        background: 'white', padding: 24, borderRadius: 12, width: 420,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', position: 'relative',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <button
                            onClick={() => setShowContractModal(false)}
                            style={{
                                position: 'absolute', top: 12, right: 20, border: 'none',
                                background: 'transparent', fontSize: 26, cursor: 'pointer', color: '#333'
                            }}
                            aria-label="Đóng"
                        >
                            ×
                        </button>
                        <h3>Thêm hợp đồng mới</h3>
                        <form onSubmit={handleAddContract} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                            <label>
                                Ngày bắt đầu <span style={{ color: 'red' }}>*</span>
                                <input
                                    type="date"
                                    value={newContract.start_date}
                                    onChange={e => setNewContract(prev => ({ ...prev, start_date: e.target.value }))}
                                    required
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
                                />
                            </label>
                            <label>
                                Ngày kết thúc
                                <input
                                    type="date"
                                    value={newContract.end_date}
                                    onChange={e => setNewContract(prev => ({ ...prev, end_date: e.target.value }))}
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
                                />
                            </label>
                            <label>
                                Tiền thuê phòng (theo loại phòng)
                                <input
                                    type="number"
                                    value={newContract.rent_price}
                                    readOnly
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%', backgroundColor: '#eee' }}
                                />
                            </label>
                            <label>
                                Số nước cũ (m³)
                                <input
                                    type="number"
                                    value={newContract.old_water_usage}
                                    readOnly
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%', backgroundColor: '#eee' }}
                                />
                            </label>
                            <label>
                                Số nước mới (m³)
                                <input
                                    type="number"
                                    value={newContract.new_water_usage}
                                    onChange={e => setNewContract(prev => ({ ...prev, new_water_usage: e.target.value }))}
                                    required
                                    min={newContract.old_water_usage}
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
                                />
                            </label>
                            <label>
                                Tiền nước (tự tính)
                                <input
                                    type="number"
                                    value={newContract.total_water_price}
                                    readOnly
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%', backgroundColor: '#eee' }}
                                />
                            </label>
                            <label>
                                Số điện cũ (kWh)
                                <input
                                    type="number"
                                    value={newContract.old_electricity_usage}
                                    readOnly
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%', backgroundColor: '#eee' }}
                                />
                            </label>
                            <label>
                                Số điện mới (kWh)
                                <input
                                    type="number"
                                    value={newContract.new_electricity_usage}
                                    onChange={e => setNewContract(prev => ({ ...prev, new_electricity_usage: e.target.value }))}
                                    required
                                    min={newContract.old_electricity_usage}
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
                                />
                            </label>
                            <label>
                                Tiền điện (tự tính)
                                <input
                                    type="number"
                                    value={newContract.total_electricity_price}
                                    readOnly
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%', backgroundColor: '#eee' }}
                                />
                            </label>
                            <label>
                                Tổng tiền dịch vụ (tự tính)
                                <input
                                    type="number"
                                    value={newContract.total_service_price}
                                    readOnly
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%', backgroundColor: '#eee' }}
                                />
                            </label>
                            <label>
                                Trạng thái <span style={{ color: 'red' }}>*</span>
                                <select
                                    value={newContract.status}
                                    onChange={e => setNewContract(prev => ({ ...prev, status: e.target.value }))}
                                    required
                                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
                                >
                                    <option value="">Chọn trạng thái</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Terminated">Terminated</option>
                                </select>
                            </label>
                            <button type="submit" style={{
                                backgroundColor: '#3f51b5',
                                color: 'white',
                                padding: '10px 0',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: 16
                            }}>
                                Lưu
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal thêm dịch vụ */}
            {showServiceModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                }}>
                    <div style={{
                        background: 'white', padding: 24, borderRadius: 12, width: 300,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowServiceModal(false)}
                            style={{
                                position: 'absolute', top: 10, right: 15, border: 'none',
                                background: 'transparent', fontSize: 24, cursor: 'pointer', color: '#333'
                            }}
                        >
                            ×
                        </button>
                        <h3>Thêm dịch vụ</h3>
                        <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                            <select
                                value={newServiceId}
                                onChange={e => setNewServiceId(e.target.value)}
                                required
                                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
                            >
                                <option value="">Chọn dịch vụ</option>
                                {allServices.map(s => (
                                    <option key={s.service_id} value={s.service_id}>{s.service_name} - {s.service_price?.toLocaleString()} đ</option>
                                ))}
                            </select>
                            <button type="submit" style={{
                                backgroundColor: '#3f51b5',
                                color: 'white',
                                padding: '10px 0',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: 16
                            }}>
                                Lưu
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomDetailPage;