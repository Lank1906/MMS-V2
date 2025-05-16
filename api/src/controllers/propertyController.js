const propertyModel = require('../models/propertyModel');

exports.getProperties = (req, res) => {
  const landlordId = req.user.user_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  propertyModel.getProperties(landlordId, page, limit, search, (err, data) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy danh sách cụm' });
    res.json(data);
  });
};

exports.getPropertyById = (req, res) => {
  const landlordId = req.user.user_id;
  const id = parseInt(req.params.id);

  propertyModel.getPropertyById(id, landlordId, (err, property) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy cụm' });
    if (!property) return res.status(404).json({ error: 'Không tìm thấy cụm' });
    res.json(property);
  });
};

exports.createProperty = (req, res) => {
  const landlordId = req.user.user_id;
  const data = req.body;

  if (!data.name || !data.address) {
    return res.status(400).json({ error: 'Tên và địa chỉ không được để trống' });
  }

  propertyModel.createProperty(landlordId, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi tạo cụm' });
    res.status(201).json({ message: 'Tạo cụm thành công', propertyId: result.insertId });
  });
};

exports.updateProperty = (req, res) => {
  const landlordId = req.user.user_id;
  const id = parseInt(req.params.id);
  const data = req.body;

  propertyModel.updateProperty(id, landlordId, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật cụm' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy cụm để cập nhật' });
    res.json({ message: 'Cập nhật cụm thành công' });
  });
};

exports.deleteProperty = (req, res) => {
  const landlordId = req.user.user_id;
  const id = parseInt(req.params.id);

  propertyModel.deleteProperty(id, landlordId, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi xóa cụm' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy cụm để xóa' });
    res.json({ message: 'Xóa cụm thành công' });
  });
};
