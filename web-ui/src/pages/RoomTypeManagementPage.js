import React, { useEffect, useState } from 'react';
import {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} from '../services/roomTypeService';
import '../assets/RoomTypeManagement.css';

const RoomTypeManagementPage = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    max_occupants: '',
    rent_price: '',
    electricity_price: '',
    water_price: '',
    charge_type: 'per_person',
  });
  const [submitting, setSubmitting] = useState(false);

  // Load danh sách loại phòng
  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const data = await getRoomTypes(page, limit, search);
      setRoomTypes(data.roomTypes || []);
      setTotal(data.total || 0);
    } catch {
      alert('Lỗi khi tải danh sách loại phòng');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [page, search]);

  // Mở modal thêm mới
  const openAddModal = () => {
    setEditingRoomType(null);
    setForm({
      name: '',
      description: '',
      max_occupants: '',
      rent_price: '',
      electricity_price: '',
      water_price: '',
      charge_type: 'per_person',
    });
    setModalVisible(true);
  };

  // Mở modal sửa
  const openEditModal = (roomType) => {
    setEditingRoomType(roomType);
    setForm({
      name: roomType.name || '',
      description: roomType.description || '',
      max_occupants: roomType.max_occupants || '',
      rent_price: roomType.rent_price || '',
      electricity_price: roomType.electricity_price || '',
      water_price: roomType.water_price || '',
      charge_type: roomType.charge_type || 'per_person',
    });
    setModalVisible(true);
  };

  // Đóng modal
  const closeModal = () => {
    if (submitting) return;
    setModalVisible(false);
  };

  // Xử lý input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Tên loại phòng không được để trống');
    if (!form.max_occupants || form.max_occupants <= 0) return alert('Số người tối đa phải > 0');
    if (!form.rent_price || form.rent_price <= 0) return alert('Giá thuê phải > 0');

    setSubmitting(true);
    try {
      if (editingRoomType) {
        await updateRoomType(editingRoomType.room_type_id, form);
        alert('Cập nhật loại phòng thành công');
      } else {
        await createRoomType(form);
        alert('Thêm loại phòng thành công');
      }
      closeModal();
      fetchRoomTypes();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi lưu loại phòng');
    }
    setSubmitting(false);
  };

  // Xóa loại phòng
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa loại phòng này?')) return;
    try {
      await deleteRoomType(id);
      alert('Xóa loại phòng thành công');
      fetchRoomTypes();
    } catch {
      alert('Lỗi khi xóa loại phòng');
    }
  };

  return (
    <div className="room-type-container">
      <div className="room-type-header">
        <h1>Quản lý loại phòng</h1>
        <button onClick={openAddModal}>＋ Thêm loại phòng</button>
      </div>

      <div className="room-type-search">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên loại phòng"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="room-type-table">
          <thead>
            <tr>
              <th>Tên loại phòng</th>
              <th>Mô tả</th>
              <th>Số người tối đa</th>
              <th>Giá thuê (VNĐ)</th>
              <th>Giá điện (VNĐ/kWh)</th>
              <th>Giá nước (VNĐ/m³)</th>
              <th>Loại tính phí</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.length === 0 ? (
              <tr className="no-data">
                <td colSpan="8">Không có loại phòng nào</td>
              </tr>
            ) : (
              roomTypes.map(rt => (
                <tr key={rt.room_type_id}>
                  <td>{rt.name}</td>
                  <td>{rt.description}</td>
                  <td>{rt.max_occupants}</td>
                  <td>{Number(rt.rent_price)?.toLocaleString('vi-VN')}</td>
                  <td>{Number(rt.electricity_price)?.toLocaleString('vi-VN')}</td>
                  <td>{Number(rt.water_price)?.toLocaleString('vi-VN')}</td>
                  <td>{rt.charge_type === 'per_person' ? 'Theo người' : 'Theo đơn vị'}</td>
                  <td className="action-buttons">
                    <button onClick={() => openEditModal(rt)}>Sửa</button>
                    <button className="delete" onClick={() => handleDelete(rt.room_type_id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
          Trang trước
        </button>
        <span>Trang {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / limit)}>
          Trang sau
        </button>
      </div>

      {/* Modal form */}
      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={closeModal}
              disabled={submitting}
              aria-label="Đóng form"
            >
              &times;
            </button>

            <form onSubmit={handleSubmit} noValidate>
              <h2>{editingRoomType ? 'Cập nhật loại phòng' : 'Thêm loại phòng mới'}</h2>

              <label>
                Tên loại phòng:
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={submitting}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Mô tả:
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={submitting}
                  rows={3}
                  maxLength={500}
                />
              </label>

              <label>
                Số người tối đa:
                <input
                  type="number"
                  name="max_occupants"
                  value={form.max_occupants}
                  onChange={handleChange}
                  disabled={submitting}
                  min={1}
                  required
                />
              </label>

              <label>
                Giá thuê (VNĐ):
                <input
                  type="number"
                  name="rent_price"
                  value={form.rent_price}
                  onChange={handleChange}
                  disabled={submitting}
                  min={0}
                  step="1000"
                  required
                />
              </label>

              <label>
                Giá điện (VNĐ/kWh):
                <input
                  type="number"
                  name="electricity_price"
                  value={form.electricity_price}
                  onChange={handleChange}
                  disabled={submitting}
                  min={0}
                  step="100"
                />
              </label>

              <label>
                Giá nước (VNĐ/m³):
                <input
                  type="number"
                  name="water_price"
                  value={form.water_price}
                  onChange={handleChange}
                  disabled={submitting}
                  min={0}
                  step="100"
                />
              </label>

              <label>
                Loại tính phí:
                <select
                  name="charge_type"
                  value={form.charge_type}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="per_person">Theo người</option>
                  <option value="per_unit">Theo đơn vị</option>
                </select>
              </label>

              <button type="submit" disabled={submitting} style={{ marginTop: 15 }}>
                {submitting ? 'Đang xử lý...' : editingRoomType ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypeManagementPage;
