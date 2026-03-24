-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 18, 2026 at 07:34 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `map2home`
--

-- --------------------------------------------------------

--
-- Table structure for table `cost_estimates`
--

CREATE TABLE `cost_estimates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plot_length` decimal(10,2) DEFAULT NULL,
  `plot_width` decimal(10,2) DEFAULT NULL,
  `plot_area_sqm` decimal(10,2) DEFAULT NULL,
  `covered_area_sqm` decimal(10,2) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `floors` int(11) DEFAULT NULL,
  `quality` varchar(50) DEFAULT NULL,
  `basement` varchar(50) DEFAULT NULL,
  `rooms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rooms`)),
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `total_cost` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cost_estimates`
--

INSERT INTO `cost_estimates` (`id`, `user_id`, `plot_length`, `plot_width`, `plot_area_sqm`, `covered_area_sqm`, `location`, `floors`, `quality`, `basement`, `rooms`, `features`, `total_cost`, `created_at`) VALUES
(1, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 7195569.00, '2025-11-30 13:00:41'),
(2, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":false,\"plumbing\":false,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 7475314.00, '2025-11-30 13:10:15'),
(3, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":false,\"plumbing\":false,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 6895314.00, '2025-11-30 13:12:21'),
(4, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":false,\"plumbing\":false,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 8813596.00, '2025-11-30 13:16:35'),
(5, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 9178191.00, '2025-11-30 13:24:17'),
(6, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 10636575.00, '2025-11-30 13:25:01'),
(7, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 9178191.00, '2025-11-30 13:26:11'),
(8, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 5, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 21100479.00, '2025-11-30 13:27:17'),
(9, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 9178191.00, '2025-11-30 13:28:58'),
(10, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 5204096.00, '2025-11-30 13:29:18'),
(11, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 5311445.00, '2025-11-30 13:39:38'),
(12, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 9295668.00, '2025-11-30 13:40:26'),
(13, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 4962040.00, '2025-11-30 13:45:33'),
(14, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 7441749.00, '2025-11-30 13:46:13'),
(15, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 5119474.00, '2025-11-30 13:47:23'),
(16, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":3,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 4953619.00, '2025-11-30 13:54:01'),
(17, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":3,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":false,\"plumbing\":false,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 7339140.00, '2025-11-30 13:56:45'),
(18, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":3,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":false,\"plumbing\":false,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 4953619.00, '2025-11-30 13:58:52'),
(19, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 8441704.00, '2025-11-30 14:11:35'),
(20, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 6592848.00, '2025-11-30 14:16:07'),
(21, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 7622922.00, '2025-11-30 14:16:53'),
(22, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 7622922.00, '2025-11-30 14:17:33'),
(23, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 8333084.00, '2025-11-30 14:32:00'),
(24, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'economy', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 6872472.00, '2025-11-30 14:32:15'),
(25, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'luxury', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 10284146.00, '2025-11-30 14:32:28'),
(26, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 2, 'luxury', 'no', '{\"bedrooms\":4,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 10284146.00, '2025-11-30 14:32:31'),
(27, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":2,\"bathrooms\":3,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 3353924.00, '2025-11-30 14:37:59'),
(28, 65, 30.00, 45.00, 125.42, 106.61, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":2,\"bathrooms\":3,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 4125820.00, '2025-11-30 14:40:24'),
(29, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 7652174.00, '2025-11-30 17:01:50'),
(30, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 9316835.00, '2025-11-30 17:02:15'),
(31, 65, 45.00, 50.00, 209.03, 209.03, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 14913254.00, '2025-11-30 17:36:28'),
(32, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 3, 'standard', 'partial', '{\"bedrooms\":6,\"bathrooms\":8,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":1}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 14484975.00, '2025-12-01 08:53:12'),
(33, 65, 30.00, 45.00, 125.42, 87.79, 'lahore', 2, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 5744268.00, '2025-12-06 11:14:32'),
(34, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 3808904.00, '2025-12-06 11:46:16'),
(35, 65, 50.00, 30.00, 139.35, 97.54, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 3008316.00, '2025-12-06 13:24:37'),
(36, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 7525942.00, '2025-12-06 13:25:26'),
(37, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 9085879.00, '2025-12-06 13:34:34'),
(38, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2584541.00, '2025-12-06 13:35:08'),
(39, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 3767970.00, '2025-12-06 13:51:01'),
(40, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 13:54:25'),
(41, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 13:58:23'),
(42, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 13:58:38'),
(43, 65, 30.00, 45.00, 125.42, 87.79, 'lahore', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2998301.00, '2025-12-06 13:58:49'),
(44, 65, 30.00, 45.00, 125.42, 87.79, 'islamabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 3254761.00, '2025-12-06 13:59:00'),
(45, 65, 30.00, 45.00, 125.42, 125.42, 'multan', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 3658581.00, '2025-12-06 14:03:23'),
(46, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 7540942.00, '2025-12-06 14:26:20'),
(47, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 14:34:32'),
(48, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 15:08:58'),
(49, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 15:09:17'),
(50, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 15:21:39'),
(51, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 15:26:10'),
(52, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 15:30:32'),
(53, 65, 30.00, 45.00, 125.42, 87.79, 'multan', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2666006.00, '2025-12-06 15:30:44'),
(54, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 17:05:25'),
(55, 65, 30.00, 45.00, 125.42, 87.79, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 2742580.00, '2025-12-06 17:07:16'),
(56, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":19,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 4343055.00, '2025-12-08 10:14:29'),
(57, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 7731109.00, '2025-12-08 10:15:23'),
(58, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 9762913.00, '2025-12-08 10:15:51'),
(59, 65, 300.00, 450.00, 12541.91, 8779.34, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":3,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 246262082.00, '2025-12-09 18:28:43'),
(60, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":8,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 7881109.00, '2025-12-09 19:24:52'),
(61, 65, 45.00, 50.00, 209.03, 209.03, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":8,\"bathrooms\":10,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":1}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 12814996.00, '2025-12-09 19:38:34'),
(62, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":4,\"bathrooms\":6,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":true,\"gate\":true}', 9782913.00, '2025-12-11 22:07:12'),
(63, 65, 40.00, 48.00, 178.37, 178.37, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":7,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":2,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 13597519.00, '2025-12-13 15:36:34'),
(64, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 1, 'economy', 'no', '{\"bedrooms\":1,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":true,\"paint\":true,\"landscaping\":false,\"boundaryWall\":false,\"gate\":true}', 3887342.00, '2025-12-20 02:22:29'),
(65, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 1, 'economy', 'no', '{\"bedrooms\":1,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 3237716.00, '2025-12-20 02:23:19'),
(66, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 1, 'economy', 'no', '{\"bedrooms\":1,\"bathrooms\":2,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 3995927.00, '2025-12-20 02:23:40'),
(67, 65, 30.00, 45.00, 125.42, 125.42, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 9762912.00, '2025-12-20 02:27:19'),
(68, 65, 30.00, 45.00, 125.42, 125.42, 'islamabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 10358185.00, '2025-12-20 02:28:05'),
(69, 65, 30.00, 45.00, 125.42, 125.42, 'lahore', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":5,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 10058944.00, '2025-12-20 02:28:23'),
(70, 65, 30.00, 45.00, 125.42, 125.42, 'lahore', 2, 'luxury', 'no', '{\"bedrooms\":5,\"bathrooms\":7,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 12591120.00, '2025-12-20 17:12:26'),
(71, 65, 70.00, 77.00, 500.75, 500.75, 'lahore', 3, 'standard', 'full', '{\"bedrooms\":15,\"bathrooms\":10,\"kitchen\":3,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":1}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":true,\"tiles\":true,\"paint\":true,\"landscaping\":true,\"boundaryWall\":true,\"gate\":true}', 54856566.00, '2025-12-20 17:16:16'),
(72, 108, 50.00, 27.00, 125.42, 125.42, 'faisalabad', 3, 'luxury', 'no', '{\"bedrooms\":6,\"bathrooms\":4,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 13154447.00, '2026-01-10 16:37:36'),
(73, 110, 30.00, 45.00, 125.42, 112.88, 'faisalabad', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":6,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 17855624.00, '2026-02-01 14:31:41'),
(74, 110, 30.00, 45.00, 125.42, 125.42, 'lahore', 2, 'standard', 'no', '{\"bedrooms\":5,\"bathrooms\":6,\"kitchen\":2,\"drawingRoom\":1,\"diningRoom\":2,\"storeRoom\":0,\"garage\":1,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 7496744.00, '2026-02-01 14:40:44'),
(75, 125, 30.00, 50.00, 139.35, 139.35, 'faisalabad', 1, 'standard', 'no', '{\"bedrooms\":2,\"bathrooms\":5,\"kitchen\":1,\"drawingRoom\":1,\"diningRoom\":1,\"storeRoom\":1,\"garage\":0,\"servantQuarter\":0}', '{\"electrical\":true,\"plumbing\":true,\"hvac\":false,\"tiles\":false,\"paint\":false,\"landscaping\":false,\"boundaryWall\":false,\"gate\":false}', 11067264.00, '2026-02-16 23:53:53');

-- --------------------------------------------------------

--
-- Table structure for table `email_tokens`
--

CREATE TABLE `email_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_tokens`
--

INSERT INTO `email_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(1, 8, '60c6f2e1014ad7d6a782595478f8ec8f4275cdb673b1be7ef2d9d7170e7dca0a', '2025-11-18 12:59:36', '2025-11-17 12:59:36'),
(2, 9, 'e02bbef3817ae91642b16929a36705c4bc2fe0c2a5c1c5c039e6bad6249b0710', '2025-11-18 13:00:16', '2025-11-17 13:00:16'),
(3, 12, '5c484f4ca595f611340a4b1e9f97362cc4f2943ebb984ab4bc3c55af6d7eab29', '2025-11-19 06:12:23', '2025-11-18 06:12:23'),
(4, 23, '6f7286b019e7ce353439cb53c038d4cee5ab631dafdd62ffeb82fd8eff713c4f', '2025-11-19 16:10:59', '2025-11-18 16:10:59'),
(5, 26, 'cd3dc362ef46af2cc709f0bd9de835ed1dd87f6e35090cf9f29e4e4ece7d2dd4', '2025-11-20 13:33:16', '2025-11-19 13:33:16'),
(8, 65, '033a7194ba632f7f7dc45066ae9cd9b3d2757c82a43d7954a50a1904b0a21e4a', '2025-12-01 11:40:11', '2025-11-30 11:40:11'),
(9, 66, 'aea1706876eb8c96c88f678c4b386ec34673daf895c8aec4cf1e6f130c56b80a', '2025-12-01 11:44:01', '2025-11-30 11:44:01'),
(10, 108, '9c1da480c006aaf217e8d58901746a6f5a176f63c3a25afc0592ee4628caa82c', '2026-01-11 16:31:47', '2026-01-10 16:31:47');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `COMMENT` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `user_id`, `rating`, `COMMENT`, `created_at`, `updated_at`) VALUES
(1, 29, 4, 'Good experience', '2025-11-19 15:01:58', '2025-11-19 15:01:58'),
(2, 12, 4, 'User Friendly', '2025-11-20 06:26:38', '2025-11-20 06:26:38'),
(3, 65, 4, 'Thats really amazing. crazy man!!!! dam!!!', '2026-03-03 00:56:53', '2026-03-03 00:56:53');

