const billModel = require('../models/billModel');

exports.getBillsByContract = (req, res) => {
  const contractId = parseInt(req.params.contractId);

  billModel.getBillsByContract(contractId, (err, bills) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy danh sách hóa đơn' });
    res.json(bills);
  });
};

exports.getBillById = (req, res) => {
  const id = parseInt(req.params.id);

  billModel.getBillById(id, (err, bill) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy hóa đơn' });
    if (!bill) return res.status(404).json({ error: 'Không tìm thấy hóa đơn' });
    res.json(bill);
  });
};

exports.createBill = (req, res) => {
  const data = req.body;

  billModel.createBill(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi tạo hóa đơn' });
    res.status(201).json({ message: 'Tạo hóa đơn thành công', billId: result.insertId });
  });
};

exports.deleteBill = (req, res) => {
  const id = parseInt(req.params.id);

  billModel.deleteBill(id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi xoá hóa đơn' });
    res.json({ message: 'Xoá hóa đơn thành công' });
  });
};
