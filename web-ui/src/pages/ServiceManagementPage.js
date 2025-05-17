import React, { useEffect, useState } from 'react';
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../services/serviceService';
import '../assets/ServiceManagementPage.css';

const ServiceManagementPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({ service_name: '', service_description: '', service_price: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const limit = 10;

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await getServices(page, limit, search);
      // ✅ Phòng thủ an toàn ở FE
      if (Array.isArray(res)) {
        setServices(res);
        setTotal(res.length);
      } else if (res.services) {
        setServices(res.services);
        setTotal(res.total ?? res.services.length);
      } else {
        setServices([]);
        setTotal(0);
      }
    } catch (error) {
      alert('Lỗi khi tải danh sách dịch vụ');
      setServices([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, [page, search]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openFormForAdd = () => {
    setEditingId(null);
    setFormData({ service_name: '', service_description: '', service_price: '' });
    setShowForm(true);
  };

  const openFormForEdit = (service) => {
    setEditingId(service.service_id);
    setFormData({
      service_name: service.service_name,
      service_description: service.service_description || '',
      service_price: service.service_price,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service_name.trim() || !formData.service_price) {
      alert('Tên và giá dịch vụ không được để trống');
      return;
    }
    try {
      if (editingId) {
        await updateService(editingId, formData);
        alert('Cập nhật dịch vụ thành công');
      } else {
        await createService(formData);
        alert('Thêm dịch vụ thành công');
      }
      setFormData({ service_name: '', service_description: '', service_price: '' });
      setEditingId(null);
      setShowForm(false);
      fetchServices();
    } catch (error) {
      alert('Lỗi khi lưu dịch vụ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      try {
        await deleteService(id);
        alert('Xóa thành công');
        fetchServices();
      } catch (error) {
        alert('Lỗi khi xóa dịch vụ');
      }
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="service-page">
      <h1>Quản lý dịch vụ phòng</h1>

      <div className="top-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên dịch vụ..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />
        <button className="btn add-btn" onClick={openFormForAdd}>＋ Thêm dịch vụ mới</button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <table className="service-table">
          <thead>
            <tr>
              <th>Tên dịch vụ</th>
              <th>Mô tả</th>
              <th>Giá</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(services?.length ?? 0) === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
              </tr>
            )}
            {services?.map(s => (
              <tr key={s.service_id}>
                <td>{s.service_name}</td>
                <td>{s.service_description || '-'}</td>
                <td>{s.service_price?.toLocaleString()} VNĐ</td>
                <td className="actions">
                  <button className="btn edit" onClick={() => openFormForEdit(s)}>Sửa</button>
                  <button className="btn delete" onClick={() => handleDelete(s.service_id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>◀ Trang trước</button>
          <span>Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Trang sau ▶</button>
        </div>
      )}

      {showForm && (
        <div className="form-overlay">
          <div className="service-form popup">
            <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            <h2>{editingId ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}</h2>

            <form onSubmit={handleSubmit}>
              <label>
                Tên dịch vụ <span className="required">*</span>
                <input
                  type="text"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên dịch vụ"
                />
              </label>

              <label>
                Mô tả dịch vụ
                <textarea
                  name="service_description"
                  value={formData.service_description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả dịch vụ"
                />
              </label>

              <label>
                Giá dịch vụ (VNĐ) <span className="required">*</span>
                <input
                  type="number"
                  name="service_price"
                  value={formData.service_price}
                  onChange={handleChange}
                  required
                  placeholder="Nhập giá dịch vụ"
                />
              </label>

              <div className="form-buttons">
                <button type="submit" className="btn submit">
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => setShowForm(false)}
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagementPage;
