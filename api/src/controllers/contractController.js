const contractModel = require('../models/contractModel');

exports.getContracts = (req, res) => {
  const landlordId = req.user.user_id;
  const roomId = parseInt(req.query.roomId);

  contractModel.getContracts(landlordId, roomId, (err, contracts) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy hợp đồng' });
    res.json(contracts);
  });
};

exports.getContractById = (req, res) => {
  const landlordId = req.user.user_id;
  const id = parseInt(req.params.id);

  contractModel.getContractById(id, landlordId, (err, contract) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy hợp đồng' });
    if (!contract) return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
    res.json(contract);
  });
};

exports.createContract = (req, res) => {
  const data = req.body;

  contractModel.createContract(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi tạo hợp đồng' });
    res.status(201).json({ message: 'Tạo hợp đồng thành công', contractId: result.insertId });
  });
};

exports.updateContract = (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  contractModel.updateContract(id, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật hợp đồng' });
    res.json({ message: 'Cập nhật hợp đồng thành công' });
  });
};

exports.deleteContract = (req, res) => {
  const id = parseInt(req.params.id);

  contractModel.deleteContract(id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi xoá hợp đồng' });
    res.json({ message: 'Xoá hợp đồng thành công' });
  });
};
