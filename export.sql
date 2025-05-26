-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 26, 2025 at 01:14 PM
-- Server version: 5.7.28-0ubuntu0.18.04.4
-- PHP Version: 7.4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `motel`
--

-- --------------------------------------------------------

--
-- Table structure for table `Contracts`
--

CREATE TABLE `Contracts` (
  `contract_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `renter_id` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `rent_price` decimal(10,2) NOT NULL,
  `total_water_price` decimal(10,2) NOT NULL,
  `total_electricity_price` decimal(10,2) NOT NULL,
  `total_service_price` decimal(10,2) DEFAULT '0.00',
  `status` enum('Active','Completed','Terminated') DEFAULT 'Active',
  `is_active` tinyint(1) DEFAULT '1',
  `payment_status` enum('Unpaid','Paid','Failed') DEFAULT 'Unpaid',
  `payment_date` date DEFAULT NULL,
  `payment_method` enum('Cash','Bank Transfer','Credit Card') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Contracts`
--

INSERT INTO `Contracts` (`contract_id`, `room_id`, `renter_id`, `start_date`, `end_date`, `rent_price`, `total_water_price`, `total_electricity_price`, `total_service_price`, `status`, `is_active`, `payment_status`, `payment_date`, `payment_method`) VALUES
(1, 30, 5, '2025-01-02', '2025-01-27', '2000000.00', '50000.00', '70000.00', '100000.00', 'Completed', 1, 'Paid', '2025-01-27', 'Bank Transfer'),
(2, 44, 6, '2025-01-02', '2025-01-28', '6000000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-01-28', 'Cash'),
(3, 49, 7, '2025-01-03', '2025-01-26', '2000000.00', '50000.00', '70000.00', '200000.00', 'Completed', 1, 'Paid', '2025-01-26', 'Bank Transfer'),
(4, 18, 8, '2025-01-02', '2025-01-28', '4500000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-01-28', 'Cash'),
(5, 9, 9, '2025-01-01', '2025-01-26', '2000000.00', '50000.00', '70000.00', '200000.00', 'Completed', 1, 'Paid', '2025-01-26', 'Bank Transfer'),
(6, 12, 10, '2025-01-03', '2025-01-28', '2000000.00', '50000.00', '70000.00', '200000.00', 'Completed', 1, 'Paid', '2025-01-28', 'Cash'),
(7, 12, 5, '2025-02-03', '2025-02-25', '2000000.00', '50000.00', '70000.00', '200000.00', 'Completed', 1, 'Paid', '2025-02-25', 'Credit Card'),
(8, 50, 6, '2025-02-03', '2025-02-25', '6000000.00', '50000.00', '70000.00', '100000.00', 'Completed', 1, 'Paid', '2025-02-25', 'Bank Transfer'),
(9, 26, 7, '2025-02-02', '2025-02-26', '3500000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-02-26', 'Bank Transfer'),
(10, 48, 8, '2025-02-03', '2025-02-25', '4500000.00', '50000.00', '70000.00', '200000.00', 'Completed', 1, 'Paid', '2025-02-25', 'Credit Card'),
(11, 54, 9, '2025-02-02', '2025-02-28', '6000000.00', '50000.00', '70000.00', '200000.00', 'Completed', 1, 'Paid', '2025-02-28', 'Bank Transfer'),
(12, 48, 10, '2025-02-02', '2025-02-25', '2000000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-02-25', 'Bank Transfer'),
(13, 3, 5, '2025-03-01', '2025-03-28', '4500000.00', '50000.00', '70000.00', '100000.00', 'Completed', 1, 'Paid', '2025-03-28', 'Cash'),
(14, 19, 6, '2025-03-03', '2025-03-25', '6000000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-03-25', 'Bank Transfer'),
(15, 49, 7, '2025-03-02', '2025-03-25', '2000000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-03-25', 'Cash'),
(16, 14, 8, '2025-03-03', '2025-03-25', '2000000.00', '50000.00', '70000.00', '100000.00', 'Completed', 1, 'Paid', '2025-03-25', 'Cash'),
(17, 29, 9, '2025-03-02', '2025-03-27', '3500000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-03-27', 'Cash'),
(18, 38, 10, '2025-03-01', '2025-03-28', '4500000.00', '50000.00', '70000.00', '100000.00', 'Completed', 1, 'Paid', '2025-03-28', 'Cash'),
(19, 6, 5, '2025-04-02', '2025-04-28', '3500000.00', '50000.00', '70000.00', '100000.00', 'Completed', 1, 'Paid', '2025-04-28', 'Cash'),
(20, 54, 6, '2025-04-02', '2025-04-28', '4500000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-04-28', 'Cash'),
(21, 9, 7, '2025-04-02', '2025-04-26', '3500000.00', '50000.00', '70000.00', '200000.00', 'Completed', 1, 'Paid', '2025-04-26', 'Credit Card'),
(22, 15, 8, '2025-04-02', '2025-04-25', '2000000.00', '50000.00', '70000.00', '100000.00', 'Completed', 1, 'Paid', '2025-04-25', 'Cash'),
(23, 32, 9, '2025-04-02', '2025-04-26', '6000000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-04-26', 'Bank Transfer'),
(24, 28, 10, '2025-04-01', '2025-04-26', '3500000.00', '50000.00', '70000.00', '150000.00', 'Completed', 1, 'Paid', '2025-04-26', 'Credit Card'),
(25, 1, 5, '2025-05-24', NULL, '2000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(26, 2, 5, '2025-05-24', NULL, '3500000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(27, 50, 6, '2025-05-24', NULL, '7000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(28, 16, 6, '2025-05-24', NULL, '2000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(29, 49, 6, '2025-05-24', NULL, '5500000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(30, 5, 7, '2025-05-24', NULL, '3500000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(31, 9, 7, '2025-05-24', NULL, '6000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(32, 54, 7, '2025-05-24', NULL, '7000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(33, 44, 8, '2025-05-24', NULL, '12000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(34, 42, 8, '2025-05-24', NULL, '7000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(35, 18, 8, '2025-05-24', '2025-05-31', '6000000.00', '100000.00', '10500.00', '400000.00', 'Active', 1, 'Unpaid', NULL, NULL),
(36, 46, 9, '2025-05-24', NULL, '7000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(37, 14, 9, '2025-05-24', NULL, '3500000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(38, 48, 9, '2025-05-24', NULL, '12000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(39, 45, 10, '2025-05-24', NULL, '5500000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(40, 8, 10, '2025-05-24', NULL, '3500000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(41, 21, 10, '2025-05-24', NULL, '4000000.00', '0.00', '0.00', '0.00', 'Active', 1, 'Unpaid', NULL, NULL),
(42, 18, NULL, '2025-05-24', '2025-05-25', '6000000.00', '350000.00', '52500.00', '600000.00', 'Active', 0, 'Unpaid', NULL, NULL),
(43, 18, NULL, '2025-05-24', '2025-05-26', '6000000.00', '300000.00', '42000.00', '600000.00', 'Active', 0, 'Unpaid', NULL, NULL),
(44, 18, NULL, '2025-05-24', '2025-05-26', '6000000.00', '250000.00', '14000.00', '600000.00', 'Active', 0, 'Unpaid', NULL, NULL),
(45, 18, NULL, '2025-05-24', '2025-05-31', '6000000.00', '250000.00', '35000.00', '400000.00', 'Active', 0, 'Unpaid', NULL, NULL),
(46, 18, NULL, '2025-05-25', '2025-05-29', '6000000.00', '250000.00', '35000.00', '400000.00', 'Active', 0, 'Unpaid', NULL, NULL),
(47, 18, NULL, '2025-05-28', '2025-05-31', '6000000.00', '250000.00', '35000.00', '400000.00', 'Active', 0, 'Unpaid', NULL, NULL),
(48, 18, NULL, '2025-05-14', '2025-05-29', '6000000.00', '100000.00', '3500.00', '400000.00', 'Active', 0, 'Unpaid', NULL, NULL),
(49, 18, NULL, '2025-05-26', '2025-05-29', '6000000.00', '50000.00', '7000.00', '400000.00', 'Active', 0, 'Unpaid', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Properties`
--

CREATE TABLE `Properties` (
  `property_id` int(11) NOT NULL,
  `landlord_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `address` text,
  `contact_phone` varchar(15) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Properties`
--

INSERT INTO `Properties` (`property_id`, `landlord_id`, `name`, `address`, `contact_phone`, `is_active`) VALUES
(1, 2, 'Nhà Trọ Bình Minh', 'Số 123, Đường Lê Quang Đạo, TP.HCM', '0912345679', 1),
(2, 2, 'Nhà Trọ Hòa Bình', 'Số 789, Đường Lê Quang Đạo, TP.HCM', '0912345679', 1),
(3, 3, 'Nhà Trọ Hòa Thành', 'Số 456, Đường Nguyễn Huệ, TP.HCM', '0912345680', 1),
(4, 4, 'Nhà Trọ Minh Thành', 'Số 789, Đường Lê Lợi, TP.HCM', '0912345690', 1),
(5, 2, 'Nhà Trọ Kim Sơn', 'Số 88, Đường Hoàng Văn Thụ, TP.HCM', '0912345671', 1),
(6, 3, 'Nhà Trọ Hoàng Hưng', 'Số 99, Đường Nguyễn Trãi, TP.HCM', '0912345672', 1),
(7, 4, 'Nhà Trọ Bình Minh 2', 'Số 500, Đường Quang Trung, TP.HCM', '0912345683', 1),
(8, 2, 'Nhà Trọ Thành Công', 'Số 200, Đường Lê Quang Đạo, TP.HCM', '0912345691', 1),
(9, 3, 'Nhà Trọ Hoa Mai', 'Số 150, Đường Nguyễn Thiện Thuật, TP.HCM', '0912345692', 1),
(10, 4, 'Nhà Trọ Quang Nam', 'Số 300, Đường Nguyễn Huệ, TP.HCM', '0912345682', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Rooms`
--

CREATE TABLE `Rooms` (
  `room_id` int(11) NOT NULL,
  `property_id` int(11) DEFAULT NULL,
  `room_type_id` int(11) DEFAULT NULL,
  `room_number` varchar(20) DEFAULT NULL,
  `max_occupants` int(11) DEFAULT NULL,
  `current_occupants` int(11) DEFAULT NULL,
  `current_water_usage` decimal(10,2) DEFAULT NULL,
  `current_electricity_usage` decimal(10,2) DEFAULT NULL,
  `status` enum('Available','Rented','Under Maintenance') DEFAULT 'Available',
  `is_active` tinyint(1) DEFAULT '1',
  `image_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Rooms`
--

INSERT INTO `Rooms` (`room_id`, `property_id`, `room_type_id`, `room_number`, `max_occupants`, `current_occupants`, `current_water_usage`, `current_electricity_usage`, `status`, `is_active`, `image_url`) VALUES
(1, 1, 1, 'P1', 1, 1, '5.00', '2.00', 'Rented', 1, '/uploads/image-1748264312198-613095791.jpg'),
(2, 2, 2, 'P2', 2, 1, '8.00', '3.00', 'Rented', 1, '/uploads/image-1748264301763-733831548.jpg'),
(3, 5, 3, 'P3', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264275143-933836328.jpg'),
(4, 8, 1, 'P4', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264183830-498750667.jpg'),
(5, 1, 2, 'P5', 2, 1, '8.00', '3.00', 'Rented', 1, '/uploads/image-1748264251390-447352180.jfif'),
(6, 2, 3, 'P6', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264171973-775559321.jpg'),
(7, 5, 1, 'P7', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264183830-498750667.jpg'),
(8, 8, 2, 'P8', 2, 1, '8.00', '3.00', 'Rented', 1, '/uploads/image-1748264263203-494917514.jpg'),
(9, 1, 3, 'P9', 4, 1, '10.00', '5.00', 'Rented', 1, '/uploads/image-1748264312198-613095791.jpg'),
(10, 2, 1, 'P10', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264301763-733831548.jpg'),
(11, 5, 2, 'P11', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264290097-401258107.jpg'),
(12, 8, 3, 'P12', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264275143-933836328.jpg'),
(13, 1, 1, 'P13', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264263203-494917514.jpg'),
(14, 2, 2, 'P14', 2, 1, '8.00', '3.00', 'Rented', 1, '/uploads/image-1748264251390-447352180.jfif'),
(15, 5, 3, 'P15', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264236983-35342588.jfif'),
(16, 8, 1, 'P16', 1, 1, '5.00', '2.00', 'Rented', 1, '/uploads/image-1748264196694-408254006.jfif'),
(17, 1, 2, 'P17', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264183830-498750667.jpg'),
(18, 2, 3, 'P18', 4, 1, '20.00', '5.00', 'Rented', 1, '/uploads/image-1748264171973-775559321.jpg'),
(19, 3, 4, 'P1', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264312198-613095791.jpg'),
(20, 6, 5, 'P2', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264301763-733831548.jpg'),
(21, 9, 6, 'P3', 4, 1, '10.00', '5.00', 'Rented', 1, '/uploads/image-1748264275143-933836328.jpg'),
(22, 3, 4, 'P4', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264183830-498750667.jpg'),
(23, 6, 5, 'P5', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264251390-447352180.jfif'),
(24, 9, 6, 'P6', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264171973-775559321.jpg'),
(25, 3, 4, 'P7', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264183830-498750667.jpg'),
(26, 6, 5, 'P8', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264263203-494917514.jpg'),
(27, 9, 6, 'P9', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264312198-613095791.jpg'),
(28, 3, 4, 'P10', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264301763-733831548.jpg'),
(29, 6, 5, 'P11', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264290097-401258107.jpg'),
(30, 9, 6, 'P12', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264275143-933836328.jpg'),
(31, 3, 4, 'P13', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264263203-494917514.jpg'),
(32, 6, 5, 'P14', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264251390-447352180.jfif'),
(33, 9, 6, 'P15', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264236983-35342588.jfif'),
(34, 3, 4, 'P16', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264196694-408254006.jfif'),
(35, 6, 5, 'P17', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264183830-498750667.jpg'),
(36, 9, 6, 'P18', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264171973-775559321.jpg'),
(37, 4, 7, 'P1', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264312198-613095791.jpg'),
(38, 7, 8, 'P2', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264301763-733831548.jpg'),
(39, 10, 9, 'P3', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264275143-933836328.jpg'),
(40, 4, 10, 'P4', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264183830-498750667.jpg'),
(41, 7, 7, 'P5', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264251390-447352180.jfif'),
(42, 10, 8, 'P6', 4, 1, '10.00', '5.00', 'Rented', 1, '/uploads/image-1748264171973-775559321.jpg'),
(43, 4, 9, 'P7', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264183830-498750667.jpg'),
(44, 7, 10, 'P8', 2, 1, '8.00', '3.00', 'Rented', 1, '/uploads/image-1748264263203-494917514.jpg'),
(45, 10, 7, 'P9', 4, 1, '10.00', '5.00', 'Rented', 1, '/uploads/image-1748264312198-613095791.jpg'),
(46, 4, 8, 'P10', 1, 1, '5.00', '2.00', 'Rented', 1, '/uploads/image-1748264301763-733831548.jpg'),
(47, 7, 9, 'P11', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264290097-401258107.jpg'),
(48, 10, 10, 'P12', 4, 1, '10.00', '5.00', 'Rented', 1, '/uploads/image-1748264275143-933836328.jpg'),
(49, 4, 7, 'P13', 1, 1, '5.00', '2.00', 'Rented', 1, '/uploads/image-1748264263203-494917514.jpg'),
(50, 7, 8, 'P14', 2, 1, '8.00', '3.00', 'Rented', 1, '/uploads/image-1748264251390-447352180.jfif'),
(51, 10, 9, 'P15', 4, 3, '10.00', '5.00', 'Available', 1, '/uploads/image-1748264236983-35342588.jfif'),
(52, 4, 10, 'P16', 1, 1, '5.00', '2.00', 'Available', 1, '/uploads/image-1748264196694-408254006.jfif'),
(53, 7, 7, 'P17', 2, 2, '8.00', '3.00', 'Available', 1, '/uploads/image-1748264183830-498750667.jpg'),
(54, 10, 8, 'P18', 4, 1, '10.00', '5.00', 'Rented', 1, '/uploads/image-1748264171973-775559321.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `RoomTypes`
--

CREATE TABLE `RoomTypes` (
  `room_type_id` int(11) NOT NULL,
  `landlord_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `max_occupants` int(11) DEFAULT NULL,
  `rent_price` decimal(10,2) NOT NULL,
  `electricity_price` decimal(10,2) DEFAULT NULL,
  `water_price` decimal(10,2) DEFAULT NULL,
  `charge_type` enum('per_person','per_unit') DEFAULT 'per_person',
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `RoomTypes`
--

INSERT INTO `RoomTypes` (`room_type_id`, `landlord_id`, `name`, `description`, `max_occupants`, `rent_price`, `electricity_price`, `water_price`, `charge_type`, `is_active`) VALUES
(1, 2, 'Phòng đơn', 'Phòng cho 1 người, có giường và bàn làm việc.', 1, '2000000.00', '3500.00', '50000.00', 'per_person', 1),
(2, 2, 'Phòng đôi', 'Phòng cho 2 người, có giường đôi và tủ đồ.', 2, '3500000.00', '3500.00', '50000.00', 'per_person', 1),
(3, 2, 'Phòng chung cư', 'Phòng lớn cho 4 người, có bếp và phòng khách riêng.', 4, '6000000.00', '3500.00', '50000.00', 'per_person', 1),
(4, 3, 'Phòng VIP', 'Phòng có đầy đủ tiện nghi, phù hợp cho 1-2 người.', 2, '4500000.00', '3500.00', '50000.00', 'per_person', 1),
(5, 3, 'Phòng studio', 'Phòng nhỏ tiện nghi, có bếp riêng.', 1, '3000000.00', '3500.00', '50000.00', 'per_unit', 1),
(6, 3, 'Phòng ghép', 'Phòng cho 3 người ở chung.', 3, '4000000.00', '3500.00', '50000.00', 'per_person', 1),
(7, 4, 'Phòng ngủ lớn', 'Phòng cho 4 người, có khu vực sinh hoạt chung.', 4, '5500000.00', '3500.00', '50000.00', 'per_person', 1),
(8, 4, 'Phòng cho gia đình', 'Phòng rộng rãi cho gia đình nhỏ.', 4, '7000000.00', '3500.00', '50000.00', 'per_person', 1),
(9, 4, 'Phòng cao cấp', 'Phòng cho 2 người, có tất cả tiện nghi hiện đại.', 2, '8000000.00', '3500.00', '50000.00', 'per_unit', 1),
(10, 4, 'Phòng 3 tầng', 'Phòng lớn, có sân thượng và phòng khách riêng.', 6, '12000000.00', '3500.00', '50000.00', 'per_unit', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Room_Renters`
--

CREATE TABLE `Room_Renters` (
  `room_renter_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `renter_id` int(11) NOT NULL,
  `join_date` date NOT NULL,
  `leave_date` date DEFAULT NULL,
  `status` enum('Active','Left') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Room_Renters`
--

INSERT INTO `Room_Renters` (`room_renter_id`, `room_id`, `renter_id`, `join_date`, `leave_date`, `status`) VALUES
(1, 1, 5, '2025-05-24', NULL, 'Active'),
(2, 2, 5, '2025-05-24', NULL, 'Active'),
(3, 50, 6, '2025-05-24', NULL, 'Active'),
(4, 16, 6, '2025-05-24', NULL, 'Active'),
(5, 49, 6, '2025-05-24', NULL, 'Active'),
(6, 5, 7, '2025-05-24', NULL, 'Active'),
(7, 9, 7, '2025-05-24', NULL, 'Active'),
(8, 54, 7, '2025-05-24', NULL, 'Active'),
(9, 44, 8, '2025-05-24', NULL, 'Active'),
(10, 42, 8, '2025-05-24', NULL, 'Active'),
(11, 18, 8, '2025-05-24', NULL, 'Active'),
(12, 46, 9, '2025-05-24', NULL, 'Active'),
(13, 14, 9, '2025-05-24', NULL, 'Active'),
(14, 48, 9, '2025-05-24', NULL, 'Active'),
(15, 45, 10, '2025-05-24', NULL, 'Active'),
(16, 8, 10, '2025-05-24', NULL, 'Active'),
(17, 21, 10, '2025-05-24', NULL, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `Room_Services`
--

CREATE TABLE `Room_Services` (
  `room_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Room_Services`
--

INSERT INTO `Room_Services` (`room_id`, `service_id`, `is_active`) VALUES
(1, 1, 1),
(1, 2, 1),
(1, 3, 1),
(2, 1, 1),
(2, 2, 1),
(2, 3, 1),
(3, 1, 1),
(3, 2, 1),
(3, 3, 1),
(4, 1, 1),
(4, 2, 1),
(4, 3, 1),
(5, 1, 1),
(5, 2, 1),
(5, 3, 1),
(6, 1, 1),
(6, 2, 1),
(6, 3, 1),
(7, 1, 1),
(7, 2, 1),
(7, 3, 1),
(8, 1, 1),
(8, 2, 1),
(8, 3, 1),
(9, 1, 1),
(9, 2, 1),
(9, 3, 1),
(10, 1, 1),
(10, 2, 1),
(10, 3, 1),
(11, 1, 1),
(11, 2, 1),
(11, 3, 1),
(12, 1, 1),
(12, 2, 1),
(12, 3, 1),
(13, 1, 1),
(13, 2, 1),
(13, 3, 1),
(14, 1, 1),
(14, 2, 1),
(14, 3, 1),
(15, 1, 1),
(15, 2, 1),
(15, 3, 1),
(16, 1, 1),
(16, 2, 1),
(16, 3, 1),
(17, 1, 1),
(17, 2, 1),
(17, 3, 1),
(18, 1, 0),
(18, 2, 1),
(18, 3, 1),
(19, 4, 1),
(19, 5, 1),
(19, 6, 1),
(19, 7, 1),
(20, 4, 1),
(20, 5, 1),
(20, 6, 1),
(20, 7, 1),
(21, 4, 1),
(21, 5, 1),
(21, 6, 1),
(21, 7, 1),
(22, 4, 1),
(22, 5, 1),
(22, 6, 1),
(22, 7, 1),
(23, 4, 1),
(23, 5, 1),
(23, 6, 1),
(23, 7, 1),
(24, 4, 1),
(24, 5, 1),
(24, 6, 1),
(24, 7, 1),
(25, 4, 1),
(25, 5, 1),
(25, 6, 1),
(25, 7, 1),
(26, 4, 1),
(26, 5, 1),
(26, 6, 1),
(26, 7, 1),
(27, 4, 1),
(27, 5, 1),
(27, 6, 1),
(27, 7, 1),
(28, 4, 1),
(28, 5, 1),
(28, 6, 1),
(28, 7, 1),
(29, 4, 1),
(29, 5, 1),
(29, 6, 1),
(29, 7, 1),
(30, 4, 1),
(30, 5, 1),
(30, 6, 1),
(30, 7, 1),
(31, 4, 1),
(31, 5, 1),
(31, 6, 1),
(31, 7, 1),
(32, 4, 1),
(32, 5, 1),
(32, 6, 1),
(32, 7, 1),
(33, 4, 1),
(33, 5, 1),
(33, 6, 1),
(33, 7, 1),
(34, 4, 1),
(34, 5, 1),
(34, 6, 1),
(34, 7, 1),
(35, 4, 1),
(35, 5, 1),
(35, 6, 1),
(35, 7, 1),
(36, 4, 1),
(36, 5, 1),
(36, 6, 1),
(36, 7, 1),
(37, 8, 1),
(37, 9, 1),
(37, 10, 1),
(38, 8, 1),
(38, 9, 1),
(38, 10, 1),
(39, 8, 1),
(39, 9, 1),
(39, 10, 1),
(40, 8, 1),
(40, 9, 1),
(40, 10, 1),
(41, 8, 1),
(41, 9, 1),
(41, 10, 1),
(42, 8, 1),
(42, 9, 1),
(42, 10, 1),
(43, 8, 1),
(43, 9, 1),
(43, 10, 1),
(44, 8, 1),
(44, 9, 1),
(44, 10, 1),
(45, 8, 1),
(45, 9, 1),
(45, 10, 1),
(46, 8, 1),
(46, 9, 1),
(46, 10, 1),
(47, 8, 1),
(47, 9, 1),
(47, 10, 1),
(48, 8, 1),
(48, 9, 1),
(48, 10, 1),
(49, 8, 1),
(49, 9, 1),
(49, 10, 1),
(50, 8, 1),
(50, 9, 1),
(50, 10, 1),
(51, 8, 1),
(51, 9, 1),
(51, 10, 1),
(52, 8, 1),
(52, 9, 1),
(52, 10, 1),
(53, 8, 1),
(53, 9, 1),
(53, 10, 1),
(54, 8, 1),
(54, 9, 1),
(54, 10, 1);

-- --------------------------------------------------------

--
-- Table structure for table `Services`
--

CREATE TABLE `Services` (
  `service_id` int(11) NOT NULL,
  `landlord_id` int(11) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `service_description` text,
  `service_price` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Services`
--

INSERT INTO `Services` (`service_id`, `landlord_id`, `service_name`, `service_description`, `service_price`, `is_active`) VALUES
(1, 2, 'Internet', 'Dịch vụ Internet tốc độ cao cho mỗi phòng', '200000.00', 1),
(2, 2, 'Giặt là', 'Dịch vụ giặt ủi cho khách thuê phòng', '100000.00', 1),
(3, 2, 'Bảo vệ', 'Dịch vụ bảo vệ 24/7 cho khu nhà trọ', '300000.00', 1),
(4, 3, 'Dọn vệ sinh', 'Dịch vụ dọn dẹp phòng định kỳ', '150000.00', 1),
(5, 3, 'Cáp truyền hình', 'Dịch vụ cáp truyền hình cho mỗi phòng', '180000.00', 1),
(6, 3, 'Máy lạnh', 'Dịch vụ thuê máy lạnh riêng cho phòng', '500000.00', 1),
(7, 3, 'Giữ xe', 'Dịch vụ giữ xe cho cư dân', '100000.00', 1),
(8, 4, 'Sửa chữa', 'Dịch vụ sửa chữa trong phòng', '250000.00', 1),
(9, 4, 'Điện thoại', 'Dịch vụ điện thoại nội bộ', '30000.00', 1),
(10, 4, 'Cà phê', 'Dịch vụ cà phê cho các phòng VIP', '50000.00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `role` enum('Admin','Landlord','Renter') NOT NULL,
  `address` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`user_id`, `username`, `password_hash`, `email`, `phone`, `role`, `address`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'admin', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'admin@gmail.com', '0912345678', 'Admin', 'Số 10, Đường Nguyễn Thị Minh Khai, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1),
(2, 'ngoc', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'ngoc@gmail.com', '0912345679', 'Landlord', 'Số 123, Đường Lê Quang Đạo, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1),
(3, 'thao', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'thao@gmail.com', '0912345680', 'Landlord', 'Số 456, Đường Nguyễn Huệ, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1),
(4, 'minh', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'minh@gmail.com', '0912345690', 'Landlord', 'Số 789, Đường Lê Lợi, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1),
(5, 'tuan', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'tuan@gmail.com', '0932123456', 'Renter', 'Số 15, Đường Nguyễn Thiện Thuật, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1),
(6, 'linh', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'linh@gmail.com', '0932123457', 'Renter', 'Số 20, Đường Nguyễn Văn Cừ, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1),
(7, 'hoang', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'hoang@gmail.com', '0932123458', 'Renter', 'Số 100, Đường Quang Trung, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1),
(8, 'hong', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'hong@gmail.com', '0912345671', 'Renter', 'Số 88, Đường Hoàng Văn Thụ, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1),
(9, 'khai', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'khai@gmail.com', '0912345672', 'Renter', 'Số 99, Đường Nguyễn Trãi, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1),
(10, 'lan', '$2b$12$n4uiS1KYzZDrr0lDwuSjGOQ06Xxr0Hfu6v.OGHz1xcgP7HcTVR/cy', 'lan@gmail.com', '0932123459', 'Renter', 'Số 101, Đường Lê Văn Sỹ, TP.HCM', '2025-05-24 12:54:55', '2025-05-24 12:54:55', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Contracts`
--
ALTER TABLE `Contracts`
  ADD PRIMARY KEY (`contract_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `renter_id` (`renter_id`);

--
-- Indexes for table `Properties`
--
ALTER TABLE `Properties`
  ADD PRIMARY KEY (`property_id`),
  ADD KEY `landlord_id` (`landlord_id`);

--
-- Indexes for table `Rooms`
--
ALTER TABLE `Rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `RoomTypes`
--
ALTER TABLE `RoomTypes`
  ADD PRIMARY KEY (`room_type_id`),
  ADD KEY `landlord_id` (`landlord_id`);

--
-- Indexes for table `Room_Renters`
--
ALTER TABLE `Room_Renters`
  ADD PRIMARY KEY (`room_renter_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `renter_id` (`renter_id`);

--
-- Indexes for table `Room_Services`
--
ALTER TABLE `Room_Services`
  ADD PRIMARY KEY (`room_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `Services`
--
ALTER TABLE `Services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `landlord_id` (`landlord_id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Contracts`
--
ALTER TABLE `Contracts`
  MODIFY `contract_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `Properties`
--
ALTER TABLE `Properties`
  MODIFY `property_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Rooms`
--
ALTER TABLE `Rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `RoomTypes`
--
ALTER TABLE `RoomTypes`
  MODIFY `room_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Room_Renters`
--
ALTER TABLE `Room_Renters`
  MODIFY `room_renter_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `Services`
--
ALTER TABLE `Services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Contracts`
--
ALTER TABLE `Contracts`
  ADD CONSTRAINT `Contracts_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`room_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Contracts_ibfk_2` FOREIGN KEY (`renter_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `Properties`
--
ALTER TABLE `Properties`
  ADD CONSTRAINT `Properties_ibfk_1` FOREIGN KEY (`landlord_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `Rooms`
--
ALTER TABLE `Rooms`
  ADD CONSTRAINT `Rooms_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Rooms_ibfk_2` FOREIGN KEY (`room_type_id`) REFERENCES `RoomTypes` (`room_type_id`);

--
-- Constraints for table `RoomTypes`
--
ALTER TABLE `RoomTypes`
  ADD CONSTRAINT `RoomTypes_ibfk_1` FOREIGN KEY (`landlord_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `Room_Renters`
--
ALTER TABLE `Room_Renters`
  ADD CONSTRAINT `Room_Renters_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`room_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Room_Renters_ibfk_2` FOREIGN KEY (`renter_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `Room_Services`
--
ALTER TABLE `Room_Services`
  ADD CONSTRAINT `Room_Services_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`room_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Room_Services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `Services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `Services`
--
ALTER TABLE `Services`
  ADD CONSTRAINT `Services_ibfk_1` FOREIGN KEY (`landlord_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
