const userModel = require('../models/userModel');

// Danh sách user có tìm kiếm + phân trang
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const total = await userModel.getTotalUsers(search);
    const users = await userModel.getAllUsers(search, limit, offset);

    res.status(200).json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lấy danh sách user' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy user' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Landlord', 'Renter'].includes(role)) return res.status(400).json({ error: 'Role không hợp lệ' });
    await userModel.updateUserRole(req.params.id, role);
    res.status(200).json({ message: 'Cập nhật role thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật role' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.status(200).json({ message: 'Xóa user thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa user' });
  }
};
