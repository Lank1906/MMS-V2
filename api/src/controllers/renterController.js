const renterModel = require('../models/renterModel');

// Lấy danh sách phòng trống với các bộ lọc
exports.getAvailableRooms = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const address = req.query.address || '';
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;

  renterModel.getAvailableRooms(address, minPrice, maxPrice, page, limit, (err, data) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy danh sách phòng trống' });
    res.json(data);
  });
};

// Lấy chi tiết phòng theo ID
exports.getRoomDetail = (req, res) => {
  const roomId = parseInt(req.params.roomId);

  renterModel.getRoomById(roomId, (err, room) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy chi tiết phòng' });
    if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng' });
    res.json(room);
  });
};

// Lấy các hợp đồng "Active" chưa thanh toán của người dùng
exports.getActiveContracts = (req, res) => {
  const userId = req.user.user_id;

  renterModel.getActiveContractsByUser(userId, (err, contracts) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy hợp đồng' });
    res.json(contracts);
  });
};

// Thuê phòng (tạo hợp đồng)
exports.rentRoom = (req, res) => {
  const userId = req.user.user_id;
  const { room_id, rent_price } = req.body;

  // Kiểm tra xem người dùng có hợp đồng đang hoạt động hay không
  renterModel.getActiveContractsByUser(userId, (err, contracts) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi kiểm tra hợp đồng' });

    if (contracts.length > 0) {
      return res.status(400).json({ error: 'Bạn đang thuê phòng khác, vui lòng trả phòng trước khi thuê phòng mới.' });
    }

    const start_date = new Date().toISOString().split('T')[0];

    // Tạo hợp đồng mới
    renterModel.createContract({ room_id, renter_id: userId, start_date, rent_price }, (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Lỗi server khi tạo hợp đồng' });

      // Cập nhật trạng thái phòng thành "Rented"
      renterModel.updateRoomStatus(room_id, 'Rented', (err3) => {
        if (err3) return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái phòng' });

        res.status(201).json({ message: 'Thuê phòng thành công', contractId: result.insertId });
      });
    });
  });
};

// Trả phòng (kiểm tra hợp đồng thanh toán, cập nhật hợp đồng và trạng thái phòng)
exports.leaveRoom = (req, res) => {
  const userId = req.user.user_id;
  const contractId = parseInt(req.params.contractId);

  renterModel.getActiveContractsByUser(userId, (err, contracts) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi kiểm tra hợp đồng' });

    const contract = contracts.find(c => c.contract_id === contractId);
    if (!contract) return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });

    if (contract.payment_status !== 'Paid') {
      return res.status(400).json({ error: 'Bạn phải hoàn thành thanh toán hợp đồng trước khi trả phòng.' });
    }

    // Cập nhật trạng thái hợp đồng thành "Completed"
    renterModel.updateContract(contractId, { status: 'Completed' }, (err2) => {
      if (err2) return res.status(500).json({ error: 'Lỗi server khi cập nhật hợp đồng' });

      // Cập nhật trạng thái phòng về "Available"
      renterModel.updateRoomStatus(contract.room_id, 'Available', (err3) => {
        if (err3) return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái phòng' });
        
        res.json({ message: 'Trả phòng thành công' });
      });
    });
  });
};

// Lấy thông tin người dùng
exports.getProfile = (req, res) => {
  const userId = req.user.user_id;

  renterModel.getUserById(userId, (err, user) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy thông tin người dùng' });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json(user);
  });
};

// Cập nhật thông tin người dùng
exports.updateProfile = (req, res) => {
  const userId = req.user.user_id;
  const updateData = req.body;

  renterModel.updateUser(userId, updateData, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật thông tin người dùng' });
    res.json({ message: 'Cập nhật thông tin thành công' });
  });
};
