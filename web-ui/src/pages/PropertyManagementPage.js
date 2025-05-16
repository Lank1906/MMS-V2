import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../services/propertyService';
import '../assets/PropertyManagementPage.css'

const PropertyManagementPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({ name: '', address: '', contact_phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const limit = 10;
  const navigate = useNavigate();

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await getProperties(page, limit, search);
      setProperties(res.properties);
      setTotal(res.total);
    } catch (error) {
      alert('Lỗi khi tải danh sách cụm nhà trọ');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, [page, search]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openFormForAdd = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', contact_phone: '' });
    setShowForm(true);
  };

  const openFormForEdit = (property) => {
    setEditingId(property.property_id);
    setFormData({
      name: property.name,
      address: property.address,
      contact_phone: property.contact_phone || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Tên và địa chỉ không được để trống');
      return;
    }
    try {
      if (editingId) {
        await updateProperty(editingId, formData);
        alert('Cập nhật cụm thành công');
      } else {
        await createProperty(formData);
        alert('Thêm cụm thành công');
      }
      setFormData({ name: '', address: '', contact_phone: '' });
      setEditingId(null);
      setShowForm(false);
      fetchProperties();
    } catch (error) {
      alert('Lỗi khi lưu cụm nhà trọ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cụm nhà trọ này?')) {
      try {
        await deleteProperty(id);
        alert('Xóa thành công');
        fetchProperties();
      } catch (error) {
        alert('Lỗi khi xóa cụm');
      }
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="property-page">
      <h1>Quản lý cụm nhà trọ</h1>

      <div className="top-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên cụm..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />
        <button className="btn add-btn" onClick={openFormForAdd}>＋ Thêm cụm mới</button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <table className="property-table">
          <thead>
            <tr>
              <th>Tên cụm nhà trọ</th>
              <th>Địa chỉ</th>
              <th>Điện thoại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
              </tr>
            )}
            {properties.map(p => (
              <tr key={p.property_id}>
                <td onClick={() => navigate(`/room-management/${p.property_id}`)} style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>{p.name}</td>
                <td>{p.address}</td>
                <td>{p.contact_phone || '-'}</td>
                <td className="actions">
                  <button className="btn edit" onClick={() => openFormForEdit(p)}>Sửa</button>
                  <button className="btn delete" onClick={() => handleDelete(p.property_id)}>Xóa</button>
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

      {/* Form popup / panel */}
      {showForm && (
        <div className="form-overlay">
          <div className="property-form popup">
            <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            <h2>{editingId ? 'Cập nhật cụm nhà trọ' : 'Thêm cụm nhà trọ mới'}</h2>

            <form onSubmit={handleSubmit}>
              <label>
                Tên cụm <span className="required">*</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên cụm nhà trọ"
                />
              </label>

              <label>
                Địa chỉ <span className="required">*</span>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Nhập địa chỉ cụm"
                />
              </label>

              <label>
                Điện thoại liên hệ
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
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

export default PropertyManagementPage;
