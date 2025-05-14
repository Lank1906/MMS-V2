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
    name VARCHAR(100) NOT NULL,               -- Tên loại phòng (Ví dụ: Phòng đơn, Phòng đôi)
    description TEXT,                         -- Mô tả về loại phòng
    max_occupants INT,                        -- Số người tối đa trong phòng
    rent_price DECIMAL(10, 2) NOT NULL,       -- Giá thuê phòng
    electricity_price DECIMAL(10, 2),         -- Đơn giá điện cho mỗi kWh
    water_price DECIMAL(10, 2),               -- Đơn giá nước cho mỗi m3
    charge_type ENUM('per_person', 'per_unit') DEFAULT 'per_person', -- Loại tính phí: theo người hay theo đơn vị
    is_active BOOLEAN DEFAULT TRUE -- Trạng thái hoạt động của loại phòng (TRUE = hoạt động, FALSE = không hoạt động)
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
    service_name VARCHAR(255) NOT NULL,
    service_description TEXT,
    service_price DECIMAL(10, 2), -- Giá dịch vụ
    is_active BOOLEAN DEFAULT TRUE -- Trạng thái hoạt động của dịch vụ (TRUE = hoạt động, FALSE = không hoạt động)
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
    is_active BOOLEAN DEFAULT TRUE -- Trạng thái hoạt động của hợp đồng (TRUE = hoạt động, FALSE = không hoạt động)
);

