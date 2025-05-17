const roomRenterModel = require('../models/roomRenterModel');

// Lấy danh sách renter theo room_id
exports.getRoomRenters = (req, res) => {
    const roomId = parseInt(req.params.roomId);
    roomRenterModel.getRoomRentersByRoomId(roomId, (err, data) => {
        if (err) return res.status(500).json({ error: 'Lỗi server khi lấy danh sách người thuê' });
        res.json(data);
    });
};

// Thêm renter vào room
exports.createRoomRenter = (req, res) => {
    const roomId = parseInt(req.params.roomId);
    const { renter_id, join_date } = req.body;
    if (!renter_id || !join_date) {
        return res.status(400).json({ error: 'Vui lòng nhập renter_id và join_date' });
    }
    roomRenterModel.createRoomRenter(roomId, renter_id, join_date, (err, result) => {
        if (err) return res.status(500).json({ error: 'Lỗi server khi thêm người thuê' });
        res.status(201).json({ message: 'Thêm người thuê thành công', roomRenterId: result.insertId });
    });
};

// Cập nhật renter sang Left + ngày trả phòng
exports.updateRoomRenter = (req, res) => {
    const roomId = parseInt(req.params.roomId);
    const roomRenterId = parseInt(req.params.roomRenterId);
    const { leave_date } = req.body;
    if (!leave_date) {
        return res.status(400).json({ error: 'Vui lòng nhập leave_date' });
    }
    roomRenterModel.updateRoomRenter(roomRenterId, roomId, leave_date, (err, result) => {
        if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật người thuê' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy người thuê để cập nhật' });
        res.json({ message: 'Cập nhật người thuê thành công' });
    });
};

// Xoá cứng renter khỏi phòng
exports.deleteRoomRenter = (req, res) => {
    const roomId = parseInt(req.params.roomId);
    const roomRenterId = parseInt(req.params.roomRenterId);
    roomRenterModel.deleteRoomRenter(roomRenterId, roomId, (err, result) => {
        if (err) return res.status(500).json({ error: 'Lỗi server khi xoá người thuê' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy người thuê để xoá' });
        res.json({ message: 'Xoá người thuê thành công' });
    });
};
