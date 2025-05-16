const roomModel = require('../models/roomModel');

exports.getRooms = (req, res) => {
  const landlordId = req.user.user_id;
  const {
    page = 1,
    limit = 10,
    search = '',
    propertyId,
    status,
    priceMin,
    priceMax,
  } = req.query;

  roomModel.getRooms(landlordId, {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    propertyId,
    status,
    priceMin: priceMin ? parseFloat(priceMin) : undefined,
    priceMax: priceMax ? parseFloat(priceMax) : undefined,
  }, (err, data) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy danh sách phòng' });
    res.json(data);
  });
};

exports.getRoomById = (req, res) => {
  const landlordId = req.user.user_id;
  const roomId = parseInt(req.params.id);

  roomModel.getRoomById(roomId, landlordId, (err, room) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy chi tiết phòng' });
    if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng' });
    res.json(room);
  });
};

exports.createRoom = (req, res) => {
  const landlordId = req.user.user_id;
  const data = req.body;

  if (!data.property_id || !data.room_type_id || !data.room_number || !data.max_occupants) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin phòng' });
  }

  // TODO: kiểm tra property_id có thuộc landlord không (nên viết hàm riêng kiểm tra trong model Property)

  roomModel.createRoom(landlordId, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi tạo phòng' });
    res.status(201).json({ message: 'Thêm phòng thành công', roomId: result.insertId });
  });
};

exports.updateRoom = (req, res) => {
  const landlordId = req.user.user_id;
  const roomId = parseInt(req.params.id);
  const data = req.body;

  roomModel.updateRoom(roomId, landlordId, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật phòng' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy phòng để cập nhật' });
    res.json({ message: 'Cập nhật phòng thành công' });
  });
};

exports.deleteRoom = (req, res) => {
  const landlordId = req.user.user_id;
  const roomId = parseInt(req.params.id);

  roomModel.deleteRoom(roomId, landlordId, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi xóa phòng' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy phòng để xóa' });
    res.json({ message: 'Xóa phòng thành công' });
  });
};
