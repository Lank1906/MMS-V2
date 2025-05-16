import React, { useState, useEffect } from 'react';
import AsyncSelectSearch from './AsyncSelectSearch';
import {getProperties, getPropertyById } from '../services/propertyService';
import {getRoomTypes, getRoomTypeById } from '../services/roomTypeService';

const RoomFormModal = ({ visible, onClose, onSubmit, initialData, filterPropertyId }) => {
  const [form, setForm] = useState({
    property_id: filterPropertyId || '',
    room_type_id: '',
    room_number: '',
    max_occupants: '',
    status: 'Available',
  });
  const [propertyName, setPropertyName] = useState('');
  const [roomTypeName, setRoomTypeName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        property_id: initialData.property_id,
        room_type_id: initialData.room_type_id,
        room_number: initialData.room_number,
        max_occupants: initialData.max_occupants || '',
        status: initialData.status || 'Available',
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
      });
      setPropertyName('');
      setRoomTypeName('');
    }
  }, [initialData, filterPropertyId]);

  if (!visible) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'max_occupants') {
      if (value === '') {
        setForm(prev => ({ ...prev, [name]: '' }));
      } else if (/^\d+$/.test(value)) {
        setForm(prev => ({ ...prev, [name]: parseInt(value, 10) }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
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

  return (
    <div className="modal-overlay" onClick={() => !submitting && onClose()}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={() => !submitting && onClose()}
          disabled={submitting}
          aria-label="Đóng form"
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} noValidate>
          <h2>{initialData ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h2>

          <label>
            Cụm nhà trọ:
            <AsyncSelectSearch
              apiCall={getProperties}  // Hoặc searchProperties nếu bạn có
              value={form.property_id}
              onChange={val => {
                handleSelectChange('property_id', val);
                setPropertyName(''); // reset khi đổi
              }}
              disabled={!!filterPropertyId || submitting}
              placeholder="Nhập để tìm cụm nhà trọ"
              defaultInputValue={propertyName}
            />
          </label>

          <label>
            Loại phòng:
            <AsyncSelectSearch
              apiCall={getRoomTypes} // Hoặc searchRoomTypes nếu có
              value={form.room_type_id}
              onChange={val => {
                handleSelectChange('room_type_id', val);
                setRoomTypeName('');
              }}
              disabled={submitting}
              placeholder="Nhập để tìm loại phòng"
              defaultInputValue={roomTypeName}
            />
          </label>

          <label>
            Số phòng:
            <input
              type="text"
              name="room_number"
              value={form.room_number}
              onChange={handleChange}
              disabled={submitting}
              placeholder="VD: A101"
              maxLength={20}
              required
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
              placeholder="Nhập số người tối đa"
              required
            />
          </label>

          <label>
            Trạng thái:
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </label>

          <button type="submit" disabled={submitting} style={{ marginTop: 15 }}>
            {submitting ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomFormModal;
