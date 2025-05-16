const roomTypeModel = require('../models/roomTypeModel');

exports.getRoomTypes = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const search = req.query.search || '';

  roomTypeModel.getRoomTypes(page, limit, search, (err, data) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy danh sách loại phòng' });
    res.json(data);
  });
};

exports.getRoomTypeById = (req, res) => {
  const id = parseInt(req.params.id);

  roomTypeModel.getRoomTypeById(id, (err, roomType) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy loại phòng' });
    if (!roomType) return res.status(404).json({ error: 'Không tìm thấy loại phòng' });
    res.json(roomType);
  });
};

exports.createRoomType = (req, res) => {
  const data = req.body;
  if (!data.name || !data.rent_price || !data.max_occupants) {
    return res.status(400).json({ error: 'Tên, giá thuê và số người tối đa là bắt buộc' });
  }

  roomTypeModel.createRoomType(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi tạo loại phòng' });
    res.status(201).json({ message: 'Tạo loại phòng thành công', room_type_id: result.insertId });
  });
};

exports.updateRoomType = (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  roomTypeModel.updateRoomType(id, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật loại phòng' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy loại phòng để cập nhật' });
    res.json({ message: 'Cập nhật loại phòng thành công' });
  });
};

exports.deleteRoomType = (req, res) => {
  const id = parseInt(req.params.id);

  roomTypeModel.deleteRoomType(id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi xóa loại phòng' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy loại phòng để xóa' });
    res.json({ message: 'Xóa loại phòng thành công' });
  });
};
