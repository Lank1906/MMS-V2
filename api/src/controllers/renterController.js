const renterModel = require('../models/renterModel');
const billModel=require('../models/billModel');
const crypto = require('crypto');
const axios = require('axios');

// Lấy danh sách phòng trống với các bộ lọc
exports.getAvailableRooms = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
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

exports.rentRoom = (req, res) => {
  const userId = req.user.user_id;
  const { room_id, rent_price, deposit_amount,months } = req.body;

  if (!room_id || !rent_price) {
    return res.status(400).json({ error: 'room_id và rent_price là bắt buộc' });
  }

  const start_date = new Date().toISOString().split('T')[0];

  // 1. Tạo hợp đồng
  renterModel.createContract({ room_id, renter_id: userId, start_date, rent_price, deposit_amount,months }, (err, result) => {
    if (err) {
      console.error('Lỗi khi tạo hợp đồng:', err);
      return res.status(500).json({ error: 'Lỗi server khi tạo hợp đồng' });
    }

    // 2. Cập nhật trạng thái phòng
    renterModel.updateRoomStatus(room_id, 0, 'Rented', (err2) => {
      if (err2) {
        console.error('Lỗi khi cập nhật trạng thái phòng:', err2);
        return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái phòng' });
      }

      // 3. Thêm vào Room_Renters
      const join_date = start_date;
      renterModel.addRenterToRoom({ room_id, renter_id: userId, join_date }, (err3) => {
        if (err3) {
          console.error('Lỗi khi thêm người thuê vào phòng:', err3);
          return res.status(500).json({ error: 'Lỗi khi thêm người thuê vào phòng' });
        }

        return res.status(201).json({
          message: 'Thuê phòng thành công',
          contractId: result.insertId
        });
      });
    });
  });
};

