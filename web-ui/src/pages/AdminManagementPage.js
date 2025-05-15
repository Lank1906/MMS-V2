import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole, deleteUser } from '../services/userService';
import '../assets/AdminUserManagementPage.css';

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, 10, search, token);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      alert('Lỗi tải danh sách user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role, token);
      alert('Cập nhật role thành công');
      fetchUsers();
    } catch (error) {
      alert('Lỗi cập nhật role');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa user này?')) {
      try {
        await deleteUser(id, token);
        alert('Xóa user thành công');
        fetchUsers();
      } catch (error) {
        alert('Lỗi xóa user');
      }
    }
  };

  return (
    <div className="admin-user-page">
      <div className="header-bar">
        <h2>👥 Quản lý người dùng</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <select value={user.role} onChange={(e) => handleRoleChange(user.user_id, e.target.value)}>
                      <option value="Admin">Admin</option>
                      <option value="Landlord">Landlord</option>
                      <option value="Renter">Renter</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-delete" onClick={() => handleDelete(user.user_id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          ◀ Trang trước
        </button>
        <span>Trang {page}</span>
        <button disabled={page * 10 >= total} onClick={() => setPage(page + 1)}>
          Trang sau ▶
        </button>
      </div>
    </div>
  );
};

export default AdminUserManagementPage;
