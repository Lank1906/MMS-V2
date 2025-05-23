const renterModel = require('../models/renterModel');
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
  const { room_id, rent_price } = req.body;

  // Lấy danh sách các hợp đồng chưa thanh toán của user
  renterModel.getContractsByUserAndPaymentStatus(userId, 'Unpaid', (err, unpaidContracts) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi kiểm tra hợp đồng chưa thanh toán' });

    if (unpaidContracts.length >= 3) {
      return res.status(400).json({ error: 'Bạn có 3 hợp đồng chưa thanh toán. Vui lòng thanh toán trước khi thuê phòng mới.' });
    }

    // Kiểm tra xem người dùng có hợp đồng đang hoạt động hay không (bất kỳ trạng thái)
    renterModel.getActiveContractsByUser(userId, (err2, activeContracts) => {
      if (err2) return res.status(500).json({ error: 'Lỗi server khi kiểm tra hợp đồng đang hoạt động' });

      const start_date = new Date().toISOString().split('T')[0];

      // Tạo hợp đồng mới
      renterModel.createContract({ room_id, renter_id: userId, start_date, rent_price }, (err3, result) => {
        if (err3) return res.status(500).json({ error: 'Lỗi server khi tạo hợp đồng' });

        // Cập nhật trạng thái phòng thành "Rented"
        renterModel.updateRoomStatus(room_id, 'Rented', (err4) => {
          if (err4) return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái phòng' });

          res.status(201).json({ message: 'Thuê phòng thành công', contractId: result.insertId });
        });
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
      renterModel.updateRoomStatus(contract.room_id, 'Under Maintenance', (err3) => {
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

exports.redirectPayment=(req, res) => {
  const { orderId, resultCode, message, amount, transId, extraData } = req.query;
  
  let redirectClientUrl = 'http://localhost:3000/my-room';
  
   try {
    if (extraData) {
      const decoded = JSON.parse(decodeURIComponent(extraData));
      if (decoded.redirectLink) {
        redirectClientUrl = decoded.redirectLink;
      }
    }
  } catch (err) {
    console.error('Lỗi giải mã extraData:', err);
  }

  // Kiểm tra kết quả trả về từ MoMo
  if (resultCode === '0') {
    // Thanh toán thành công
    console.log(`Thanh toán thành công cho đơn hàng ${orderId}.`);

    // Cập nhật trạng thái thanh toán trong DB
    renterModel.updateContractPaymentStatus(orderId, {
      payment_status: 'Paid',
      payment_amount: amount,  // Số tiền thanh toán
      message: message,
    }).then(() => {
      res.redirect(redirectClientUrl);
    }).catch((err) => {
      console.error('Lỗi khi cập nhật trạng thái thanh toán trong DB:', err);
      res.status(500).send('Lỗi server khi cập nhật thông tin thanh toán.');
    });

  } else {
    // Thanh toán thất bại
    console.log(`Thanh toán thất bại cho đơn hàng ${orderId}. Lý do: ${message}`);
    
    // Cập nhật trạng thái thanh toán trong DB
    renterModel.updateContractPaymentStatus(orderId, {
      payment_status: 'Unpaid',
      message: message,
    }).then(() => {
      res.redirect('http://localhost:3000/my-room');
    }).catch((err) => {
      console.error('Lỗi khi cập nhật trạng thái thanh toán thất bại trong DB:', err);
      res.status(500).send('Lỗi server khi cập nhật thông tin thanh toán thất bại.');
    });
  }
};