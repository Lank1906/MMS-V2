const serviceModel = require('../models/serviceModel');

// Controller: Lấy danh sách dịch vụ có phân trang
exports.getServices = (req, res) => {
  const landlord_id = req.user.user_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  serviceModel.getServices(landlord_id, (err, services) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi server khi lấy danh sách dịch vụ' });
    }
    res.json({ data: services, page, limit });
  }, page, limit);
};

// Lấy chi tiết dịch vụ
exports.getServiceById = (req, res) => {
  const id = parseInt(req.params.id);
  serviceModel.getServiceById(id, (err, service) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy dịch vụ' });
    if (!service) return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
    res.json(service);
  });
};

// Thêm dịch vụ
exports.createService = (req, res) => {
  const data = req.body;
  data.landlord_id=req.user.user_id
  if (!data.service_name || !data.service_price) {
    return res.status(400).json({ error: 'Tên và giá dịch vụ không được để trống' });
  }

  serviceModel.createService(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi thêm dịch vụ' });
    res.status(201).json({ message: 'Thêm dịch vụ thành công', serviceId: result.insertId });
  });
};

// Cập nhật dịch vụ
exports.updateService = (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  serviceModel.updateService(id, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật dịch vụ' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy dịch vụ để cập nhật' });
    res.json({ message: 'Cập nhật dịch vụ thành công' });
  });
};

// Xóa dịch vụ
exports.deleteService = (req, res) => {
  const id = parseInt(req.params.id);

  serviceModel.deleteService(id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi xóa dịch vụ' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy dịch vụ để xóa' });
    res.json({ message: 'Xóa dịch vụ thành công' });
  });
};
