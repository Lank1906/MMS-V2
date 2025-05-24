-- Bảng Users (Tất cả người dùng: Admin, Landlord, Renter)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,  -- Tên đăng nhập
    password_hash VARCHAR(255) NOT NULL,   -- Mật khẩu đã mã hóa
    email VARCHAR(255) NOT NULL UNIQUE,    -- Email người dùng
    phone VARCHAR(15),                     -- Số điện thoại
    role ENUM('Admin', 'Landlord', 'Renter') NOT NULL, -- Vai trò của người dùng
    address TEXT,                          -- Địa chỉ (có thể có cho landlord và renter)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo tài khoản
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE -- Trạng thái hoạt động của người dùng (TRUE = hoạt động, FALSE = không hoạt động)
);

-- Bảng Properties (Cụm nhà trọ)
CREATE TABLE Properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT, 
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(15),
    FOREIGN KEY (landlord_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE -- Trạng thái hoạt động của cụm nhà trọ (TRUE = hoạt động, FALSE = không hoạt động)
);

-- Bảng RoomTypes (Loại phòng)
CREATE TABLE RoomTypes (
    room_type_id INT AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT NOT NULL,                       -- Chủ trọ sở hữu loại phòng
    name VARCHAR(100) NOT NULL,                     -- Tên loại phòng (Phòng đơn, đôi...)
    description TEXT,                               -- Mô tả loại phòng
    max_occupants INT,                              -- Số người tối đa
    rent_price INT NOT NULL,             -- Giá thuê
    electricity_price DECIMAL(10, 2),               -- Giá điện/kWh
    water_price DECIMAL(10, 2),                     -- Giá nước/m3
    charge_type ENUM('per_person', 'per_unit') DEFAULT 'per_person', -- Cách tính phí
    is_active BOOLEAN DEFAULT TRUE,                 -- Trạng thái hoạt động
    FOREIGN KEY (landlord_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Bảng Rooms (Phòng)
CREATE TABLE Rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT,
    room_type_id INT,                    -- Liên kết với loại phòng
    room_number VARCHAR(20),             -- Số phòng
    max_occupants INT,                   -- Số người tối đa trong phòng
    current_occupants INT,               -- Số người hiện tại trong phòng (có thể sử dụng để tính tiền nước/điện theo người)
    current_water_usage DECIMAL(10, 2),  -- Lượng nước sử dụng hiện tại (m3)
    current_electricity_usage DECIMAL(10, 2), -- Lượng điện sử dụng hiện tại (kWh)
    status ENUM('Available', 'Rented', 'Under Maintenance') DEFAULT 'Available',
    FOREIGN KEY (property_id) REFERENCES Properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (room_type_id) REFERENCES RoomTypes(room_type_id),
    is_active BOOLEAN DEFAULT TRUE -- Trạng thái hoạt động của phòng (TRUE = hoạt động, FALSE = không hoạt động)
);

-- Bảng Services (Dịch vụ phòng)
CREATE TABLE Services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT NOT NULL,                       -- Chủ trọ sở hữu dịch vụ
    service_name VARCHAR(255) NOT NULL,             -- Tên dịch vụ
    service_description TEXT,                       -- Mô tả dịch vụ
    service_price DECIMAL(10, 2),                   -- Giá dịch vụ
    is_active BOOLEAN DEFAULT TRUE,                 -- Trạng thái hoạt động
    FOREIGN KEY (landlord_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


-- Bảng Contracts (Hợp đồng thuê)
CREATE TABLE Contracts (
    contract_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    renter_id INT,
    start_date DATE NOT NULL,
    end_date DATE,
    rent_price DECIMAL(10, 2) NOT NULL,
    total_water_price DECIMAL(10, 2) NOT NULL,    -- Tổng tiền nước (tính từ room_type)
    total_electricity_price DECIMAL(10, 2) NOT NULL, -- Tổng tiền điện (tính từ room_type)
    total_service_price DECIMAL(10, 2) DEFAULT 0, -- Tổng tiền dịch vụ
    status ENUM('Active', 'Completed', 'Terminated') DEFAULT 'Active',
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE, -- Trạng thái hoạt động của hợp đồng (TRUE = hoạt động, FALSE = không hoạt động)
    payment_status ENUM('Unpaid', 'Paid','Failed') DEFAULT 'Unpaid',
    payment_date DATE,
    payment_method ENUM('Cash', 'Bank Transfer', 'Credit Card')
);

-- Bảng Room_Services (Liên kết phòng với dịch vụ sử dụng)
CREATE TABLE Room_Services (
    room_id INT,
    service_id INT,
    PRIMARY KEY (room_id, service_id),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE -- Trạng thái hoạt động của dịch vụ phòng (TRUE = hoạt động, FALSE = không hoạt động)
);

CREATE TABLE Room_Renters (
    room_renter_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    renter_id INT NOT NULL,
    join_date DATE NOT NULL,
    leave_date DATE,
    status ENUM('Active', 'Left') DEFAULT 'Active',
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


-- Thêm dữ liệu vào bảng Users (Tất cả người dùng: Admin, Landlord, Renter)
INSERT INTO Users (username, password_hash, email, phone, role, address, is_active)
VALUES 
('admin', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'admin@gmail.com', '0912345678', 'Admin', 'Số 10, Đường Nguyễn Thị Minh Khai, TP.HCM', TRUE),
('ngoc', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'ngoc@gmail.com', '0912345679', 'Landlord', 'Số 123, Đường Lê Quang Đạo, TP.HCM', TRUE),
('thao', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'thao@gmail.com', '0912345680', 'Landlord', 'Số 456, Đường Nguyễn Huệ, TP.HCM', TRUE),
('minh', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'minh@gmail.com', '0912345690', 'Landlord', 'Số 789, Đường Lê Lợi, TP.HCM', TRUE),
('tuan', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'tuan@gmail.com', '0932123456', 'Renter', 'Số 15, Đường Nguyễn Thiện Thuật, TP.HCM', TRUE),
('linh', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'linh@gmail.com', '0932123457', 'Renter', 'Số 20, Đường Nguyễn Văn Cừ, TP.HCM', TRUE),
('hoang', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'hoang@gmail.com', '0932123458', 'Renter', 'Số 100, Đường Quang Trung, TP.HCM', TRUE),
('hong', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'hong@gmail.com', '0912345671', 'Renter', 'Số 88, Đường Hoàng Văn Thụ, TP.HCM', TRUE),
('khai', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'khai@gmail.com', '0912345672', 'Renter', 'Số 99, Đường Nguyễn Trãi, TP.HCM', TRUE),
('lan', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'lan@gmail.com', '0932123459', 'Renter', 'Số 101, Đường Lê Văn Sỹ, TP.HCM', TRUE);

INSERT INTO Properties (landlord_id, name, address, contact_phone, is_active)
VALUES 
(2, 'Nhà Trọ Bình Minh', 'Số 123, Đường Lê Quang Đạo, TP.HCM', '0912345679', TRUE),
(2, 'Nhà Trọ Hòa Bình', 'Số 789, Đường Lê Quang Đạo, TP.HCM', '0912345679', TRUE),
(3, 'Nhà Trọ Hòa Thành', 'Số 456, Đường Nguyễn Huệ, TP.HCM', '0912345680', TRUE),
(4, 'Nhà Trọ Minh Thành', 'Số 789, Đường Lê Lợi, TP.HCM', '0912345690', TRUE),
(2, 'Nhà Trọ Kim Sơn', 'Số 88, Đường Hoàng Văn Thụ, TP.HCM', '0912345671', TRUE),
(3, 'Nhà Trọ Hoàng Hưng', 'Số 99, Đường Nguyễn Trãi, TP.HCM', '0912345672', TRUE),
(4, 'Nhà Trọ Bình Minh 2', 'Số 500, Đường Quang Trung, TP.HCM', '0912345683', TRUE),
(2, 'Nhà Trọ Thành Công', 'Số 200, Đường Lê Quang Đạo, TP.HCM', '0912345691', TRUE),
(3, 'Nhà Trọ Hoa Mai', 'Số 150, Đường Nguyễn Thiện Thuật, TP.HCM', '0912345692', TRUE),
(4, 'Nhà Trọ Quang Nam', 'Số 300, Đường Nguyễn Huệ, TP.HCM', '0912345682', TRUE);

INSERT INTO RoomTypes (name, description, max_occupants, rent_price, electricity_price, water_price, charge_type, is_active,landlord_id)
VALUES 
('Phòng đơn', 'Phòng cho 1 người, có giường và bàn làm việc.', 1, 2000000, 3500, 50000, 'per_person', TRUE,2),
('Phòng đôi', 'Phòng cho 2 người, có giường đôi và tủ đồ.', 2, 3500000, 3500, 50000, 'per_person', TRUE,2),
('Phòng chung cư', 'Phòng lớn cho 4 người, có bếp và phòng khách riêng.', 4, 6000000, 3500, 50000, 'per_person', TRUE,2),
('Phòng VIP', 'Phòng có đầy đủ tiện nghi, phù hợp cho 1-2 người.', 2, 4500000, 3500, 50000, 'per_person', TRUE,3),
('Phòng studio', 'Phòng nhỏ tiện nghi, có bếp riêng.', 1, 3000000, 3500, 50000, 'per_unit', TRUE,3),
('Phòng ghép', 'Phòng cho 3 người ở chung.', 3, 4000000, 3500, 50000, 'per_person', TRUE,3),
('Phòng ngủ lớn', 'Phòng cho 4 người, có khu vực sinh hoạt chung.', 4, 5500000, 3500, 50000, 'per_person', TRUE,4),
('Phòng cho gia đình', 'Phòng rộng rãi cho gia đình nhỏ.', 4, 7000000, 3500, 50000, 'per_person', TRUE,4),
('Phòng cao cấp', 'Phòng cho 2 người, có tất cả tiện nghi hiện đại.', 2, 8000000,3500, 50000, 'per_unit', TRUE,4),
('Phòng 3 tầng', 'Phòng lớn, có sân thượng và phòng khách riêng.', 6, 12000000, 3500, 50000, 'per_unit', TRUE,4);

-- Thêm dữ liệu vào bảng Rooms (Phòng)
INSERT INTO Rooms (property_id, room_type_id, room_number, max_occupants, current_occupants, current_water_usage, current_electricity_usage, status, is_active)
VALUES 
-- Nhà Trọ u2-1258-123
(1, 1, 'P1', 1, 1, 5, 2, 'Available', TRUE),
(2, 2, 'P2', 2, 2, 8, 3, 'Available', TRUE),
(5, 3, 'P3', 4, 3, 10, 5, 'Available', TRUE),
(8, 1, 'P4', 1, 1, 5, 2, 'Available', TRUE),
(1, 2, 'P5', 2, 2, 8, 3, 'Available', TRUE),
(2, 3, 'P6', 4, 3, 10, 5, 'Available', TRUE),
(5, 1, 'P7', 1, 1, 5, 2, 'Available', TRUE),
(8, 2, 'P8', 2, 2, 8, 3, 'Available', TRUE),
(1, 3, 'P9', 4, 3, 10, 5, 'Available', TRUE),
(2, 1, 'P10', 1, 1, 5, 2, 'Available', TRUE),
(5, 2, 'P11', 2, 2, 8, 3, 'Available', TRUE),
(8, 3, 'P12', 4, 3, 10, 5, 'Available', TRUE),
(1, 1, 'P13', 1, 1, 5, 2, 'Available', TRUE),
(2, 2, 'P14', 2, 2, 8, 3, 'Available', TRUE),
(5, 3, 'P15', 4, 3, 10, 5, 'Available', TRUE),
(8, 1, 'P16', 1, 1, 5, 2, 'Available', TRUE),
(1, 2, 'P17', 2, 2, 8, 3, 'Available', TRUE),
(2, 3, 'P18', 4, 3, 10, 5, 'Available', TRUE),

-- Nhà Trọ u3-369-456
(3, 4, 'P1', 1, 1, 5, 2, 'Available', TRUE),
(6, 5, 'P2', 2, 2, 8, 3, 'Available', TRUE),
(9, 6, 'P3', 4, 3, 10, 5, 'Available', TRUE),
(3, 4, 'P4', 1, 1, 5, 2, 'Available', TRUE),
(6, 5, 'P5', 2, 2, 8, 3, 'Available', TRUE),
(9, 6, 'P6', 4, 3, 10, 5, 'Available', TRUE),
(3, 4, 'P7', 1, 1, 5, 2, 'Available', TRUE),
(6, 5, 'P8', 2, 2, 8, 3, 'Available', TRUE),
(9, 6, 'P9', 4, 3, 10, 5, 'Available', TRUE),
(3, 4, 'P10', 1, 1, 5, 2, 'Available', TRUE),
(6, 5, 'P11', 2, 2, 8, 3, 'Available', TRUE),
(9, 6, 'P12', 4, 3, 10, 5, 'Available', TRUE),
(3, 4, 'P13', 1, 1, 5, 2, 'Available', TRUE),
(6, 5, 'P14', 2, 2, 8, 3, 'Available', TRUE),
(9, 6, 'P15', 4, 3, 10, 5, 'Available', TRUE),
(3, 4, 'P16', 1, 1, 5, 2, 'Available', TRUE),
(6, 5, 'P17', 2, 2, 8, 3, 'Available', TRUE),
(9, 6, 'P18', 4, 3, 10, 5, 'Available', TRUE),

-- Nhà Trọ u4-4710-78910
(4, 7, 'P1', 1, 1, 5, 2, 'Available', TRUE),
(7, 8, 'P2', 2, 2, 8, 3, 'Available', TRUE),
(10, 9, 'P3', 4, 3, 10, 5, 'Available', TRUE),
(4, 10, 'P4', 1, 1, 5, 2, 'Available', TRUE),
(7, 7, 'P5', 2, 2, 8, 3, 'Available', TRUE),
(10, 8, 'P6', 4, 3, 10, 5, 'Available', TRUE),
(4, 9, 'P7', 1, 1, 5, 2, 'Available', TRUE),
(7, 10, 'P8', 2, 2, 8, 3, 'Available', TRUE),
(10, 7, 'P9', 4, 3, 10, 5, 'Available', TRUE),
(4, 8, 'P10', 1, 1, 5, 2, 'Available', TRUE),
(7, 9, 'P11', 2, 2, 8, 3, 'Available', TRUE),
(10, 10, 'P12', 4, 3, 10, 5, 'Available', TRUE),
(4, 7, 'P13', 1, 1, 5, 2, 'Available', TRUE),
(7, 8, 'P14', 2, 2, 8, 3, 'Available', TRUE),
(10, 9, 'P15', 4, 3, 10, 5, 'Available', TRUE),
(4, 10, 'P16', 1, 1, 5, 2, 'Available', TRUE),
(7, 7, 'P17', 2, 2, 8, 3, 'Available', TRUE),
(10, 8, 'P18', 4, 3, 10, 5, 'Available', TRUE);

-- Thêm dữ liệu vào bảng Services (Dịch vụ phòng)
INSERT INTO Services (service_name, service_description, service_price, is_active,landlord_id)
VALUES 
('Internet', 'Dịch vụ Internet tốc độ cao cho mỗi phòng', 200000, TRUE,2),
('Giặt là', 'Dịch vụ giặt ủi cho khách thuê phòng', 100000, TRUE,2),
('Bảo vệ', 'Dịch vụ bảo vệ 24/7 cho khu nhà trọ', 300000, TRUE,2),
('Dọn vệ sinh', 'Dịch vụ dọn dẹp phòng định kỳ', 150000, TRUE,3),
('Cáp truyền hình', 'Dịch vụ cáp truyền hình cho mỗi phòng', 180000, TRUE,3),
('Máy lạnh', 'Dịch vụ thuê máy lạnh riêng cho phòng', 500000, TRUE,3),
('Giữ xe', 'Dịch vụ giữ xe cho cư dân', 100000, TRUE,3),
('Sửa chữa', 'Dịch vụ sửa chữa trong phòng', 250000, TRUE,4),
('Điện thoại', 'Dịch vụ điện thoại nội bộ', 30000, TRUE,4),
('Cà phê', 'Dịch vụ cà phê cho các phòng VIP', 50000, TRUE,4);

-- Thêm dữ liệu vào bảng Contracts (Hợp đồng thuê)
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    30, 5, '2025-01-02', '2025-01-27',
    2000000, 50000, 70000,
    100000, 'Completed', 'Paid', '2025-01-27', 'Bank Transfer'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    44, 6, '2025-01-02', '2025-01-28',
    6000000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-01-28', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    49, 7, '2025-01-03', '2025-01-26',
    2000000, 50000, 70000,
    200000, 'Completed', 'Paid', '2025-01-26', 'Bank Transfer'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    18, 8, '2025-01-02', '2025-01-28',
    4500000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-01-28', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    9, 9, '2025-01-01', '2025-01-26',
    2000000, 50000, 70000,
    200000, 'Completed', 'Paid', '2025-01-26', 'Bank Transfer'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    12, 10, '2025-01-03', '2025-01-28',
    2000000, 50000, 70000,
    200000, 'Completed', 'Paid', '2025-01-28', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    12, 5, '2025-02-03', '2025-02-25',
    2000000, 50000, 70000,
    200000, 'Completed', 'Paid', '2025-02-25', 'Credit Card'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    50, 6, '2025-02-03', '2025-02-25',
    6000000, 50000, 70000,
    100000, 'Completed', 'Paid', '2025-02-25', 'Bank Transfer'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    26, 7, '2025-02-02', '2025-02-26',
    3500000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-02-26', 'Bank Transfer'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    48, 8, '2025-02-03', '2025-02-25',
    4500000, 50000, 70000,
    200000, 'Completed', 'Paid', '2025-02-25', 'Credit Card'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    54, 9, '2025-02-02', '2025-02-28',
    6000000, 50000, 70000,
    200000, 'Completed', 'Paid', '2025-02-28', 'Bank Transfer'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    48, 10, '2025-02-02', '2025-02-25',
    2000000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-02-25', 'Bank Transfer'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    3, 5, '2025-03-01', '2025-03-28',
    4500000, 50000, 70000,
    100000, 'Completed', 'Paid', '2025-03-28', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    19, 6, '2025-03-03', '2025-03-25',
    6000000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-03-25', 'Bank Transfer'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    49, 7, '2025-03-02', '2025-03-25',
    2000000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-03-25', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    14, 8, '2025-03-03', '2025-03-25',
    2000000, 50000, 70000,
    100000, 'Completed', 'Paid', '2025-03-25', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    29, 9, '2025-03-02', '2025-03-27',
    3500000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-03-27', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    38, 10, '2025-03-01', '2025-03-28',
    4500000, 50000, 70000,
    100000, 'Completed', 'Paid', '2025-03-28', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    6, 5, '2025-04-02', '2025-04-28',
    3500000, 50000, 70000,
    100000, 'Completed', 'Paid', '2025-04-28', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    54, 6, '2025-04-02', '2025-04-28',
    4500000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-04-28', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    9, 7, '2025-04-02', '2025-04-26',
    3500000, 50000, 70000,
    200000, 'Completed', 'Paid', '2025-04-26', 'Credit Card'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    15, 8, '2025-04-02', '2025-04-25',
    2000000, 50000, 70000,
    100000, 'Completed', 'Paid', '2025-04-25', 'Cash'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    32, 9, '2025-04-02', '2025-04-26',
    6000000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-04-26', 'Bank Transfer'
);
INSERT INTO Contracts (
    room_id, renter_id, start_date, end_date,
    rent_price, total_water_price, total_electricity_price,
    total_service_price, status, payment_status, payment_date, payment_method
) VALUES (
    28, 10, '2025-04-01', '2025-04-26',
    3500000, 50000, 70000,
    150000, 'Completed', 'Paid', '2025-04-26', 'Credit Card'
);

-- Thêm dữ liệu vào bảng Room_Services (Liên kết phòng với dịch vụ sử dụng)
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (1, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (1, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (1, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (2, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (2, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (2, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (3, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (3, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (3, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (4, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (4, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (4, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (5, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (5, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (5, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (6, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (6, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (6, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (7, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (7, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (7, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (8, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (8, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (8, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (9, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (9, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (9, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (10, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (10, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (10, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (11, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (11, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (11, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (12, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (12, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (12, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (13, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (13, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (13, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (14, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (14, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (14, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (15, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (15, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (15, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (16, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (16, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (16, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (17, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (17, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (17, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (18, 1, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (18, 2, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (18, 3, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (19, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (19, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (19, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (19, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (20, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (20, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (20, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (20, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (21, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (21, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (21, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (21, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (22, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (22, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (22, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (22, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (23, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (23, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (23, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (23, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (24, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (24, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (24, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (24, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (25, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (25, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (25, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (25, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (26, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (26, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (26, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (26, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (27, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (27, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (27, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (27, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (28, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (28, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (28, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (28, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (29, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (29, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (29, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (29, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (30, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (30, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (30, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (30, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (31, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (31, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (31, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (31, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (32, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (32, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (32, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (32, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (33, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (33, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (33, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (33, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (34, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (34, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (34, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (34, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (35, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (35, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (35, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (35, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (36, 4, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (36, 5, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (36, 6, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (36, 7, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (37, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (37, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (37, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (38, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (38, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (38, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (39, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (39, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (39, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (40, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (40, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (40, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (41, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (41, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (41, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (42, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (42, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (42, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (43, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (43, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (43, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (44, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (44, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (44, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (45, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (45, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (45, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (46, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (46, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (46, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (47, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (47, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (47, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (48, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (48, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (48, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (49, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (49, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (49, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (50, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (50, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (50, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (51, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (51, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (51, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (52, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (52, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (52, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (53, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (53, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (53, 10, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (54, 8, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (54, 9, TRUE);
INSERT INTO Room_Services (room_id, service_id, is_active) VALUES (54, 10, TRUE);

ALTER TABLE Rooms ADD COLUMN image_url VARCHAR(500) DEFAULT NULL;
