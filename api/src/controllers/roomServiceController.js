const roomServiceModel = require('../models/roomServiceModel');

exports.getRoomServices = (req, res) => {
  const landlordId = req.user.user_id;
  const roomId = parseInt(req.query.roomId);

  roomServiceModel.getRoomServices(landlordId, roomId, (err, services) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy dịch vụ phòng' });
    res.json(services);
  });
};

exports.createRoomService = (req, res) => {
  const data = req.body;

  roomServiceModel.createRoomService(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi thêm dịch vụ' });
    res.status(201).json({ message: 'Thêm dịch vụ thành công' });
  });
};

exports.deleteRoomService = (req, res) => {
  const roomId = parseInt(req.query.roomId);
  const serviceId = parseInt(req.query.serviceId);

  roomServiceModel.deleteRoomService(roomId, serviceId, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi xoá dịch vụ' });
    res.json({ message: 'Xoá dịch vụ thành công' });
  });
};