// Trả phòng (kiểm tra hợp đồng thanh toán, cập nhật hợp đồng và trạng thái phòng)
exports.leaveRoom = (req, res) => {
  const userId = req.user.user_id;
  const contractId = parseInt(req.params.contractId);

  // Lấy thông tin hợp đồng + các hóa đơn liên quan
  renterModel.getContractWithBills(userId, contractId, (err, contract, bills) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy hợp đồng và hóa đơn' });

    if (!contract) return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });

    const unpaidBill = bills.find(bill => bill.payment_status !== 'Paid');
    if (unpaidBill) {
      return res.status(400).json({ error: 'Bạn phải thanh toán tất cả hóa đơn trước khi trả phòng.' });
    }

    // Cập nhật trạng thái hợp đồng
    renterModel.updateContract(contractId, { status: 'Completed' }, (err2) => {
      if (err2) return res.status(500).json({ error: 'Lỗi khi cập nhật hợp đồng' });

      // Cập nhật trạng thái phòng
      renterModel.updateRoomStatus(contract.room_id, userId, 'Under Maintenance', (err3) => {
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

exports.createPayment = async (req, res) => {
    const { amount, orderId, orderInfo, redirectLink } = req.body;

    var accessKey = 'F8BBA842ECF85';
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var partnerCode = 'MOMO';
    var redirectUrl = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/renter/payment-redirect';
    var ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
    var requestType = "payWithMethod";
    var requestId = orderId+"LANK" + new Date().getTime();
    var orderGroupId ='';
    var autoCapture =true;
    var lang = 'vi';
    var id=orderId+"LANK" +  new Date().getTime();
    
    const extraData = encodeURIComponent(JSON.stringify({ redirectLink }));

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + id + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)
    //signature
    const crypto = require('crypto');
    var signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode : partnerCode,
        partnerName : "Test",
        storeId : "MomoTestStore",
        requestId : requestId,
        amount : amount,
        orderId : id,
        orderInfo : orderInfo,
        redirectUrl : redirectUrl,
        ipnUrl : ipnUrl,
        lang : lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData : extraData,
        orderGroupId: orderGroupId,
        signature : signature
    });
    
    const options={
        method:"POST",
        url:"https://test-payment.momo.vn/v2/gateway/api/create",
        headers:{
            'Content-Type':'application/json',
            'Content-Length':Buffer.byteLength(requestBody)
        },
        data:requestBody
    }
  try {
    // Gửi request tới MoMo
    const response = await axios(options);
    console.log(response.data)
    if (response.data.payUrl) {
      // Trả về URL thanh toán MoMo (QR code hoặc redirect link)
      return res.json({ payUrl: response.data.payUrl });
    } else {
      return res.status(400).json({ error: 'Không thể lấy URL thanh toán' });
    }
  } catch (error) {
    console.error('Lỗi thanh toán MoMo:', error);
    return res.status(500).json({ error: 'Lỗi server khi tạo thanh toán' });
  }
};

exports.redirectPayment = (req, res) => {
  const { orderId, resultCode, message, amount, transId, extraData } = req.query;

  let redirectClientUrl = 'http://localhost:3000/my-room';
  let type = null;
  let room_id = null;
  let rent_price = null;

  try {
    if (extraData) {
      const decoded = JSON.parse(decodeURIComponent(extraData));
      if (decoded.redirectLink) redirectClientUrl = decoded.redirectLink;
      type = decoded.type || null;
      room_id = decoded.room_id || null;
      rent_price = decoded.rent_price || null;
    }
  } catch (err) {
    console.error('Lỗi giải mã extraData:', err);
  }

  // ✅ Trường hợp thanh toán thành công
  if (resultCode === '0') {
    console.log(`✅ Thanh toán thành công cho đơn hàng ${orderId}.`);

    // ✅ Nếu là đặt cọc phòng → gọi rentRoom để tạo hợp đồng
    if (type === 'deposit' && room_id && rent_price) {
      const userId = req.user.user_id || null;
      if (!userId) {
        console.error('Không xác định được user_id trong thanh toán đặt cọc.');
        return res.status(401).send('Không xác định được người dùng.');
      }

      // Giả lập req/res nội bộ để gọi rentRoom
      const fakeReq = {
        user: { user_id: userId },
        body: {
          room_id,
          rent_price,
          deposit_amount: amount // Nếu bạn muốn lưu
        }
      };

      const fakeRes = {
        status: (code) => ({
          json: (data) => {
            console.log('Tạo hợp đồng thành công sau đặt cọc:', data);
            return res.redirect(redirectClientUrl);
          }
        }),
        json: (data) => {
          console.log('Tạo hợp đồng thành công sau đặt cọc:', data);
          return res.redirect(redirectClientUrl);
        }
      };

      return rentRoom(fakeReq, fakeRes);
    }

    // ✅ Nếu là thanh toán hợp đồng thông thường → cập nhật trạng thái
    renterModel.updateContractPaymentStatus(orderId, {
      payment_status: 'Paid',
      payment_amount: amount,
      message
    }).then(() => {
      res.redirect(redirectClientUrl);
    }).catch((err) => {
      console.error('Lỗi cập nhật trạng thái hợp đồng:', err);
      res.status(500).send('Lỗi server khi cập nhật thanh toán.');
    });

  } else {
    // ❌ Thanh toán thất bại
    console.log(`❌ Thanh toán thất bại cho đơn hàng ${orderId}. Lý do: ${message}`);

    renterModel.updateContractPaymentStatus(orderId, {
      payment_status: 'Unpaid',
      message
    }).then(() => {
      res.redirect(redirectClientUrl);
    }).catch((err) => {
      console.error('Lỗi cập nhật trạng thái thất bại:', err);
      res.status(500).send('Lỗi server khi cập nhật thông tin thất bại.');
    });
  }
};

exports.cancelContract = (req, res) => {
  const userId = req.user.user_id;
  const contractId = parseInt(req.params.contractId);

  // Đảm bảo người dùng chỉ hủy được hợp đồng của chính họ
  renterModel.getActiveContractsByUser(userId, (err, contracts) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi kiểm tra hợp đồng.' });

    const contract = contracts.find(c => c.contract_id === contractId);
    if (!contract) return res.status(404).json({ error: 'Không tìm thấy hợp đồng của bạn hoặc hợp đồng đã bị hủy.' });

    // Tiến hành hủy hợp đồng
    renterModel.cancelContract(contractId, (err2, result) => {
      if (err2) return res.status(400).json({ error: err2.message || 'Không thể hủy hợp đồng.' });

      // Cập nhật trạng thái phòng về Available
      renterModel.updateRoomStatus(contract.room_id,userId, 'Available', (err3) => {
        if (err3) {
          console.error('Lỗi khi cập nhật trạng thái phòng:', err3);
          return res.status(500).json({ error: 'Đã hủy hợp đồng nhưng không thể cập nhật trạng thái phòng.' });
        }

        res.status(200).json({ message: 'Hủy hợp đồng phòng thành công.' });
      });
    });
  });
};

