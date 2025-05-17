import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FilterBar from '../components/FilterBar';
import RoomTable from '../components/RoomTable';
import RoomFormModal from '../components/RoomFormModal';
import '../assets/RoomManagementPage.css';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/rooms';
const PROPERTY_API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/properties';

const RoomManagementPage = () => {
  const { propertyId } = useParams();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);

  const [propertyDetail, setPropertyDetail] = useState(null);

  const [page, setPage] = useState(1);

  const limit = 10;

  // Lấy danh sách phòng
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(API_URL, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        params: {
          page,
          limit,
          search,
          status: filterStatus || undefined,
          priceMin: filterPriceMin || undefined,
          priceMax: filterPriceMax || undefined,
          propertyId: propertyId || undefined,
        },
      });
      setRooms(res.data.rooms);
      console.log(res.data.rooms)
      setTotal(res.data.total);
    } catch {
      alert('Lỗi tải dữ liệu phòng');
    }
    setLoading(false);
  };

  // Lấy thông tin cụm
  const fetchPropertyDetail = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${PROPERTY_API_URL}/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      setPropertyDetail(res.data);
    } catch {
      alert('Lỗi tải thông tin cụm nhà trọ');
    }
  };

  useEffect(() => {
    fetchRooms();
    if (propertyId) {
      fetchPropertyDetail(propertyId);
    } else {
      setPropertyDetail(null);
    }
  }, [propertyId, search, filterStatus, filterPriceMin, filterPriceMax, page]);

  const openAddForm = () => {
    setEditRoom(null);
    setShowForm(true);
  };

  const openEditForm = (room) => {
    setEditRoom(room);
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleSubmit = async (form) => {
    try {
      const token = localStorage.getItem('authToken');
      if (editRoom) {
        await axios.put(`${API_URL}/${editRoom.room_id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Cập nhật phòng thành công');
      } else {
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Thêm phòng thành công');
      }
      setShowForm(false);
      fetchRooms();
    } catch {
      alert('Lỗi lưu phòng');
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa phòng này?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Xóa phòng thành công');
      fetchRooms();
    } catch {
      alert('Lỗi xóa phòng');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20 }}>
      {propertyId && propertyDetail && (
        <div className='property-info-box'>
          <h2>Thông tin cụm</h2>
          <p><strong>Tên cụm:</strong> {propertyDetail.name}</p>
          <p><strong>Địa chỉ:</strong> {propertyDetail.address}</p>
          <p><strong>Điện thoại:</strong> {propertyDetail.contact_phone}</p>
        </div>
      )}

      <div style={{ flex: 2 }}>
        <h1>Quản lý phòng {propertyDetail ? `(Cụm: ${propertyDetail.name})` : '(Tất cả cụm)'}</h1>

        <FilterBar
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPriceMin={filterPriceMin}
          setFilterPriceMin={setFilterPriceMin}
          filterPriceMax={filterPriceMax}
          setFilterPriceMax={setFilterPriceMax}
          search={search}
          setSearch={setSearch}
          onAdd={openAddForm}
        />

        {loading ? <p>Đang tải...</p> : (
          <RoomTable rooms={rooms} onEdit={openEditForm} onDelete={handleDelete} />
        )}

        <div style={{ marginTop: 15, textAlign: 'center' }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Trang trước</button>
          <span style={{ margin: '0 10px' }}>Trang {page}</span>
          <button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>Trang sau</button>
        </div>

        <RoomFormModal
          visible={showForm}
          onClose={closeForm}
          onSubmit={handleSubmit}
          initialData={editRoom}
          filterPropertyId={propertyId}
        />
      </div>
    </div>
  );
};

export default RoomManagementPage;