-- Bảng Payments (Thanh toán)
CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT,
    payment_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('Cash', 'Bank Transfer', 'Credit Card') NOT NULL,
    FOREIGN KEY (contract_id) REFERENCES Contracts(contract_id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE -- Trạng thái hoạt động của thanh toán (TRUE = hoạt động, FALSE = không hoạt động)
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

-- Thêm dữ liệu vào bảng Properties (Cụm nhà trọ)
INSERT INTO Properties (landlord_id, name, address, contact_phone, is_active)
VALUES 
(2, 'Nhà Trọ Bình Minh', 'Số 123, Đường Lê Quang Đạo, TP.HCM', '0912345679', TRUE),
(2, 'Nhà Trọ Hòa Bình', 'Số 789, Đường Lê Quang Đạo, TP.HCM', '0912345679', TRUE),
(3, 'Nhà Trọ Hòa Thành', 'Số 456, Đường Nguyễn Huệ, TP.HCM', '0912345680', TRUE),
(6, 'Nhà Trọ Minh Thành', 'Số 789, Đường Lê Lợi, TP.HCM', '0912345690', TRUE),
(8, 'Nhà Trọ Kim Sơn', 'Số 88, Đường Hoàng Văn Thụ, TP.HCM', '0912345671', TRUE),
(9, 'Nhà Trọ Hoàng Hưng', 'Số 99, Đường Nguyễn Trãi, TP.HCM', '0912345672', TRUE),
(10, 'Nhà Trọ Bình Minh 2', 'Số 500, Đường Quang Trung, TP.HCM', '0912345683', TRUE),
(5, 'Nhà Trọ Thành Công', 'Số 200, Đường Lê Quang Đạo, TP.HCM', '0912345691', TRUE),
(7, 'Nhà Trọ Hoa Mai', 'Số 150, Đường Nguyễn Thiện Thuật, TP.HCM', '0912345692', TRUE),
(4, 'Nhà Trọ Quang Nam', 'Số 300, Đường Nguyễn Huệ, TP.HCM', '0912345682', TRUE);

-- Thêm dữ liệu vào bảng RoomTypes (Loại phòng)
INSERT INTO RoomTypes (name, description, max_occupants, rent_price, electricity_price, water_price, charge_type, is_active)
VALUES 
('Phòng đơn', 'Phòng cho 1 người, có giường và bàn làm việc.', 1, 2000000.00, 3.00, 2.50, 'per_person', TRUE),
('Phòng đôi', 'Phòng cho 2 người, có giường đôi và tủ đồ.', 2, 3500000.00, 3.00, 3.00, 'per_person', TRUE),
('Phòng chung cư', 'Phòng lớn cho 4 người, có bếp và phòng khách riêng.', 4, 6000000.00, 3.50, 3.50, 'per_person', TRUE),
('Phòng VIP', 'Phòng có đầy đủ tiện nghi, phù hợp cho 1-2 người.', 2, 4500000.00, 3.50, 3.00, 'per_person', TRUE),
('Phòng studio', 'Phòng nhỏ tiện nghi, có bếp riêng.', 1, 3000000.00, 2.50, 2.00, 'per_unit', TRUE),
('Phòng ghép', 'Phòng cho 3 người ở chung.', 3, 4000000.00, 2.80, 2.80, 'per_person', TRUE),
('Phòng ngủ lớn', 'Phòng cho 4 người, có khu vực sinh hoạt chung.', 4, 5500000.00, 3.20, 3.20, 'per_person', TRUE),
('Phòng cho gia đình', 'Phòng rộng rãi cho gia đình nhỏ.', 4, 7000000.00, 4.00, 3.80, 'per_person', TRUE),
('Phòng cao cấp', 'Phòng cho 2 người, có tất cả tiện nghi hiện đại.', 2, 8000000.00, 4.50, 4.00, 'per_unit', TRUE),
('Phòng 3 tầng', 'Phòng lớn, có sân thượng và phòng khách riêng.', 6, 12000000.00, 5.00, 4.50, 'per_unit', TRUE);

-- Thêm dữ liệu vào bảng Rooms (Phòng)
INSERT INTO Rooms (property_id, room_type_id, room_number, max_occupants, current_occupants, current_water_usage, current_electricity_usage, status, is_active)
VALUES 
-- Nhà Trọ Bình Minh
(1, 1, 'A1', 1, 1, 5.00, 2.00, 'Available', TRUE),
(1, 2, 'B1', 2, 2, 8.00, 3.50, 'Available', TRUE),
(1, 3, 'C1', 4, 3, 10.00, 5.00, 'Rented', TRUE),

-- Nhà Trọ Hòa Bình
(2, 1, 'A1', 1, 1, 4.50, 2.10, 'Available', TRUE),
(2, 2, 'B1', 2, 2, 7.50, 3.20, 'Under Maintenance', TRUE),

-- Nhà Trọ Minh Thành
(4, 3, 'A1', 4, 4, 12.00, 6.00, 'Available', TRUE),
(4, 4, 'B1', 2, 1, 6.00, 2.50, 'Rented', TRUE),

-- Nhà Trọ Hoa Mai
(7, 1, 'A1', 1, 1, 5.00, 2.50, 'Available', TRUE),
(7, 2, 'B1', 2, 2, 8.50, 4.00, 'Rented', TRUE),

-- Nhà Trọ Quang Nam
(10, 5, 'C1', 4, 4, 15.00, 7.00, 'Available', TRUE);

-- Thêm dữ liệu vào bảng Services (Dịch vụ phòng)
INSERT INTO Services (service_name, service_description, service_price, is_active)
VALUES 
('Internet', 'Dịch vụ Internet tốc độ cao cho mỗi phòng', 200000.00, TRUE),
('Giặt là', 'Dịch vụ giặt ủi cho khách thuê phòng', 100000.00, TRUE),
('Bảo vệ', 'Dịch vụ bảo vệ 24/7 cho khu nhà trọ', 300000.00, TRUE),
('Dọn vệ sinh', 'Dịch vụ dọn dẹp phòng định kỳ', 150000.00, TRUE),
('Cáp truyền hình', 'Dịch vụ cáp truyền hình cho mỗi phòng', 180000.00, TRUE),
('Máy lạnh', 'Dịch vụ thuê máy lạnh riêng cho phòng', 500000.00, TRUE),
('Giữ xe', 'Dịch vụ giữ xe cho cư dân', 100000.00, TRUE),
('Sửa chữa', 'Dịch vụ sửa chữa trong phòng', 250000.00, TRUE),
('Điện thoại', 'Dịch vụ điện thoại nội bộ', 30000.00, TRUE),
('Cà phê', 'Dịch vụ cà phê cho các phòng VIP', 50000.00, TRUE);

-- Thêm dữ liệu vào bảng Contracts (Hợp đồng thuê)
INSERT INTO Contracts (room_id, renter_id, start_date, end_date, rent_price, total_water_price, total_electricity_price, total_service_price, status, is_active)
VALUES 
(1, 5, '2023-01-01', '2023-12-31', 2000000.00, 50.00, 60.00, 200000.00, 'Active', TRUE),
(2, 5, '2023-05-01', '2024-05-01', 3500000.00, 80.00, 90.00, 150000.00, 'Active', TRUE),
(3, 6, '2023-03-01', '2024-03-01', 6000000.00, 100.00, 150.00, 250000.00, 'Completed', TRUE),
(7, 7, '2023-06-01', '2024-06-01', 4500000.00, 60.00, 70.00, 100000.00, 'Active', TRUE),
(4, 8, '2023-04-01', '2024-04-01', 3000000.00, 60.00, 75.00, 180000.00, 'Active', TRUE),
(5, 9, '2023-07-01', '2024-07-01', 4000000.00, 90.00, 120.00, 200000.00, 'Active', TRUE),
(6, 10, '2023-02-01', '2024-02-01', 3500000.00, 80.00, 85.00, 150000.00, 'Active', TRUE),
(2, 9, '2023-08-01', '2024-08-01', 4200000.00, 75.00, 100.00, 175000.00, 'Completed', TRUE),
(1, 8, '2023-11-01', '2024-11-01', 2500000.00, 55.00, 65.00, 190000.00, 'Terminated', TRUE),
(3, 7, '2023-01-15', '2024-01-15', 3800000.00, 70.00, 80.00, 210000.00, 'Active', TRUE);

-- Thêm dữ liệu vào bảng Payments (Thanh toán)
INSERT INTO Payments (contract_id, payment_date, amount, payment_method, is_active)
VALUES 
(1, '2023-01-05', 2200000.00, 'Bank Transfer', TRUE),
(2, '2023-05-10', 3700000.00, 'Credit Card', TRUE),
(3, '2023-03-15', 6250000.00, 'Cash', TRUE),
(4, '2023-06-10', 4600000.00, 'Bank Transfer', TRUE),
(5, '2023-04-05', 3180000.00, 'Cash', TRUE),
(6, '2023-07-12', 4200000.00, 'Credit Card', TRUE),
(7, '2023-02-20', 3350000.00, 'Bank Transfer', TRUE),
(8, '2023-08-01', 4000000.00, 'Cash', TRUE),
(9, '2023-11-05', 2500000.00, 'Bank Transfer', TRUE),
(10, '2023-02-25', 3900000.00, 'Credit Card', TRUE);

-- Thêm dữ liệu vào bảng Room_Services (Liên kết phòng với dịch vụ sử dụng)
INSERT INTO Room_Services (room_id, service_id, is_active)
VALUES 
(1, 1, TRUE), -- Phòng A1 sử dụng dịch vụ Internet
(1, 2, TRUE), -- Phòng A1 sử dụng dịch vụ Giặt là
(2, 1, TRUE), -- Phòng B1 sử dụng dịch vụ Internet
(2, 3, TRUE), -- Phòng B1 sử dụng dịch vụ Bảo vệ
(3, 1, TRUE), -- Phòng C1 sử dụng dịch vụ Internet
(3, 2, TRUE), -- Phòng C1 sử dụng dịch vụ Giặt là
(4, 1, TRUE), -- Phòng D1 sử dụng dịch vụ Internet
(4, 3, TRUE), -- Phòng D1 sử dụng dịch vụ Bảo vệ
(5, 4, TRUE), -- Phòng E1 sử dụng dịch vụ Dọn vệ sinh
(6, 5, TRUE); -- Phòng F1 sử dụng dịch vụ Cáp truyền hình