-- --------------------------------------------------------

--
-- Table structure for table `maps`
--

CREATE TABLE `maps` (
  `id` int(11) NOT NULL,
  `room_type` varchar(50) DEFAULT 'house',
  `title` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `length_ft` decimal(10,2) DEFAULT NULL,
  `width_ft` decimal(10,2) DEFAULT NULL,
  `no_of_bedrooms` int(11) DEFAULT 0,
  `no_of_kitchens` int(11) DEFAULT 0,
  `no_of_bathrooms` int(11) DEFAULT 0,
  `no_of_tv_lounges` int(11) DEFAULT 0,
  `no_of_drawing_rooms` int(11) DEFAULT 0,
  `no_of_dining_rooms` int(11) DEFAULT 0,
  `no_of_store_rooms` int(11) DEFAULT 0,
  `no_of_garages` int(11) DEFAULT 0,
  `no_of_servant_quarters` int(11) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `bedrooms` int(11) NOT NULL DEFAULT 0,
  `bathrooms` int(11) NOT NULL DEFAULT 0,
  `kitchen` int(11) NOT NULL DEFAULT 0,
  `drawing_room` int(11) NOT NULL DEFAULT 0,
  `dining_room` int(11) NOT NULL DEFAULT 0,
  `store_room` int(11) NOT NULL DEFAULT 0,
  `garage` int(11) NOT NULL DEFAULT 0,
  `servant_quarter` int(11) NOT NULL DEFAULT 0,
  `tv_lounge` int(11) NOT NULL DEFAULT 0,
  `plot_length` decimal(10,2) DEFAULT NULL,
  `plot_width` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `maps`
--

INSERT INTO `maps` (`id`, `room_type`, `title`, `file_path`, `description`, `length_ft`, `width_ft`, `no_of_bedrooms`, `no_of_kitchens`, `no_of_bathrooms`, `no_of_tv_lounges`, `no_of_drawing_rooms`, `no_of_dining_rooms`, `no_of_store_rooms`, `no_of_garages`, `no_of_servant_quarters`, `created_by`, `is_active`, `created_at`, `updated_at`, `bedrooms`, `bathrooms`, `kitchen`, `drawing_room`, `dining_room`, `store_room`, `garage`, `servant_quarter`, `tv_lounge`, `plot_length`, `plot_width`) VALUES
(19, 'house', '30', '1772666205604-simple_house_plan_dwg.dxf', '30', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 1, '2026-03-04 23:16:45', '2026-03-04 23:16:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL),
(20, 'house', '20', '1772674219905-call-center-offices.dxf', '20', NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 1, '2026-03-05 01:30:19', '2026-03-05 01:30:19', 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL),
(21, 'house', '5 marla', '1772693805333-House_Plan_30x45_Ground_and_1St_Floor.dxf', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 1, '2026-03-05 06:56:45', '2026-03-05 06:56:45', 0, 0, 0, 0, 0, 0, 0, 0, 0, 30.00, 45.00);

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `category` enum('construction','finishing','other') DEFAULT 'construction',
  `cost_per_unit` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT 'sqm',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `source_url` varchar(255) DEFAULT NULL,
  `last_scraped_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `NAME`, `category`, `cost_per_unit`, `unit`, `description`, `is_active`, `created_at`, `updated_at`, `updated_by`, `source_url`, `last_scraped_at`) VALUES
(1, 'Concrete', 'construction', 1200.00, 'sqm', 'High-quality concrete for construction', 0, '2025-11-19 16:13:37', '2025-12-06 12:25:01', NULL, NULL, NULL),
(2, 'Asphalt', 'construction', 1000.00, 'sqm', 'Standard asphalt material', 0, '2025-11-19 16:13:37', '2025-12-06 12:25:01', NULL, NULL, NULL),
(3, 'Stone', 'construction', 1500.00, 'sqm', 'Natural stone material', 0, '2025-11-19 16:13:37', '2025-12-06 12:25:02', NULL, NULL, NULL),
(4, 'Gravel', 'construction', 8700.00, 'truck', 'Crush/Bajri for construction', 1, '2025-11-19 16:13:37', '2026-03-16 00:50:55', NULL, 'https://costzone.org/sand-and-crush-rates-in-pakistan', '2026-03-16 00:50:55'),
(5, 'Mixed Material', 'construction', 1100.00, 'sqm', 'Mixed construction materials', 0, '2025-11-19 16:13:37', '2025-12-06 12:25:02', NULL, NULL, NULL),
(6, 'Paint', 'finishing', 2311.00, 'liter', 'Paint (Berger, Nippon, Dulux, etc.)', 1, '2025-11-19 16:13:37', '2026-03-16 00:50:55', NULL, 'https://costzone.org/paint-price-in-pakistan', '2026-03-16 00:50:55'),
(7, 'Tiles', 'finishing', 1875.00, 'sqm', 'Ceramic tiles', 1, '2025-11-19 16:13:37', '2026-03-16 00:50:55', NULL, 'https://costzone.org/tiles-prices-in-pakistan', '2026-03-16 00:50:55'),
(8, 'Wood', 'finishing', 800.00, 'sqm', 'Quality wood finishing', 0, '2025-11-19 16:13:37', '2025-12-06 12:25:02', NULL, NULL, NULL),
(9, 'Steel', 'construction', 250000.00, 'ton', 'Steel bars/Sariya for reinforcement', 1, '2025-11-19 16:13:37', '2026-03-16 00:50:55', NULL, 'fallback (costzone.org market rates)', '2026-03-16 00:50:55'),
(10, 'Cement', 'construction', 1205.00, 'bag', 'Cement (Maple Leaf, DG, Bestway, etc.)', 1, '2025-11-19 16:13:37', '2026-03-16 00:50:55', NULL, 'https://costzone.org/cement-prices-in-pakistan', '2026-03-16 00:50:55'),
(11, 'Sand', 'construction', 10440.00, 'truck', 'Sand/Rait for construction', 1, '2025-12-06 12:02:09', '2026-03-16 00:50:55', NULL, 'https://costzone.org/sand-rait-price-in-pakistan', '2026-03-16 00:50:55'),
(12, 'Bricks', 'construction', 17.00, 'piece', 'Red bricks/Clay bricks', 1, '2025-12-06 12:02:09', '2026-03-16 00:50:55', NULL, 'https://costzone.org/bricks-prices-in-pakistan', '2026-03-16 00:50:55'),
(13, 'Aluminum', 'construction', 1200.00, 'sqft', 'Scraped from fallback (costzone.org market rates)', 1, '2026-02-01 14:29:02', '2026-03-04 23:08:26', NULL, 'fallback (costzone.org market rates)', '2026-03-04 23:08:26'),
(14, 'Glass', 'finishing', 200.00, 'sqft', 'Scraped from fallback (costzone.org market rates)', 1, '2026-02-01 14:29:02', '2026-03-04 23:08:26', NULL, 'fallback (costzone.org market rates)', '2026-03-04 23:08:26'),
(15, 'Electrical Wire', 'construction', 6000.00, 'coil', 'Scraped from fallback (costzone.org market rates)', 1, '2026-02-01 14:29:02', '2026-03-04 23:08:26', NULL, 'fallback (costzone.org market rates)', '2026-03-04 23:08:26'),
(16, 'Plumbing Pipe', 'construction', 500.00, 'piece', 'Scraped from fallback (costzone.org market rates)', 1, '2026-02-01 14:29:02', '2026-03-04 23:08:26', NULL, 'fallback (costzone.org market rates)', '2026-03-04 23:08:26');

-- --------------------------------------------------------

--
-- Table structure for table `reset_tokens`
--

CREATE TABLE `reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reset_tokens`
--

INSERT INTO `reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(1, 12, '5ee2fb271e7de1a8328faed41a266000c702ef42c9f0450a5462672ef33219b6', '2025-11-19 16:28:09', '2025-11-18 16:28:09'),
(2, 65, '945676ce6a9f892c979d25b0b88472b3abeb51efc1d01be94cf1c45a197e6844', '2025-12-10 18:26:51', '2025-12-09 18:26:51'),
(4, 65, '1bb7d7ef6dee57f18d4fce44484d0ae88e2a2bd4da15c45719b1f479bb90906b', '2026-02-26 21:02:55', '2026-02-25 21:02:55');

-- --------------------------------------------------------

--
-- Table structure for table `scraping_logs`
--

CREATE TABLE `scraping_logs` (
  `id` int(11) NOT NULL,
  `status` enum('success','error','partial') NOT NULL,
  `materials_updated` int(11) DEFAULT 0,
  `materials_inserted` int(11) DEFAULT 0,
  `total_materials` int(11) DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `execution_time_ms` int(11) DEFAULT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `triggered_by` enum('cron','manual','startup') DEFAULT 'cron',
  `triggered_by_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `scraping_logs`
--

INSERT INTO `scraping_logs` (`id`, `status`, `materials_updated`, `materials_inserted`, `total_materials`, `error_message`, `execution_time_ms`, `started_at`, `completed_at`, `triggered_by`, `triggered_by_user_id`) VALUES
(1, 'success', 7, 0, 7, NULL, 33127, '2025-12-09 20:06:58', '2025-12-09 20:07:31', 'startup', NULL),
(2, 'success', 7, 0, 7, NULL, 32198, '2025-12-09 20:08:51', '2025-12-09 20:09:24', 'manual', 86),
(3, 'success', 7, 0, 7, NULL, 34119, '2025-12-09 20:10:00', '2025-12-09 20:10:34', 'cron', NULL),
(4, 'success', 7, 0, 7, NULL, 36525, '2025-12-09 20:11:38', '2025-12-09 20:12:14', 'manual', 86),
(5, 'success', 7, 0, 7, NULL, 33741, '2025-12-09 20:15:00', '2025-12-09 20:15:33', 'cron', NULL),
(6, 'success', 7, 0, 7, NULL, 31910, '2025-12-09 20:19:03', '2025-12-09 20:19:35', 'startup', NULL),
(7, 'success', 7, 0, 7, NULL, 32958, '2025-12-09 20:20:00', '2025-12-09 20:20:33', 'cron', NULL),
(8, 'success', 7, 0, 7, NULL, 32731, '2025-12-09 20:20:49', '2025-12-09 20:21:22', 'manual', 86),
(9, 'success', 7, 0, 7, NULL, 36633, '2025-12-09 20:25:00', '2025-12-09 20:25:36', 'cron', NULL),
(10, 'success', 7, 0, 7, NULL, 32449, '2025-12-09 20:26:18', '2025-12-09 20:26:50', 'manual', 86),
(11, 'success', 7, 0, 7, NULL, 33420, '2025-12-09 20:30:00', '2025-12-09 20:30:33', 'cron', NULL),
(12, 'success', 7, 0, 7, NULL, 33531, '2025-12-09 20:32:17', '2025-12-09 20:32:51', 'startup', NULL),
(13, 'success', 7, 0, 7, NULL, 33354, '2025-12-09 20:33:58', '2025-12-09 20:34:32', 'startup', NULL),
(14, 'success', 7, 0, 7, NULL, 32979, '2025-12-09 20:34:44', '2025-12-09 20:35:17', 'manual', 86),
(15, 'success', 7, 0, 7, NULL, 35090, '2025-12-11 22:01:56', '2025-12-11 22:02:31', 'startup', NULL),
(16, 'success', 7, 0, 7, NULL, 33393, '2025-12-11 22:05:00', '2025-12-11 22:05:33', 'cron', NULL),
(17, 'success', 7, 0, 7, NULL, 32630, '2025-12-11 22:10:00', '2025-12-11 22:10:32', 'cron', NULL),
(18, 'success', 0, 0, 0, NULL, NULL, '2025-12-11 22:15:00', '2025-12-11 22:15:00', 'cron', NULL),
(19, 'success', 7, 0, 7, NULL, 50874, '2025-12-13 15:32:28', '2025-12-13 15:33:19', 'startup', NULL),
(20, 'success', 7, 0, 7, NULL, 34080, '2025-12-13 15:35:00', '2025-12-13 15:35:34', 'cron', NULL),
(21, 'success', 7, 0, 7, NULL, 31589, '2025-12-13 15:40:00', '2025-12-13 15:40:31', 'cron', NULL),
(22, 'success', 7, 0, 7, NULL, 60559, '2025-12-20 02:19:44', '2025-12-20 02:20:44', 'startup', NULL),
(23, 'success', 7, 0, 7, NULL, 40092, '2025-12-20 02:25:00', '2025-12-20 02:25:40', 'cron', NULL),
(24, 'success', 7, 0, 7, NULL, 51071, '2025-12-20 17:05:02', '2025-12-20 17:05:53', 'startup', NULL),
(25, 'success', 7, 0, 7, NULL, 62716, '2025-12-20 17:10:00', '2025-12-20 17:11:02', 'cron', NULL),
(26, 'success', 7, 0, 7, NULL, 47464, '2025-12-20 17:15:00', '2025-12-20 17:15:47', 'cron', NULL),
(27, 'success', 7, 0, 7, NULL, 69858, '2026-01-10 16:29:51', '2026-01-10 16:31:01', 'startup', NULL),
(28, 'success', 7, 0, 7, NULL, 44218, '2026-01-10 16:35:00', '2026-01-10 16:35:44', 'cron', NULL),
(29, 'success', 7, 0, 7, NULL, 42311, '2026-01-10 16:40:00', '2026-01-10 16:40:42', 'cron', NULL),
(30, 'success', 7, 0, 7, NULL, 51782, '2026-01-10 16:45:00', '2026-01-10 16:45:51', 'cron', NULL),
(31, 'success', 7, 0, 7, NULL, 46894, '2026-01-10 16:50:00', '2026-01-10 16:50:46', 'cron', NULL),
(32, 'success', 7, 0, 7, NULL, 48807, '2026-01-10 16:55:00', '2026-01-10 16:55:48', 'cron', NULL),
(33, 'success', 7, 0, 7, NULL, 41606, '2026-01-10 17:00:00', '2026-01-10 17:00:41', 'cron', NULL),
(34, 'success', 7, 0, 7, NULL, 53460, '2026-01-10 17:05:00', '2026-01-10 17:05:53', 'cron', NULL),
(35, 'success', 7, 0, 7, NULL, 39851, '2026-02-01 13:57:11', '2026-02-01 13:57:50', 'startup', NULL),
(36, 'success', 7, 0, 7, NULL, 53101, '2026-02-01 14:00:00', '2026-02-01 14:00:53', 'cron', NULL),
(37, 'success', 7, 0, 7, NULL, 45353, '2026-02-01 14:05:00', '2026-02-01 14:05:45', 'cron', NULL),
(38, 'success', 7, 0, 7, NULL, 45258, '2026-02-01 14:10:00', '2026-02-01 14:10:45', 'cron', NULL),
(39, 'success', 7, 0, 7, NULL, 51606, '2026-02-01 14:15:00', '2026-02-01 14:15:51', 'cron', NULL),
(40, 'success', 7, 0, 7, NULL, 43405, '2026-02-01 14:20:00', '2026-02-01 14:20:43', 'cron', NULL),
(41, 'success', 7, 0, 7, NULL, 20964, '2026-02-01 14:21:28', '2026-02-01 14:21:49', 'startup', NULL),
(42, 'success', 7, 0, 7, NULL, 14091, '2026-02-01 14:25:00', '2026-02-01 14:25:14', 'cron', NULL),
(43, 'success', 7, 4, 11, NULL, 13752, '2026-02-01 14:28:48', '2026-02-01 14:29:02', 'startup', NULL),
(44, 'success', 11, 0, 11, NULL, 103221, '2026-02-01 14:30:00', '2026-02-01 14:31:43', 'cron', NULL),
(45, 'success', 11, 0, 11, NULL, 14330, '2026-02-01 14:35:00', '2026-02-01 14:35:14', 'cron', NULL),
(46, 'success', 11, 0, 11, NULL, 93493, '2026-02-01 14:39:35', '2026-02-01 14:41:09', 'startup', NULL),
(47, 'success', 11, 0, 11, NULL, 51290, '2026-02-01 14:45:00', '2026-02-01 14:45:51', 'cron', NULL),
(48, 'success', 11, 0, 11, NULL, 14349, '2026-02-01 14:50:00', '2026-02-01 14:50:14', 'cron', NULL),
(49, 'success', 11, 0, 11, NULL, 17756, '2026-02-01 14:55:00', '2026-02-01 14:55:17', 'cron', NULL),
(50, 'success', 11, 0, 11, NULL, 15075, '2026-02-01 15:00:00', '2026-02-01 15:00:15', 'cron', NULL),
(51, 'success', 11, 0, 11, NULL, 13901, '2026-02-01 15:05:00', '2026-02-01 15:05:13', 'cron', NULL),
(52, 'success', 11, 0, 11, NULL, 18921, '2026-02-02 16:20:54', '2026-02-02 16:21:13', 'startup', NULL),
(53, 'success', 11, 0, 11, NULL, 13885, '2026-02-02 16:24:57', '2026-02-02 16:25:11', 'startup', NULL),
(54, 'success', 11, 0, 11, NULL, 13882, '2026-02-02 16:30:00', '2026-02-02 16:30:13', 'cron', NULL),
(55, 'success', 11, 0, 11, NULL, 13339, '2026-02-02 16:35:00', '2026-02-02 16:35:13', 'cron', NULL),
(56, 'success', 11, 0, 11, NULL, 13301, '2026-02-02 16:38:54', '2026-02-02 16:39:07', 'startup', NULL),
(57, 'success', 11, 0, 11, NULL, 14021, '2026-02-02 16:40:00', '2026-02-02 16:40:14', 'cron', NULL),
(58, 'success', 11, 0, 11, NULL, 13507, '2026-02-02 16:45:00', '2026-02-02 16:45:13', 'cron', NULL),
(59, 'success', 11, 0, 11, NULL, 14463, '2026-02-02 16:50:00', '2026-02-02 16:50:14', 'cron', NULL),
(60, 'success', 11, 0, 11, NULL, 14354, '2026-02-02 16:55:00', '2026-02-02 16:55:14', 'cron', NULL),
(61, 'success', 11, 0, 11, NULL, 17850, '2026-02-02 17:00:00', '2026-02-02 17:00:18', 'startup', NULL),
(62, 'success', 11, 0, 11, NULL, 16581, '2026-02-02 17:05:00', '2026-02-02 17:05:16', 'cron', NULL),
(63, 'success', 11, 0, 11, NULL, 16660, '2026-02-02 17:10:00', '2026-02-02 17:10:16', 'cron', NULL),
(64, 'success', 11, 0, 11, NULL, 14474, '2026-02-02 17:15:00', '2026-02-02 17:15:14', 'cron', NULL),
(65, 'success', 11, 0, 11, NULL, 14014, '2026-02-02 17:20:00', '2026-02-02 17:20:14', 'cron', NULL),
(66, 'success', 11, 0, 11, NULL, 15798, '2026-02-02 17:25:00', '2026-02-02 17:25:15', 'cron', NULL),
(67, 'success', 11, 0, 11, NULL, 13749, '2026-02-02 17:28:53', '2026-02-02 17:29:07', 'startup', NULL),
(68, 'success', 11, 0, 11, NULL, 14193, '2026-02-02 17:30:00', '2026-02-02 17:30:14', 'cron', NULL),
(69, 'success', 11, 0, 11, NULL, 13370, '2026-02-02 17:35:00', '2026-02-02 17:35:13', 'cron', NULL),
(70, 'success', 11, 0, 11, NULL, 13580, '2026-02-02 17:40:00', '2026-02-02 17:40:13', 'cron', NULL),
(71, 'success', 11, 0, 11, NULL, 13388, '2026-02-02 17:45:00', '2026-02-02 17:45:13', 'cron', NULL),
(72, 'success', 11, 0, 11, NULL, 13111, '2026-02-02 17:50:00', '2026-02-02 17:50:13', 'cron', NULL),
(73, 'success', 11, 0, 11, NULL, 13841, '2026-02-02 17:54:42', '2026-02-02 17:54:56', 'startup', NULL),
(74, 'success', 11, 0, 11, NULL, 14096, '2026-02-02 17:55:00', '2026-02-02 17:55:14', 'cron', NULL),
(75, 'success', 11, 0, 11, NULL, 13585, '2026-02-02 18:00:00', '2026-02-02 18:00:13', 'cron', NULL),
(76, 'success', 11, 0, 11, NULL, 13173, '2026-02-02 18:05:00', '2026-02-02 18:05:13', 'cron', NULL),
(77, 'success', 11, 0, 11, NULL, 13129, '2026-02-02 18:10:00', '2026-02-02 18:10:13', 'cron', NULL),
(78, 'success', 11, 0, 11, NULL, 13428, '2026-02-02 18:15:00', '2026-02-02 18:15:13', 'cron', NULL),
(79, 'success', 11, 0, 11, NULL, 13213, '2026-02-02 18:20:00', '2026-02-02 18:20:13', 'cron', NULL),
(80, 'success', 11, 0, 11, NULL, 13292, '2026-02-02 18:25:00', '2026-02-02 18:25:13', 'cron', NULL),
(81, 'success', 11, 0, 11, NULL, 19551, '2026-02-02 18:29:52', '2026-02-02 18:30:11', 'startup', NULL),
(82, 'success', 11, 0, 11, NULL, 14289, '2026-02-02 18:35:00', '2026-02-02 18:35:14', 'cron', NULL),
(83, 'success', 11, 0, 0, NULL, 145153, '2026-02-03 04:55:53', '2026-02-03 04:58:18', 'startup', NULL),
(84, 'success', 11, 0, 0, NULL, 113100, '2026-02-03 05:00:00', '2026-02-03 05:01:53', 'cron', NULL),
(85, 'success', 11, 0, 0, NULL, 104438, '2026-02-03 05:05:00', '2026-02-03 05:06:44', 'cron', NULL),
(86, 'success', 11, 0, 11, NULL, 20701, '2026-02-03 05:39:35', '2026-02-03 05:39:56', 'startup', NULL),
(87, 'success', 11, 0, 11, NULL, 16561, '2026-02-03 05:40:00', '2026-02-03 05:40:16', 'cron', NULL),
(88, 'success', 11, 0, 11, NULL, 17079, '2026-02-03 05:45:00', '2026-02-03 05:45:17', 'cron', NULL),
(89, 'success', 11, 0, 11, NULL, 19534, '2026-02-03 05:50:00', '2026-02-03 05:50:19', 'cron', NULL),
(90, 'success', 0, 0, 0, NULL, NULL, '2026-02-03 05:55:00', '2026-02-03 05:55:00', 'cron', NULL),
(91, 'success', 11, 0, 11, NULL, 18281, '2026-02-03 05:55:16', '2026-02-03 05:55:34', 'startup', NULL),
(92, 'success', 11, 0, 11, NULL, 25307, '2026-02-09 10:13:50', '2026-02-09 10:14:15', 'startup', NULL),
(93, 'success', 11, 0, 11, NULL, 34742, '2026-02-09 10:15:00', '2026-02-09 10:15:35', 'cron', NULL),
(94, 'success', 11, 0, 11, NULL, 19670, '2026-02-09 10:20:00', '2026-02-09 10:20:19', 'cron', NULL),
(95, 'success', 11, 0, 11, NULL, 22000, '2026-02-09 10:22:29', '2026-02-09 10:22:51', 'startup', NULL),
(96, 'success', 11, 0, 11, NULL, 14299, '2026-02-09 10:25:00', '2026-02-09 10:25:14', 'cron', NULL),
(97, 'success', 11, 0, 11, NULL, 18071, '2026-02-09 10:30:00', '2026-02-09 10:30:18', 'cron', NULL),
(98, 'success', 11, 0, 11, NULL, 15555, '2026-02-09 10:35:00', '2026-02-09 10:35:15', 'cron', NULL),
(99, 'success', 11, 0, 11, NULL, 13523, '2026-02-09 10:40:00', '2026-02-09 10:40:13', 'cron', NULL),
(100, 'success', 11, 0, 11, NULL, 14375, '2026-02-09 10:45:00', '2026-02-09 10:45:14', 'cron', NULL),
(101, 'success', 11, 0, 11, NULL, 13198, '2026-02-09 10:50:00', '2026-02-09 10:50:13', 'cron', NULL),
(102, 'success', 11, 0, 11, NULL, 13336, '2026-02-09 10:55:00', '2026-02-09 10:55:13', 'cron', NULL),
(103, 'success', 11, 0, 11, NULL, 16313, '2026-02-09 11:00:00', '2026-02-09 11:00:16', 'cron', NULL),
(104, 'success', 11, 0, 11, NULL, 13275, '2026-02-09 11:05:00', '2026-02-09 11:05:13', 'cron', NULL),
(105, 'success', 11, 0, 11, NULL, 13350, '2026-02-09 11:10:00', '2026-02-09 11:10:13', 'cron', NULL),
(106, 'success', 11, 0, 11, NULL, 20857, '2026-02-09 11:15:00', '2026-02-09 11:15:20', 'cron', NULL),
(107, 'success', 11, 0, 11, NULL, 13494, '2026-02-09 11:20:00', '2026-02-09 11:20:13', 'cron', NULL),
(108, 'success', 11, 0, 11, NULL, 15506, '2026-02-09 11:20:29', '2026-02-09 11:20:44', 'startup', NULL),
(109, 'success', 11, 0, 11, NULL, 14503, '2026-02-09 11:25:00', '2026-02-09 11:25:14', 'cron', NULL),
(110, 'success', 11, 0, 11, NULL, 20432, '2026-02-09 11:30:00', '2026-02-09 11:30:20', 'cron', NULL),
(111, 'success', 11, 0, 11, NULL, 13679, '2026-02-09 11:35:00', '2026-02-09 11:35:13', 'cron', NULL),
(112, 'success', 11, 0, 11, NULL, 14023, '2026-02-09 11:40:00', '2026-02-09 11:40:14', 'cron', NULL),
(113, 'success', 11, 0, 11, NULL, 123665, '2026-02-10 04:12:29', '2026-02-10 04:14:33', 'startup', NULL),
(114, 'success', 11, 0, 11, NULL, 33084, '2026-02-10 04:15:00', '2026-02-10 04:15:33', 'cron', NULL),
(115, 'success', 11, 0, 11, NULL, 18738, '2026-02-10 04:20:00', '2026-02-10 04:20:18', 'cron', NULL),
(116, 'success', 11, 0, 11, NULL, 95094, '2026-02-10 04:25:00', '2026-02-10 04:26:35', 'cron', NULL),
(117, 'success', 7, 0, 7, NULL, 75541, '2026-02-16 23:45:59', '2026-02-16 23:47:14', 'startup', NULL),
(118, 'success', 7, 0, 7, NULL, 38936, '2026-02-16 23:49:10', '2026-02-16 23:49:49', 'startup', NULL),
(119, 'success', 7, 0, 7, NULL, 38633, '2026-02-16 23:50:00', '2026-02-16 23:50:38', 'cron', NULL),
(120, 'success', 7, 0, 7, NULL, 37862, '2026-02-16 23:53:19', '2026-02-16 23:53:57', 'startup', NULL),
(121, 'success', 7, 0, 7, NULL, 37559, '2026-02-16 23:55:00', '2026-02-16 23:55:37', 'cron', NULL),
(122, 'success', 7, 0, 7, NULL, 37488, '2026-02-17 00:00:00', '2026-02-17 00:00:37', 'cron', NULL),
(123, 'success', 7, 0, 7, NULL, 36540, '2026-02-17 00:05:00', '2026-02-17 00:05:36', 'cron', NULL),
(124, 'success', 7, 0, 7, NULL, 36454, '2026-02-17 00:10:00', '2026-02-17 00:10:36', 'cron', NULL),
(125, 'success', 7, 0, 7, NULL, 38086, '2026-02-17 00:15:00', '2026-02-17 00:15:38', 'cron', NULL),
(126, 'success', 7, 0, 7, NULL, 36443, '2026-02-17 00:20:00', '2026-02-17 00:20:36', 'cron', NULL),
(127, 'success', 7, 0, 7, NULL, 38729, '2026-02-17 00:25:00', '2026-02-17 00:25:38', 'cron', NULL),
(128, 'success', 7, 0, 7, NULL, 35679, '2026-02-17 00:30:00', '2026-02-17 00:30:35', 'cron', NULL),
(129, 'success', 7, 0, 7, NULL, 36370, '2026-02-17 00:35:00', '2026-02-17 00:35:36', 'cron', NULL),
(130, 'success', 7, 0, 7, NULL, 39019, '2026-02-17 00:40:00', '2026-02-17 00:40:39', 'cron', NULL),
(131, 'success', 7, 0, 7, NULL, 36730, '2026-02-17 00:45:00', '2026-02-17 00:45:36', 'cron', NULL),
(132, 'success', 7, 0, 7, NULL, 38201, '2026-02-17 00:50:00', '2026-02-17 00:50:38', 'cron', NULL),
(133, 'success', 7, 0, 7, NULL, 37193, '2026-02-17 00:55:00', '2026-02-17 00:55:37', 'cron', NULL),
(134, 'success', 7, 0, 7, NULL, 38363, '2026-02-17 01:00:00', '2026-02-17 01:00:38', 'cron', NULL),
(135, 'success', 7, 0, 7, NULL, 35979, '2026-02-17 01:05:00', '2026-02-17 01:05:36', 'cron', NULL),
(136, 'success', 7, 0, 7, NULL, 37960, '2026-02-17 01:10:00', '2026-02-17 01:10:37', 'cron', NULL),
(137, 'success', 7, 0, 7, NULL, 40699, '2026-02-17 01:15:00', '2026-02-17 01:15:40', 'cron', NULL),
(138, 'success', 7, 0, 7, NULL, 36466, '2026-02-17 01:20:00', '2026-02-17 01:20:36', 'cron', NULL),
(139, 'success', 7, 0, 7, NULL, 37970, '2026-02-17 01:25:00', '2026-02-17 01:25:38', 'cron', NULL),
(140, 'success', 7, 0, 7, NULL, 36914, '2026-02-17 01:35:00', '2026-02-17 01:35:36', 'cron', NULL),
(141, 'success', 7, 0, 7, NULL, 37696, '2026-02-17 01:40:00', '2026-02-17 01:40:37', 'cron', NULL),
(142, 'success', 7, 0, 7, NULL, 37735, '2026-02-17 01:45:00', '2026-02-17 01:45:37', 'cron', NULL),
(143, 'success', 7, 0, 7, NULL, 37450, '2026-02-17 01:50:00', '2026-02-17 01:50:37', 'cron', NULL),
(144, 'success', 7, 0, 7, NULL, 38081, '2026-02-17 01:55:00', '2026-02-17 01:55:38', 'cron', NULL),
(145, 'success', 7, 0, 7, NULL, 37372, '2026-02-17 02:00:00', '2026-02-17 02:00:37', 'cron', NULL),
(146, 'success', 7, 0, 7, NULL, 37584, '2026-02-17 02:05:00', '2026-02-17 02:05:37', 'cron', NULL),
(147, 'success', 7, 0, 7, NULL, 35587, '2026-02-17 02:10:00', '2026-02-17 02:10:35', 'cron', NULL),
(148, 'success', 7, 0, 7, NULL, 39327, '2026-02-17 02:15:00', '2026-02-17 02:15:39', 'cron', NULL),
(149, 'success', 7, 0, 7, NULL, 51267, '2026-02-25 20:59:29', '2026-02-25 21:00:21', 'startup', NULL),
(150, 'success', 7, 0, 7, NULL, 60421, '2026-02-25 21:03:53', '2026-02-25 21:04:53', 'startup', NULL),
(151, 'success', 7, 0, 7, NULL, 52573, '2026-02-25 21:05:00', '2026-02-25 21:05:53', 'cron', NULL),
(152, 'success', 7, 0, 7, NULL, 42666, '2026-02-25 21:10:00', '2026-02-25 21:10:42', 'cron', NULL),
(153, 'success', 7, 0, 7, NULL, 37083, '2026-02-25 21:15:00', '2026-02-25 21:15:37', 'cron', NULL),
(154, 'success', 7, 0, 7, NULL, 38448, '2026-02-25 21:20:00', '2026-02-25 21:20:38', 'cron', NULL),
(155, 'success', 7, 0, 7, NULL, 40559, '2026-02-25 21:25:00', '2026-02-25 21:25:40', 'cron', NULL),
(156, 'success', 7, 0, 7, NULL, 38972, '2026-02-25 21:29:58', '2026-02-25 21:30:37', 'startup', NULL),
(157, 'success', 7, 0, 7, NULL, 37714, '2026-02-25 21:35:00', '2026-02-25 21:35:37', 'cron', NULL),
(158, 'success', 7, 0, 7, NULL, 36102, '2026-02-25 21:40:00', '2026-02-25 21:40:36', 'cron', NULL),
(159, 'success', 7, 0, 7, NULL, 37116, '2026-02-25 21:45:00', '2026-02-25 21:45:37', 'cron', NULL),
(160, 'success', 7, 0, 7, NULL, 37174, '2026-02-25 21:50:00', '2026-02-25 21:50:37', 'cron', NULL),
(161, 'success', 7, 0, 7, NULL, 35676, '2026-02-25 21:55:00', '2026-02-25 21:55:35', 'cron', NULL),
(162, 'success', 7, 0, 7, NULL, 36521, '2026-02-25 21:55:51', '2026-02-25 21:56:27', 'startup', NULL),
(163, 'success', 7, 0, 7, NULL, 79199, '2026-03-02 17:02:03', '2026-03-02 17:03:22', 'startup', NULL),
(164, 'success', 7, 0, 7, NULL, 41839, '2026-03-02 17:05:00', '2026-03-02 17:05:41', 'cron', NULL),
(165, 'success', 7, 0, 7, NULL, 43097, '2026-03-02 17:10:00', '2026-03-02 17:10:43', 'cron', NULL),
(166, 'success', 7, 0, 7, NULL, 37757, '2026-03-02 17:15:00', '2026-03-02 17:15:37', 'cron', NULL),
(167, 'success', 7, 0, 7, NULL, 38428, '2026-03-02 17:20:00', '2026-03-02 17:20:38', 'cron', NULL),
(168, 'success', 7, 0, 7, NULL, 36499, '2026-03-02 17:25:00', '2026-03-02 17:25:36', 'cron', NULL),
(169, 'success', 7, 0, 7, NULL, 37040, '2026-03-02 17:30:00', '2026-03-02 17:30:37', 'cron', NULL),
(170, 'success', 7, 0, 7, NULL, 38476, '2026-03-02 17:35:00', '2026-03-02 17:35:38', 'cron', NULL),
(171, 'success', 7, 0, 7, NULL, 37049, '2026-03-02 17:40:00', '2026-03-02 17:40:37', 'cron', NULL),
(172, 'success', 7, 0, 7, NULL, 41822, '2026-03-02 17:45:00', '2026-03-02 17:45:41', 'cron', NULL),
(173, 'success', 7, 0, 7, NULL, 40461, '2026-03-02 17:50:00', '2026-03-02 17:50:40', 'cron', NULL),
(174, 'success', 7, 0, 7, NULL, 40046, '2026-03-02 17:52:50', '2026-03-02 17:53:30', 'startup', NULL),
(175, 'success', 7, 0, 7, NULL, 41703, '2026-03-02 17:55:00', '2026-03-02 17:55:41', 'cron', NULL),
(176, 'success', 7, 0, 7, NULL, 40525, '2026-03-02 18:00:00', '2026-03-02 18:00:40', 'cron', NULL),
(177, 'success', 7, 0, 7, NULL, 47739, '2026-03-02 18:05:00', '2026-03-02 18:05:47', 'cron', NULL),
(178, 'success', 7, 0, 7, NULL, 38096, '2026-03-02 18:10:00', '2026-03-02 18:10:38', 'cron', NULL),
(179, 'success', 7, 0, 7, NULL, 41412, '2026-03-02 18:15:00', '2026-03-02 18:15:41', 'cron', NULL),
(180, 'success', 7, 0, 7, NULL, 36788, '2026-03-02 18:20:00', '2026-03-02 18:20:36', 'cron', NULL),
(181, 'success', 11, 0, 11, NULL, 22378, '2026-03-02 18:24:13', '2026-03-02 18:24:35', 'startup', NULL),
(182, 'success', 11, 0, 11, NULL, 13666, '2026-03-02 18:30:00', '2026-03-02 18:30:13', 'cron', NULL),
(183, 'success', 11, 0, 11, NULL, 13371, '2026-03-02 18:35:00', '2026-03-02 18:35:13', 'cron', NULL),
(184, 'success', 11, 0, 11, NULL, 13545, '2026-03-02 18:40:00', '2026-03-02 18:40:13', 'cron', NULL),
(185, 'success', 11, 0, 11, NULL, 13300, '2026-03-02 18:45:00', '2026-03-02 18:45:13', 'cron', NULL),
(186, 'success', 11, 0, 11, NULL, 13749, '2026-03-02 18:50:00', '2026-03-02 18:50:13', 'cron', NULL),
(187, 'success', 11, 0, 11, NULL, 14449, '2026-03-02 18:55:00', '2026-03-02 18:55:14', 'cron', NULL),
(188, 'success', 11, 0, 11, NULL, 15331, '2026-03-02 19:00:00', '2026-03-02 19:00:15', 'cron', NULL),
(189, 'success', 11, 0, 11, NULL, 19048, '2026-03-02 19:05:00', '2026-03-02 19:05:19', 'cron', NULL),
(190, 'success', 7, 0, 7, NULL, 79976, '2026-03-02 19:09:13', '2026-03-02 19:10:33', 'startup', NULL),
(191, 'success', 7, 0, 7, NULL, 57304, '2026-03-02 19:20:00', '2026-03-02 19:20:57', 'cron', NULL),
(192, 'success', 7, 0, 7, NULL, 39106, '2026-03-02 19:25:00', '2026-03-02 19:25:39', 'cron', NULL),
(193, 'success', 7, 0, 7, NULL, 41579, '2026-03-02 19:30:00', '2026-03-02 19:30:41', 'cron', NULL),
(194, 'success', 7, 0, 7, NULL, 39854, '2026-03-02 19:35:00', '2026-03-02 19:35:39', 'cron', NULL),
(195, 'success', 7, 0, 7, NULL, 38499, '2026-03-02 19:40:00', '2026-03-02 19:40:38', 'cron', NULL),
(196, 'success', 7, 0, 7, NULL, 40784, '2026-03-02 19:45:00', '2026-03-02 19:45:40', 'cron', NULL),
(197, 'success', 11, 0, 11, NULL, 17918, '2026-03-02 19:47:45', '2026-03-02 19:48:03', 'startup', NULL),
(198, 'success', 11, 0, 11, NULL, 13386, '2026-03-02 19:50:00', '2026-03-02 19:50:13', 'cron', NULL),
(199, 'success', 11, 0, 11, NULL, 13125, '2026-03-02 19:55:00', '2026-03-02 19:55:13', 'cron', NULL),
(200, 'success', 11, 0, 11, NULL, 13594, '2026-03-02 20:00:00', '2026-03-02 20:00:13', 'cron', NULL),
(201, 'success', 11, 0, 11, NULL, 108960, '2026-03-02 20:10:02', '2026-03-02 20:11:51', 'cron', NULL),
(202, 'success', 11, 0, 11, NULL, 84531, '2026-03-02 20:15:04', '2026-03-02 20:16:28', 'cron', NULL),
(203, 'success', 11, 0, 11, NULL, 16115, '2026-03-02 23:18:31', '2026-03-02 23:18:47', 'startup', NULL),
(204, 'success', 11, 0, 11, NULL, 13205, '2026-03-02 23:20:00', '2026-03-02 23:20:13', 'cron', NULL),
(205, 'success', 11, 0, 11, NULL, 13287, '2026-03-02 23:25:00', '2026-03-02 23:25:13', 'cron', NULL),
(206, 'success', 11, 0, 11, NULL, 13096, '2026-03-02 23:30:00', '2026-03-02 23:30:13', 'cron', NULL),
(207, 'success', 11, 0, 11, NULL, 18882, '2026-03-02 23:35:00', '2026-03-02 23:35:19', 'cron', NULL),
(208, 'success', 11, 0, 11, NULL, 100866, '2026-03-02 23:40:02', '2026-03-02 23:41:43', 'cron', NULL),
(209, 'success', 11, 0, 11, NULL, 64422, '2026-03-02 23:45:00', '2026-03-02 23:46:05', 'cron', NULL),
(210, 'success', 11, 0, 11, NULL, 15583, '2026-03-02 23:50:00', '2026-03-02 23:50:15', 'cron', NULL),
(211, 'success', 11, 0, 11, NULL, 13154, '2026-03-02 23:55:00', '2026-03-02 23:55:13', 'cron', NULL),
(212, 'success', 11, 0, 11, NULL, 13131, '2026-03-03 00:00:00', '2026-03-03 00:00:13', 'cron', NULL),
(213, 'success', 11, 0, 11, NULL, 13225, '2026-03-03 00:05:00', '2026-03-03 00:05:13', 'cron', NULL),
(214, 'success', 11, 0, 11, NULL, 13534, '2026-03-03 00:10:00', '2026-03-03 00:10:13', 'cron', NULL),
(215, 'success', 11, 0, 11, NULL, 13124, '2026-03-03 00:15:00', '2026-03-03 00:15:13', 'cron', NULL),
(216, 'success', 11, 0, 11, NULL, 16429, '2026-03-03 00:20:00', '2026-03-03 00:20:16', 'cron', NULL),
(217, 'success', 11, 0, 11, NULL, 13379, '2026-03-03 00:25:00', '2026-03-03 00:25:13', 'cron', NULL),
(218, 'success', 11, 0, 11, NULL, 15752, '2026-03-03 00:30:00', '2026-03-03 00:30:15', 'cron', NULL),
(219, 'success', 11, 0, 11, NULL, 15431, '2026-03-03 00:35:00', '2026-03-03 00:35:15', 'cron', NULL),
(220, 'success', 11, 0, 11, NULL, 17734, '2026-03-03 00:40:00', '2026-03-03 00:40:17', 'cron', NULL),
(221, 'success', 11, 0, 11, NULL, 13105, '2026-03-03 00:45:00', '2026-03-03 00:45:13', 'cron', NULL),
(222, 'success', 11, 0, 11, NULL, 53888, '2026-03-03 00:50:00', '2026-03-03 00:50:54', 'cron', NULL),
(223, 'success', 11, 0, 11, NULL, 32851, '2026-03-03 00:55:00', '2026-03-03 00:55:33', 'cron', NULL),
(224, 'success', 11, 0, 11, NULL, 18367, '2026-03-03 01:00:00', '2026-03-03 01:00:19', 'cron', NULL),
(225, 'success', 11, 0, 11, NULL, 15809, '2026-03-03 02:00:19', '2026-03-03 02:00:35', 'startup', NULL),
(226, 'success', 11, 0, 11, NULL, 13147, '2026-03-03 02:05:00', '2026-03-03 02:05:13', 'cron', NULL),
(227, 'success', 11, 0, 11, NULL, 13214, '2026-03-03 02:10:00', '2026-03-03 02:10:13', 'cron', NULL),
(228, 'success', 0, 0, 0, NULL, NULL, '2026-03-03 02:13:33', '2026-03-03 02:13:33', 'startup', NULL),
(229, 'success', 11, 0, 11, NULL, 13482, '2026-03-03 02:13:47', '2026-03-03 02:14:01', 'startup', NULL),
(230, 'success', 11, 0, 11, NULL, 13862, '2026-03-03 02:15:00', '2026-03-03 02:15:13', 'cron', NULL),
(231, 'success', 11, 0, 11, NULL, 15735, '2026-03-04 23:05:37', '2026-03-04 23:05:53', 'startup', NULL),
(232, 'success', 11, 0, 11, NULL, 13619, '2026-03-04 23:08:12', '2026-03-04 23:08:26', 'startup', NULL),
(233, 'success', 7, 0, 7, NULL, 39611, '2026-03-04 23:15:19', '2026-03-04 23:15:59', 'startup', NULL),
(234, 'success', 7, 0, 7, NULL, 36177, '2026-03-04 23:20:00', '2026-03-04 23:20:36', 'cron', NULL),
(235, 'success', 7, 0, 7, NULL, 36158, '2026-03-04 23:25:00', '2026-03-04 23:25:36', 'cron', NULL),
(236, 'success', 7, 0, 7, NULL, 42333, '2026-03-04 23:25:50', '2026-03-04 23:26:32', 'startup', NULL),
(237, 'success', 7, 0, 7, NULL, 115995, '2026-03-04 23:30:02', '2026-03-04 23:31:58', 'cron', NULL),
(238, 'success', 7, 0, 7, NULL, 39274, '2026-03-04 23:34:19', '2026-03-04 23:34:58', 'startup', NULL),
(239, 'success', 7, 0, 7, NULL, 37706, '2026-03-04 23:54:51', '2026-03-04 23:55:28', 'startup', NULL),
(240, 'success', 7, 0, 7, NULL, 43654, '2026-03-05 01:27:04', '2026-03-05 01:27:48', 'startup', NULL),
(241, 'success', 7, 0, 7, NULL, 41407, '2026-03-05 01:30:00', '2026-03-05 01:30:41', 'cron', NULL),
(242, 'success', 7, 0, 7, NULL, 45786, '2026-03-05 01:38:32', '2026-03-05 01:39:18', 'startup', NULL),
(243, 'success', 7, 0, 7, NULL, 40516, '2026-03-05 01:43:51', '2026-03-05 01:44:32', 'startup', NULL),
(244, 'success', 7, 0, 7, NULL, 45772, '2026-03-05 01:45:00', '2026-03-05 01:45:45', 'cron', NULL),
(245, 'success', 7, 0, 7, NULL, 51055, '2026-03-05 06:35:00', '2026-03-05 06:35:51', 'cron', NULL),
(246, 'success', 7, 0, 7, NULL, 47822, '2026-03-05 06:40:00', '2026-03-05 06:40:47', 'cron', NULL),
(247, 'success', 7, 0, 7, NULL, 50241, '2026-03-05 06:45:00', '2026-03-05 06:45:50', 'cron', NULL),
(248, 'success', 7, 0, 7, NULL, 53573, '2026-03-05 06:50:00', '2026-03-05 06:50:53', 'cron', NULL),
(249, 'success', 7, 0, 7, NULL, 66256, '2026-03-05 06:55:00', '2026-03-05 06:56:06', 'cron', NULL),
(250, 'success', 7, 0, 7, NULL, 48533, '2026-03-05 07:00:00', '2026-03-05 07:00:48', 'cron', NULL),
(251, 'success', 7, 0, 7, NULL, 51282, '2026-03-05 07:05:00', '2026-03-05 07:05:51', 'cron', NULL),
(252, 'success', 7, 0, 7, NULL, 37492, '2026-03-09 02:59:17', '2026-03-09 02:59:54', 'startup', NULL),
(253, 'success', 7, 0, 7, NULL, 41259, '2026-03-09 03:00:00', '2026-03-09 03:00:41', 'cron', NULL),
(254, 'success', 7, 0, 7, NULL, 37743, '2026-03-09 03:17:17', '2026-03-09 03:17:55', 'startup', NULL),
(255, 'success', 7, 0, 7, NULL, 122703, '2026-03-09 03:20:01', '2026-03-09 03:22:03', 'cron', NULL),
(256, 'success', 7, 0, 7, NULL, 59174, '2026-03-09 03:25:00', '2026-03-09 03:25:59', 'cron', NULL),
(257, 'success', 7, 0, 7, NULL, 47225, '2026-03-09 03:30:00', '2026-03-09 03:30:47', 'cron', NULL),
(258, 'success', 7, 0, 7, NULL, 46142, '2026-03-09 03:35:00', '2026-03-09 03:35:46', 'cron', NULL),
(259, 'success', 7, 0, 7, NULL, 42368, '2026-03-09 03:36:28', '2026-03-09 03:37:10', 'startup', NULL),
(260, 'success', 7, 0, 7, NULL, 40210, '2026-03-09 03:40:00', '2026-03-09 03:40:40', 'cron', NULL),
(261, 'success', 7, 0, 7, NULL, 40576, '2026-03-09 03:45:00', '2026-03-09 03:45:40', 'cron', NULL),
(262, 'success', 7, 0, 7, NULL, 65161, '2026-03-09 03:50:00', '2026-03-09 03:51:05', 'cron', NULL),
(263, 'success', 7, 0, 7, NULL, 42922, '2026-03-09 03:55:00', '2026-03-09 03:55:43', 'cron', NULL),
(264, 'success', 7, 0, 7, NULL, 84956, '2026-03-09 04:00:00', '2026-03-09 04:01:25', 'cron', NULL),
(265, 'success', 7, 0, 7, NULL, 40509, '2026-03-09 04:05:00', '2026-03-09 04:05:40', 'cron', NULL),
(266, 'success', 7, 0, 7, NULL, 41080, '2026-03-09 04:10:00', '2026-03-09 04:10:41', 'cron', NULL),
(267, 'success', 7, 0, 7, NULL, 39085, '2026-03-09 04:15:00', '2026-03-09 04:15:39', 'cron', NULL),
(268, 'success', 7, 0, 7, NULL, 86363, '2026-03-09 04:20:00', '2026-03-09 04:21:26', 'cron', NULL),
(269, 'success', 7, 0, 7, NULL, 40457, '2026-03-09 04:25:00', '2026-03-09 04:25:40', 'cron', NULL),
(270, 'success', 7, 0, 7, NULL, 73687, '2026-03-09 04:30:00', '2026-03-09 04:31:13', 'cron', NULL),
(271, 'success', 7, 0, 7, NULL, 40674, '2026-03-09 04:35:00', '2026-03-09 04:35:40', 'cron', NULL),
(272, 'success', 7, 0, 7, NULL, 40575, '2026-03-09 04:40:00', '2026-03-09 04:40:40', 'cron', NULL),
(273, 'success', 7, 0, 7, NULL, 88615, '2026-03-09 04:45:00', '2026-03-09 04:46:29', 'cron', NULL),
(274, 'success', 7, 0, 7, NULL, 52213, '2026-03-09 04:50:00', '2026-03-09 04:50:52', 'cron', NULL),
(275, 'success', 7, 0, 7, NULL, 41645, '2026-03-09 04:55:00', '2026-03-09 04:55:41', 'cron', NULL),
(276, 'success', 7, 0, 7, NULL, 41699, '2026-03-09 05:00:00', '2026-03-09 05:00:41', 'cron', NULL),
(277, 'success', 7, 0, 7, NULL, 37070, '2026-03-09 05:05:00', '2026-03-09 05:05:37', 'cron', NULL),
(278, 'success', 7, 0, 7, NULL, 39185, '2026-03-09 05:10:00', '2026-03-09 05:10:39', 'cron', NULL),
(279, 'success', 7, 0, 7, NULL, 46690, '2026-03-09 18:44:58', '2026-03-09 18:45:45', 'startup', NULL),
(280, 'success', 7, 0, 7, NULL, 39758, '2026-03-09 18:50:00', '2026-03-09 18:50:39', 'cron', NULL),
(281, 'success', 7, 0, 7, NULL, 41662, '2026-03-09 18:55:00', '2026-03-09 18:55:41', 'cron', NULL),
(282, 'success', 7, 0, 7, NULL, 41862, '2026-03-16 00:40:35', '2026-03-16 00:41:17', 'startup', NULL),
(283, 'success', 7, 0, 7, NULL, 47323, '2026-03-16 00:45:00', '2026-03-16 00:45:47', 'cron', NULL),
(284, 'success', 7, 0, 7, NULL, 55604, '2026-03-16 00:50:00', '2026-03-16 00:50:55', 'cron', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `is_verified` tinyint(1) DEFAULT 0,
  `google_account` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_verified`, `google_account`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@map2home.com', '$2y$10$XZuZHbM50VSjoLLy.SonGevP9/tVcPHn889WzGn5DEb70NzRnyIfu', 'admin', 1, 0, '2025-11-17 12:12:09', '2025-11-17 12:12:09'),
(8, 'Test User', 'test@gmail.com', '$2a$10$o4Kv6Zm/5TIju49cfWGeJeCa/Lc8bESIaxUnAGGmkXy822Fuf1HY6', 'user', 1, 0, '2025-11-17 12:59:36', '2025-11-18 06:32:42'),
(9, 'Laiba Ijaz', 'laibaijaz538@gmail.com', '$2a$10$EGO/yRzJUsskPgXvCohNluxKaDTj4uuyXBmPy6amxhQPqJZEQTyjC', 'user', 1, 0, '2025-11-17 13:00:16', '2025-11-19 13:39:30'),
(12, 'Dameesha Rauf', 'rdameesha@gmail.com', '$2a$10$bdfsUOq1yOYS13VfNST5weJsMIqnVeil/kC9uayTLvt7hHqsRoXMi', 'user', 1, 0, '2025-11-18 06:12:23', '2025-11-18 06:18:31'),
(23, 'Miraal Fatima', 'laraibijaz196@gmail.com', '$2a$10$NtGgflGM5pua7TrYdNV2OuQIAM6JOmiZqNWzPotYdpO9owrq8sKzm', 'user', 1, 0, '2025-11-18 16:10:59', '2025-11-18 16:12:56'),
(26, 'Hashir Rafique', 'f223294@cfd.nu.edu.pk', '$2a$10$y0ag0TqXuiqr2mp8VNjN9upGi4QTm4XXyXttDzDyk/w982yChCzpq', 'user', 1, 0, '2025-11-19 13:33:16', '2025-11-20 06:28:01'),
(29, 'Laiba Ijaz', 'laibaijaz680@gmail.com', '$2a$10$1lOFTvrDLh05tgW4nICc6.eOPbCezxc57FzIMI.NLchzH/kkPh.A6', 'user', 1, 0, '2025-11-19 14:38:45', '2025-11-19 14:39:12'),
(65, 'Muhammad Bin Tariq', 'f223251@cfd.nu.edu.pk', '$2a$10$rpikksneT.RFaw1NMfX8G.Gdv4v.mmJvZqVMDzc9tp7xrXIf9QX9q', 'user', 1, 0, '2025-11-30 11:40:11', '2025-11-30 11:46:35'),
(66, 'Abdullah Lala', 'attachwithprofessional@gmail.com', '$2a$10$eUbi7afC6K9.1ksECdMRIO8ukma8hDn0slW8Xq/yuxg.oWBAXDeOm', 'user', 0, 0, '2025-11-30 11:44:01', '2025-11-30 11:44:01'),
(86, 'MBT Admin', 'mbt1234@map2home.com', '$2a$10$YMdQe7bGMhiQ.X/OZzJXRujmU0XTWlk.EkODt8mIjthbh7kOE5/ju', 'admin', 1, 0, '2025-12-06 12:09:59', '2025-12-06 12:09:59'),
(108, 'Roman', 'romanahmad1@gmail.com', '$2a$10$7TyKKuLqEry4kc47n1r.R.rGTNnYU9vPFqCq5y6EQ/rxdKyIR4dGu', 'user', 0, 0, '2026-01-10 16:31:47', '2026-01-10 16:31:47'),
(110, 'Muhammad Ahmad', 'mbintariq09@gmail.com', '$2a$10$ATCiksXXt0h2uXQvpByvbeRwVnb0g/RRkavR7BvHTsCtupheCLRci', 'user', 1, 0, '2026-02-01 13:59:55', '2026-02-01 14:00:16'),
(125, 'MBT', 'mbintariq1@gmail.com', '$2a$10$TAzE1Zga.hG.KSOs2mwm1.iVUisY16v5tFUkxT4rcjv5Ae6Vpg1W.', 'user', 1, 0, '2026-02-09 10:19:37', '2026-02-16 23:50:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cost_estimates`
--
ALTER TABLE `cost_estimates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `email_tokens`
--
ALTER TABLE `email_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `maps`
--
ALTER TABLE `maps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_room_type` (`room_type`),
  ADD KEY `idx_bedrooms` (`no_of_bedrooms`),
  ADD KEY `idx_kitchens` (`no_of_kitchens`),
  ADD KEY `idx_tv_lounges` (`no_of_tv_lounges`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `NAME` (`NAME`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `reset_tokens`
--
ALTER TABLE `reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `scraping_logs`
--
ALTER TABLE `scraping_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `triggered_by_user_id` (`triggered_by_user_id`),
  ADD KEY `idx_started_at` (`started_at`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cost_estimates`
--
ALTER TABLE `cost_estimates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `email_tokens`
--
ALTER TABLE `email_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `maps`
--
ALTER TABLE `maps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `reset_tokens`
--
ALTER TABLE `reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `scraping_logs`
--
ALTER TABLE `scraping_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=285;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=163;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cost_estimates`
--
ALTER TABLE `cost_estimates`
  ADD CONSTRAINT `cost_estimates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `email_tokens`
--
ALTER TABLE `email_tokens`
  ADD CONSTRAINT `email_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `reset_tokens`
--
ALTER TABLE `reset_tokens`
  ADD CONSTRAINT `reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `scraping_logs`
--
ALTER TABLE `scraping_logs`
  ADD CONSTRAINT `scraping_logs_ibfk_1` FOREIGN KEY (`triggered_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