exports.checkCanRentRoom = (req, res) => {
  const userId = req.user.user_id;

  renterModel.getContractsByUserAndPaymentStatus(userId, 'Unpaid', (err, unpaidContracts) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi kiểm tra hợp đồng chưa thanh toán' });
    if (unpaidContracts.length >= 3) {
      return res.json({ canRent: false, reason: 'Bạn có 3 hợp đồng chưa thanh toán.' });
    }

    renterModel.getActiveContractsByUser(userId, (err2, activeContracts) => {
      if (err2) return res.status(500).json({ error: 'Lỗi khi kiểm tra hợp đồng đang hoạt động' });
      if (activeContracts.length >= 3) {
        return res.json({ canRent: false, reason: 'Bạn đang có 3 hợp đồng đang hoạt động.' });
      }

      return res.json({ canRent: true });
    });
  });
};

exports.mockPaymentSuccess = (req, res) => {
  const userId = req.user.user_id;
  console.log(req.body)
  const { room_id, rent_price, amount, months = 1 } = req.body;
  const start_date = new Date().toISOString().split('T')[0];

  if (!userId || !room_id || !rent_price) {
    return res.status(400).json({ error: 'Thiếu thông tin để giả lập thanh toán' });
  }

  // ✅ Bước 0: Kiểm tra số lượng phòng người dùng đang thuê
  renterModel.countActiveContractsByUser(userId, (err, count) => {
    if (err) return res.status(500).json({ error: 'Lỗi kiểm tra số hợp đồng hiện tại' });

    if (count >= 3) {
      return res.status(400).json({ error: 'Người thuê không được thuê quá 3 phòng cùng lúc.' });
    }

    // 1. Tạo hợp đồng
    renterModel.createContract(
      { room_id, renter_id: userId, start_date, rent_price, deposit_amount: amount, months },
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Lỗi tạo hợp đồng trong mock' });

        const contractId = result.insertId;

        // 2. Cập nhật trạng thái phòng
        renterModel.updateRoomStatus(room_id, 0, 'Rented', (err2) => {
          if (err2) return res.status(500).json({ error: 'Lỗi cập nhật phòng trong mock' });

          // 3. Thêm người thuê vào Room_Renters
          renterModel.addRenterToRoom({ room_id, renter_id: userId, join_date: start_date }, (err3) => {
            if (err3) return res.status(500).json({ error: 'Lỗi thêm người thuê trong mock' });

            // 4. Tạo bill đầu tiên
            const billData = {
              contract_id: contractId,
              bill_month: start_date,
              total_amount: rent_price * months,
              water_amount: 0,
              electricity_amount: 0,
              service_amount: 0,
              rent_amount: rent_price * months,
              payment_status: 'Paid',
              payment_date: null,
              new_water: 0,
              new_electric: 0,
              room_id,
              term_extended: months
            };

            billModel.createBill(billData, (err4) => {
              if (err4) return res.status(500).json({ error: 'Tạo hợp đồng thành công nhưng lỗi tạo bill.' });

              res.json({ message: '✅ Giả lập thành công, đã tạo hợp đồng và bill.', contractId });
            });
          });
        });
      }
    );
  });
};

exports.simulatePayment = (req, res) => {
  const contractId = req.params.id;

  renterModel.simulatePayment(contractId, (err, result) => {
    if (err) {
      console.error('Lỗi giả lập thanh toán:', err);
      return res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái thanh toán' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hợp đồng hợp lệ để cập nhật' });
    }

    return res.status(200).json({ message: 'Giả lập thanh toán thành công' });
  });
};

exports.getBillsByContractId = (req, res) => {
  const contractId = req.query.contractId;
  if (!contractId) return res.status(400).json({ error: 'Thiếu contractId' });

  billModel.getBillsByContract(contractId, (err, bills) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn bills' });
    res.json(bills);
  });
};
