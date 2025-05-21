import React, { useState, useEffect } from 'react';
import AsyncSelectSearch from './AsyncSelectSearch';
import { getProperties, getPropertyById } from '../services/propertyService';
import { getRoomTypes, getRoomTypeById } from '../services/roomTypeService';
import { uploadImage } from '../services/uploadService';

const RoomFormModal = ({ visible, onClose, onSubmit, initialData, filterPropertyId }) => {
  const [form, setForm] = useState({
    property_id: filterPropertyId || '',
    room_type_id: '',
    room_number: '',
    max_occupants: '',
    status: 'Available',
    image_url: '',
    current_water_usage: '',
    current_electricity_usage: '',
  });
  const [propertyName, setPropertyName] = useState('');
  const [roomTypeName, setRoomTypeName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        property_id: initialData.property_id,
        room_type_id: initialData.room_type_id,
        room_number: initialData.room_number,
        max_occupants: initialData.max_occupants || '',
        status: initialData.status || 'Available',
        image_url: initialData.image_url || '',
        current_water_usage: initialData.current_water_usage || '',
        current_electricity_usage: initialData.current_electricity_usage || '',
      });
      getPropertyById(initialData.property_id)
        .then((data) => setPropertyName(data.name || ''))
        .catch(() => setPropertyName(''));
      getRoomTypeById(initialData.room_type_id)
        .then((data) => setRoomTypeName(data.name || ''))
        .catch(() => setRoomTypeName(''));
    } else {
      setForm({
        property_id: filterPropertyId || '',
        room_type_id: '',
        room_number: '',
        max_occupants: '',
        status: 'Available',
        image_url: '',
        current_water_usage: '',
        current_electricity_usage: '',
      });
      setPropertyName('');
      setRoomTypeName('');
    }
    setUploadError(null);
  }, [initialData, filterPropertyId]);

  if (!visible) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'max_occupants') {
      if (value === '') {
        setForm((prev) => ({ ...prev, [name]: '' }));
      } else if (/^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
      }
    } else if (name === 'current_water_usage' || name === 'current_electricity_usage') {
      // cho nhập số thực, hoặc để trống
      if (value === '') {
        setForm((prev) => ({ ...prev, [name]: '' }));
      } else if (/^\d*\.?\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (field === 'property_id') {
      if (val) {
        getPropertyById(val)
          .then((data) => setPropertyName(data.name || ''))
          .catch(() => setPropertyName(''));
      } else {
        setPropertyName('');
      }
    }
    if (field === 'room_type_id') {
      if (val) {
        getRoomTypeById(val)
          .then((data) => setRoomTypeName(data.name || ''))
          .catch(() => setRoomTypeName(''));
      } else {
        setRoomTypeName('');
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadImage(file);
      setForm((prev) => ({ ...prev, image_url: res.imageUrl }));
    } catch (error) {
      setUploadError('Upload ảnh thất bại');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.property_id) {
      alert('Vui lòng chọn cụm nhà trọ');
      return;
    }
    if (!form.room_type_id) {
      alert('Vui lòng chọn loại phòng');
      return;
    }
    if (!form.room_number.trim()) {
      alert('Vui lòng nhập số phòng');
      return;
    }
    if (form.max_occupants === '' || form.max_occupants <= 0) {
      alert('Vui lòng nhập số người tối đa hợp lệ');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (error) {
      alert(error?.message || 'Lỗi khi lưu phòng');
    }
    setSubmitting(false);
  };

  const handleOverlayClick = () => {
    if (!submitting && !uploading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={() => !submitting && !uploading && onClose()}
          disabled={submitting || uploading}
          aria-label="Đóng form"
          type="button"
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} noValidate>
          <h2 id="modal-title">{initialData ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h2>

          <label htmlFor="property_id">
            Cụm nhà trọ:
            <AsyncSelectSearch
              apiCall={getProperties}
              value={form.property_id}
              onChange={(val) => handleSelectChange('property_id', val)}
              disabled={!!filterPropertyId || submitting || uploading}
              placeholder="Nhập để tìm cụm nhà trọ"
              defaultInputValue={propertyName}
              inputId="property_id"
            />
          </label>

          <label htmlFor="room_type_id">
            Loại phòng:
            <AsyncSelectSearch
              apiCall={getRoomTypes}
              value={form.room_type_id}
              onChange={(val) => handleSelectChange('room_type_id', val)}
              disabled={submitting || uploading}
              placeholder="Nhập để tìm loại phòng"
              defaultInputValue={roomTypeName}
              inputId="room_type_id"
            />
          </label>

          <label htmlFor="room_number">
            Số phòng:
            <input
              type="text"
              id="room_number"
              name="room_number"
              value={form.room_number}
              onChange={handleChange}
              disabled={submitting || uploading}
              placeholder="VD: A101"
              maxLength={20}
              required
            />
          </label>

          <label htmlFor="max_occupants">
            Số người tối đa:
            <input
              type="number"
              id="max_occupants"
              name="max_occupants"
              value={form.max_occupants}
              onChange={handleChange}
              disabled={submitting || uploading}
              min={1}
              placeholder="Nhập số người tối đa"
              required
            />
          </label>

          <label htmlFor="current_water_usage">
            Lượng nước hiện tại (m³):
            <input
              type="text"
              id="current_water_usage"
              name="current_water_usage"
              value={form.current_water_usage}
              onChange={handleChange}
              disabled={submitting || uploading}
              placeholder="Nhập lượng nước"
            />
          </label>

          <label htmlFor="current_electricity_usage">
            Lượng điện hiện tại (kWh):
            <input
              type="text"
              id="current_electricity_usage"
              name="current_electricity_usage"
              value={form.current_electricity_usage}
              onChange={handleChange}
              disabled={submitting || uploading}
              placeholder="Nhập lượng điện"
            />
          </label>

          <label htmlFor="status">
            Trạng thái:
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={submitting || uploading}
            >
              <option value="Available">Còn trống</option>
              <option value="Rented">Đã thuê</option>
              <option value="Under Maintenance">Đang bảo trì</option>
            </select>
          </label>

          <label htmlFor="image_upload">
            Ảnh phòng:
            <input
              id="image_upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={submitting || uploading}
            />
          </label>

          {uploading && <p>Đang tải ảnh lên...</p>}
          {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}

          {form.image_url && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={"https://ho-ng-b-i-1.paiza-user-free.cloud:5000" + form.image_url}
                alt="Ảnh phòng"
                style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </div>
          )}

          <button type="submit" disabled={submitting || uploading} style={{ marginTop: 15 }}>
            {submitting ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomFormModal;
