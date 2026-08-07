-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 05, 2026 at 01:53 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `foodexpress`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `label` varchar(50) DEFAULT NULL,
  `address_line` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `label`, `address_line`, `city`, `state`, `pincode`, `latitude`, `longitude`, `is_default`, `created_at`) VALUES
(1, 4, 'Home', 'B-802,Sky Icon,Nani Ved,Katargam,Surat', 'SURAT', 'Gujarat', '395004', 23.0293, 72.5521, 1, '2026-02-19 07:44:36'),
(2, 7, 'Home', 'B-802,Sky Icon,Nani Ved,Katargam,Surat', 'SURAT', 'Gujarat', '395004', 23.0292, 72.5513, 0, '2026-02-20 00:08:35');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` float NOT NULL,
  `min_order_amount` float DEFAULT NULL,
  `max_discount` float DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `per_user_limit` int(11) DEFAULT NULL,
  `is_first_order_only` tinyint(1) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `valid_from` datetime DEFAULT NULL,
  `valid_until` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `usage_limit`, `per_user_limit`, `is_first_order_only`, `is_active`, `valid_from`, `valid_until`, `created_at`) VALUES
(1, 'WELCOME50', '50% off on your first order! Max Rs.150 discount.', 'percentage', 50, 199, 150, NULL, 1, 1, 1, '2026-02-18 18:15:20', '2027-02-18 18:15:20', '2026-02-18 18:15:20'),
(2, 'AMDAVAD100', 'Flat Rs.100 off on orders above Rs.499 - Ahmedabad Special', 'fixed', 100, 499, NULL, NULL, 2, 0, 1, '2026-02-18 18:15:20', '2027-02-18 18:15:20', '2026-02-18 18:15:20'),
(3, 'THALI20', '20% off up to Rs.80 on all Thali orders', 'percentage', 20, 299, 80, NULL, 3, 0, 1, '2026-02-18 18:15:20', '2027-02-18 18:15:20', '2026-02-18 18:15:20'),
(4, 'FREEDEL', 'Free delivery on orders above Rs.399', 'fixed', 40, 399, NULL, NULL, 5, 0, 1, '2026-02-18 18:15:20', '2027-02-18 18:15:20', '2026-02-18 18:15:20'),
(5, 'WEEKEND25', '25% off up to Rs.120 - Weekend Special', 'percentage', 25, 349, 120, NULL, 2, 0, 1, '2026-02-18 18:15:20', '2027-02-18 18:15:20', '2026-02-18 18:15:20');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usages`
--

CREATE TABLE `coupon_usages` (
  `id` int(11) NOT NULL,
  `coupon_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `discount_amount` float NOT NULL,
  `used_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupon_usages`
--

INSERT INTO `coupon_usages` (`id`, `coupon_id`, `user_id`, `order_id`, `discount_amount`, `used_at`) VALUES
(1, 4, 4, 15, 40, '2026-02-20 04:07:35'),
(2, 4, 4, 16, 40, '2026-02-20 06:50:47'),
(3, 4, 4, 17, 40, '2026-07-08 13:20:46');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_agents`
--

CREATE TABLE `delivery_agents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_available` tinyint(1) DEFAULT NULL,
  `current_order_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_agents`
--

INSERT INTO `delivery_agents` (`id`, `user_id`, `is_available`, `current_order_id`, `created_at`) VALUES
(1, 2, 1, 15, '2026-02-18 18:15:20'),
(2, 3, 0, 2, '2026-02-18 18:15:20');

-- --------------------------------------------------------

--
-- Table structure for table `food_items`
--

CREATE TABLE `food_items` (
  `id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` float NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `food_items`
--

INSERT INTO `food_items` (`id`, `restaurant_id`, `name`, `description`, `image`, `price`, `category`, `is_available`, `created_at`) VALUES
(1, 1, 'Pav Bhaji', 'Buttery mashed vegetables with soft pav buns', 'samosa.jpeg', 80, 'Street Food', 1, '2026-02-18 18:15:20'),
(2, 1, 'Sev Usal', 'Spicy sprouted moth beans curry topped with sev', 'samosa.webp', 60, 'Street Food', 1, '2026-02-18 18:15:20'),
(3, 1, 'Dabeli', 'Kutchi dabeli with pomegranate, peanuts and chutneys', 'samosa.jpeg', 30, 'Street Food', 1, '2026-02-18 18:15:20'),
(4, 1, 'Masala Dosa', 'Crispy dosa with spiced potato filling', 'dosa.avif', 70, 'Street Food', 1, '2026-02-18 18:15:20'),
(5, 1, 'Khaman Sandwich', 'Grilled sandwich stuffed with soft khaman', 'khaman.jpg', 50, 'Street Food', 1, '2026-02-18 18:15:20'),
(6, 1, 'Kulfi Falooda', 'Creamy malai kulfi with falooda sev and rose syrup', 'shake.avif', 80, 'Desserts', 1, '2026-02-18 18:15:20'),
(7, 1, 'Ragda Pattice', 'Crispy aloo tikki with spiced ragda and chutneys', 'samosa.jpeg', 60, 'Street Food', 1, '2026-02-18 18:15:20'),
(8, 2, 'Lucknowi Biryani', 'Slow-cooked aromatic biryani with tender meat flavors', 'Biryani.avif', 220, 'Main Course', 1, '2026-02-18 18:15:20'),
(9, 2, 'Chicken Biryani', 'Fragrant rice layered with spiced chicken', 'Biryani.avif', 200, 'Main Course', 1, '2026-02-18 18:15:20'),
(10, 2, 'Mutton Seekh Kebab', 'Grilled minced mutton kebabs with mint chutney', 'thali9.jpeg', 260, 'Starters', 1, '2026-02-18 18:15:20'),
(11, 2, 'Paneer Butter Masala', 'Cottage cheese in rich tomato-butter gravy', 'thali8.jpeg', 180, 'Main Course', 1, '2026-02-18 18:15:20'),
(12, 2, 'Butter Naan', 'Soft tandoor-baked naan with butter', 'roti.jpeg', 40, 'Breads', 1, '2026-02-18 18:15:20'),
(13, 2, 'Rumali Roti', 'Paper-thin soft roti', 'roti.jpeg', 30, 'Breads', 1, '2026-02-18 18:15:20'),
(14, 2, 'Gulab Jamun', 'Deep-fried milk dumplings soaked in sugar syrup', 'dessert.jpeg', 60, 'Desserts', 1, '2026-02-18 18:15:20'),
(15, 3, 'Unlimited Gujarati Thali', 'Full Gujarati thali with dal, kadhi, shaak, roti, rice, papad, sweet', 'thali.jpg', 350, 'Thali', 1, '2026-02-18 18:15:20'),
(16, 3, 'Kathiyawadi Thali', 'Spicy Kathiyawadi style unlimited thali', 'thali1.jpg', 400, 'Thali', 1, '2026-02-18 18:15:20'),
(17, 3, 'Dal Bati Churma', 'Rajasthani style baked wheat balls with dal and sweet churma', 'dal khichadi.jpg', 250, 'Main Course', 1, '2026-02-18 18:15:20'),
(18, 3, 'Gujarati Kadhi', 'Sweet and tangy yogurt-based curry with pakoras', 'thali7.jpeg', 80, 'Main Course', 1, '2026-02-18 18:15:20'),
(19, 3, 'Bajra Rotla', 'Traditional millet flatbread with ghee', 'roti.jpeg', 30, 'Breads', 1, '2026-02-18 18:15:20'),
(20, 4, 'Heritage Gujarati Thali', 'Premium 32-item thali with seasonal specialties and live counters', 'thali.jpg', 850, 'Thali', 1, '2026-02-18 18:15:20'),
(21, 4, 'Kesar Mango Ras', 'Fresh Alphonso mango pulp served chilled', 'shake.avif', 150, 'Beverages', 1, '2026-02-18 18:15:20'),
(22, 4, 'Mohanthal', 'Traditional besan fudge with saffron and nuts', 'dessert.jpeg', 120, 'Desserts', 1, '2026-02-18 18:15:20'),
(23, 4, 'Undhiyu', 'Signature winter mixed vegetable dish cooked in earthen pot', 'undhiyu.jpg', 220, 'Main Course', 1, '2026-02-18 18:15:20'),
(24, 4, 'Surti Ponk Bhel', 'Seasonal flat rice flakes with green jowar and spices', 'samosa.jpeg', 180, 'Starters', 1, '2026-02-18 18:15:20'),
(25, 5, 'Vishalla Thali', 'Village-style unlimited thali served on leaf plates with buttermilk', 'thali.jpg', 600, 'Thali', 1, '2026-02-18 18:15:20'),
(26, 5, 'Bajra Rotlo with Ringan no Olo', 'Millet bread with smoky roasted eggplant', 'roti.jpeg', 120, 'Main Course', 1, '2026-02-18 18:15:20'),
(27, 5, 'Mag ni Dal', 'Traditional moong dal tadka with ghee', 'dal khichadi.jpg', 100, 'Main Course', 1, '2026-02-18 18:15:20'),
(28, 5, 'Masala Chaas', 'Spiced buttermilk with cumin and curry leaves', 'chaas.jpeg', 40, 'Beverages', 1, '2026-02-18 18:15:20'),
(29, 5, 'Shrikhand', 'Sweet strained yogurt with saffron and cardamom', 'shrikhand.jpeg', 80, 'Desserts', 1, '2026-02-18 18:15:20'),
(30, 6, 'Paneer Tikka', 'Chargrilled marinated cottage cheese with peppers', 'thali8.jpeg', 220, 'Starters', 1, '2026-02-18 18:15:20'),
(31, 6, 'Veg Manchurian', 'Crispy veggie balls in spicy Manchurian sauce', 'chinese.avif', 180, 'Chinese', 1, '2026-02-18 18:15:20'),
(32, 6, 'Dal Makhani', 'Slow-cooked black dal with cream and butter', 'dal khichadi.jpg', 200, 'Main Course', 1, '2026-02-18 18:15:20'),
(33, 6, 'Hakka Noodles', 'Stir-fried noodles with vegetables and soy sauce', 'chinese.avif', 160, 'Chinese', 1, '2026-02-18 18:15:20'),
(34, 6, 'Tandoori Roti', 'Whole wheat bread baked in tandoor', 'roti.jpeg', 25, 'Breads', 1, '2026-02-18 18:15:20'),
(35, 6, 'Lassi', 'Thick creamy sweet yogurt drink', 'shake.avif', 70, 'Beverages', 1, '2026-02-18 18:15:20'),
(36, 7, 'Khaman', 'Soft steamed gram flour cake with mustard tempering', 'khaman.jpg', 60, 'Farsan', 1, '2026-02-18 18:15:20'),
(37, 7, 'Khandvi', 'Thin rolled gram flour sheets with coconut tempering', 'khandvi.jpeg', 70, 'Farsan', 1, '2026-02-18 18:15:20'),
(38, 7, 'Dhokla', 'Fluffy steamed rice-chana dal cake with green chutney', 'dhokla.jpeg', 50, 'Farsan', 1, '2026-02-18 18:15:20'),
(39, 7, 'Fafda Jalebi', 'Crispy gram flour strips with sweet jalebi - Sunday special', 'fafda.webp', 60, 'Farsan', 1, '2026-02-18 18:15:20'),
(40, 7, 'Thepla', 'Spiced fenugreek flatbread - perfect travel snack', 'thepla.jpeg', 40, 'Farsan', 1, '2026-02-18 18:15:20'),
(41, 7, 'Handvo', 'Baked savory cake with mixed lentils and vegetables', 'dhokla.jpeg', 70, 'Farsan', 1, '2026-02-18 18:15:20'),
(42, 7, 'Patra', 'Colocasia leaf rolls steamed with gram flour paste', 'patra.jpg', 60, 'Farsan', 1, '2026-02-18 18:15:20'),
(43, 8, 'Masala Dosa', 'Crispy rice crepe with spiced potato filling and chutneys', 'dosa.avif', 130, 'Dosa', 1, '2026-02-18 18:15:20'),
(44, 8, 'Mysore Masala Dosa', 'Dosa with red chutney spread and potato masala', 'dosa.avif', 150, 'Dosa', 1, '2026-02-18 18:15:20'),
(45, 8, 'Idli Sambhar', 'Steamed rice cakes with lentil soup and coconut chutney', 'idli.avif', 100, 'Main Course', 1, '2026-02-18 18:15:20'),
(46, 8, 'Medu Vada', 'Crispy fried urad dal donuts with sambhar', 'vada.avif', 90, 'Starters', 1, '2026-02-18 18:15:20'),
(47, 8, 'Rava Dosa', 'Crispy semolina crepe with onion and green chillies', 'dosa.avif', 140, 'Dosa', 1, '2026-02-18 18:15:20'),
(48, 8, 'Uttapam', 'Thick rice pancake topped with onion, tomato and chillies', 'idli1.avif', 120, 'Main Course', 1, '2026-02-18 18:15:20'),
(49, 8, 'Filter Coffee', 'Traditional South Indian filter coffee', 'coffe.avif', 50, 'Beverages', 1, '2026-02-18 18:15:20'),
(50, 9, 'Havmor Burger', 'Signature Ahmedabad-style veggie burger with special sauce', 'bking2.jpg', 150, 'Burgers', 1, '2026-02-18 18:15:20'),
(51, 9, 'Grilled Sandwich', 'Triple-layer grilled cheese sandwich with veggies', 'sub.jpg', 120, 'Sandwiches', 1, '2026-02-18 18:15:20'),
(52, 9, 'Veg Pizza', 'Loaded veggie pizza with cheese and herbs', 'pizza.avif', 200, 'Pizza', 1, '2026-02-18 18:15:20'),
(53, 9, 'Cassata Ice Cream', 'Havmor iconic layered tutti-frutti ice cream', 'cake.avif', 80, 'Ice Cream', 1, '2026-02-18 18:15:20'),
(54, 9, 'Mango Dolly', 'Classic mango-flavored ice cream bar', 'shake.avif', 40, 'Ice Cream', 1, '2026-02-18 18:15:20'),
(55, 9, 'Hot Chocolate Fudge', 'Vanilla ice cream with warm chocolate fudge and nuts', 'dessert.jpeg', 150, 'Ice Cream', 1, '2026-02-18 18:15:20'),
(56, 10, 'Rajwadu Royal Thali', 'Grand Rajasthani-Gujarati thali with 35+ items and live counters', 'thali.jpg', 700, 'Thali', 1, '2026-02-18 18:15:20'),
(57, 10, 'Dal Baati Churma', 'Baked wheat balls with panchmel dal and sweet churma', 'dal khichadi.jpg', 280, 'Main Course', 1, '2026-02-18 18:15:20'),
(58, 10, 'Gatte ki Sabzi', 'Gram flour dumplings in spiced yogurt gravy', 'thali7.jpeg', 180, 'Main Course', 1, '2026-02-18 18:15:20'),
(59, 10, 'Ker Sangri', 'Rajasthani wild berries and beans dry vegetable', 'thali8.jpeg', 200, 'Main Course', 1, '2026-02-18 18:15:20'),
(60, 10, 'Ghevar', 'Honeycomb-shaped Rajasthani sweet with rabri', 'dessert.jpeg', 100, 'Desserts', 1, '2026-02-18 18:15:20'),
(61, 11, 'Gordhan Special Thali', 'Premium unlimited thali with 40+ items including farsan and sweets', 'thali.jpg', 550, 'Thali', 1, '2026-02-18 18:15:20'),
(62, 11, 'Paneer Bhurji', 'Scrambled paneer with onion, tomato and spices', 'thali8.jpeg', 180, 'Main Course', 1, '2026-02-18 18:15:20'),
(63, 11, 'Sev Tameta nu Shaak', 'Tangy tomato curry topped with crispy sev', 'sev tameta.jpeg', 120, 'Main Course', 1, '2026-02-18 18:15:20'),
(64, 11, 'Rotla', 'Thick millet flatbread with white butter', 'roti.jpeg', 30, 'Breads', 1, '2026-02-18 18:15:20'),
(65, 11, 'Basundi', 'Reduced sweetened milk with nuts and saffron', 'dessert.jpeg', 90, 'Desserts', 1, '2026-02-18 18:15:20'),
(66, 12, 'Veg Buffet Lunch', 'Unlimited multi-cuisine buffet with city views', 'thali.jpg', 800, 'Buffet', 1, '2026-02-18 18:15:20'),
(67, 12, 'Paneer Lababdar', 'Paneer in rich onion-tomato cashew gravy', 'thali8.jpeg', 320, 'Main Course', 1, '2026-02-18 18:15:20'),
(68, 12, 'Mushroom Galouti', 'Melt-in-mouth mushroom kebabs', 'thali9.jpeg', 280, 'Starters', 1, '2026-02-18 18:15:20'),
(69, 12, 'Brownie with Ice Cream', 'Warm chocolate brownie with vanilla ice cream', 'cake.avif', 220, 'Desserts', 1, '2026-02-18 18:15:20'),
(70, 12, 'Fresh Lime Soda', 'Refreshing sweet or salted fresh lime soda', 'chaas.jpeg', 80, 'Beverages', 1, '2026-02-18 18:15:20'),
(71, 13, 'Veg BBQ Unlimited', 'Unlimited starters on live grill, main course, and desserts', 'sizzler.jpeg', 999, 'BBQ', 1, '2026-02-18 18:15:20'),
(72, 13, 'Paneer Tikka Grill', 'Marinated paneer grilled at your table', 'thali8.jpeg', 250, 'Starters', 1, '2026-02-18 18:15:20'),
(73, 13, 'Cajun Spice Potato', 'Spiced potato wedges grilled to perfection', 'samosa.jpeg', 180, 'Starters', 1, '2026-02-18 18:15:20'),
(74, 13, 'Veg Kebab Platter', 'Assorted vegetable kebabs with mint chutney', 'thali9.jpeg', 350, 'Starters', 1, '2026-02-18 18:15:20'),
(75, 13, 'Kulfi', 'Traditional Indian ice cream with pistachios', 'shake.avif', 120, 'Desserts', 1, '2026-02-18 18:15:20'),
(76, 14, 'Tomatoes Special Pizza', 'House special loaded pizza with extra cheese', 'pizza.avif', 250, 'Pizza', 1, '2026-02-18 18:15:20'),
(77, 14, 'Penne Arrabiata', 'Penne in spicy tomato sauce with herbs', 'noodles.jpeg', 220, 'Pasta', 1, '2026-02-18 18:15:20'),
(78, 14, 'Veg Spring Roll', 'Crispy rolls stuffed with mixed vegetables', 'samosa.jpeg', 150, 'Starters', 1, '2026-02-18 18:15:20'),
(79, 14, 'Fried Rice', 'Wok-tossed rice with vegetables and soy sauce', 'chinese.avif', 180, 'Chinese', 1, '2026-02-18 18:15:20'),
(80, 14, 'Cold Coffee', 'Chilled blended coffee with ice cream', 'coffe.avif', 120, 'Beverages', 1, '2026-02-18 18:15:20'),
(81, 15, 'Avocado Toast', 'Sourdough toast with smashed avocado', 'sub1.jpg', 220, 'Breakfast', 1, '2026-02-18 18:15:20'),
(82, 15, 'Classic Pancakes', 'Fluffy pancakes with maple syrup and berries', 'cake.avif', 200, 'Breakfast', 1, '2026-02-18 18:15:20'),
(83, 15, 'Caesar Salad', 'Romaine lettuce with parmesan and croutons', 'salad.avif', 250, 'Salads', 1, '2026-02-18 18:15:20'),
(84, 15, 'Pasta Alfredo', 'Creamy white sauce pasta with mushrooms', 'noodles.jpeg', 280, 'Pasta', 1, '2026-02-18 18:15:20'),
(85, 15, 'Nutella Shake', 'Thick shake blended with Nutella and ice cream', 'shake.avif', 180, 'Beverages', 1, '2026-02-18 18:15:20'),
(86, 15, 'Cheesecake', 'New York style baked cheesecake with berry compote', 'cake1.jpg', 220, 'Desserts', 1, '2026-02-18 18:15:20'),
(87, 16, 'Chilli Paneer', 'Crispy paneer tossed in spicy chilli sauce', 'chinese.avif', 200, 'Chinese', 1, '2026-02-18 18:15:20'),
(88, 16, 'Veg Manchow Soup', 'Spicy vegetable soup with crispy noodles on top', 'chinese.avif', 120, 'Soups', 1, '2026-02-18 18:15:20'),
(89, 16, 'Schezwan Fried Rice', 'Fiery Schezwan-style wok rice with vegetables', 'chinese.avif', 180, 'Rice', 1, '2026-02-18 18:15:20'),
(90, 16, 'Hakka Noodles', 'Stir-fried noodles with crunchy vegetables', 'chinese.avif', 170, 'Noodles', 1, '2026-02-18 18:15:20'),
(91, 16, 'Manchurian Gravy', 'Veg balls in tangy Manchurian gravy', 'chinese.avif', 190, 'Chinese', 1, '2026-02-18 18:15:20'),
(92, 16, 'Honey Chilli Potato', 'Crispy fried potatoes glazed with honey and chilli', 'chinese.avif', 180, 'Starters', 1, '2026-02-18 18:15:20'),
(93, 17, 'Unlimited Thali', 'Simple and authentic Gujarati thali with homestyle taste', 'thali.jpg', 300, 'Thali', 1, '2026-02-18 18:15:20'),
(94, 17, 'Chole Bhature', 'Spiced chickpeas with fluffy fried bread', 'chole.avif', 120, 'Main Course', 1, '2026-02-18 18:15:20'),
(95, 17, 'Samosa', 'Crispy pastry with spiced potato-pea filling', 'samosa.jpeg', 20, 'Starters', 1, '2026-02-18 18:15:20'),
(96, 17, 'Kachori', 'Deep-fried pastry with spiced moong dal filling', 'samosa.webp', 25, 'Starters', 1, '2026-02-18 18:15:20'),
(97, 17, 'Chaas', 'Refreshing spiced buttermilk', 'chaas.jpeg', 30, 'Beverages', 1, '2026-02-18 18:15:20'),
(98, 18, 'Grand Buffet', 'Lavish multi-cuisine unlimited buffet with live stations', 'thali.jpg', 900, 'Buffet', 1, '2026-02-18 18:15:20'),
(99, 18, 'Veg Sizzler', 'Mixed vegetables on sizzling hot plate with rice and gravy', 'sizzler.jpeg', 350, 'Main Course', 1, '2026-02-18 18:15:20'),
(100, 18, 'Mushroom Risotto', 'Creamy Italian rice with wild mushrooms and parmesan', 'rice.jpeg', 320, 'Italian', 1, '2026-02-18 18:15:20'),
(101, 18, 'Tiramisu', 'Classic Italian coffee-flavored layered dessert', 'cake2.jpg', 250, 'Desserts', 1, '2026-02-18 18:15:20'),
(102, 18, 'Virgin Mojito', 'Refreshing mint and lime mocktail', 'chaas.jpeg', 150, 'Beverages', 1, '2026-02-18 18:15:20'),
(103, 19, 'Bun Maska', 'Soft Irani bun with thick butter layer', 'roti.jpeg', 30, 'Snacks', 1, '2026-02-18 18:15:20'),
(104, 19, 'Irani Chai', 'Sweet milky tea served in a glass - old city style', 'coffe.avif', 20, 'Beverages', 1, '2026-02-18 18:15:20'),
(105, 19, 'Keema Pav', 'Spiced minced meat with buttered pav', 'samosa.jpeg', 80, 'Snacks', 1, '2026-02-18 18:15:20'),
(106, 19, 'Mawa Cake', 'Dense and moist milk-solid cake - Irani bakery classic', 'cake3.jpg', 25, 'Bakery', 1, '2026-02-18 18:15:20'),
(107, 19, 'Chicken Samosa', 'Crispy samosa with spiced chicken filling', 'samosa.webp', 30, 'Snacks', 1, '2026-02-18 18:15:20'),
(108, 19, 'Egg Bhurji Pav', 'Spiced scrambled eggs with buttered pav', 'egg.avif', 60, 'Snacks', 1, '2026-02-18 18:15:20'),
(109, 20, 'Kathiyawadi Thali', 'Spicy Kathiyawadi unlimited thali with regional specialties', 'thali3.jpg', 350, 'Thali', 1, '2026-02-18 18:15:20'),
(110, 20, 'Sev Tameta', 'Spicy tomato curry topped with gathiya sev', 'sev tameta.jpeg', 100, 'Main Course', 1, '2026-02-18 18:15:20'),
(111, 20, 'Ringan no Olo', 'Smoky fire-roasted eggplant mash with garlic', 'bhindi.jpeg', 90, 'Main Course', 1, '2026-02-18 18:15:20'),
(112, 20, 'Rotla with Ghee', 'Thick bajra roti served with pure ghee', 'roti.jpeg', 30, 'Breads', 1, '2026-02-18 18:15:20'),
(113, 20, 'Aloo Gobi', 'Spiced potato and cauliflower dry vegetable', 'aloo gobi.jpeg', 120, 'Main Course', 1, '2026-02-18 18:15:20'),
(114, 20, 'Raab', 'Traditional warm millet porridge drink', 'chaas.jpeg', 50, 'Beverages', 1, '2026-02-18 18:15:20'),
(115, 21, 'Butter Chicken', 'Tender chicken in creamy tomato butter sauce', 'thali9.jpeg', 280, 'Main Course', 1, '2026-02-18 18:15:20'),
(116, 21, 'Malai Kofta', 'Paneer-potato balls in rich cashew cream gravy', 'thali7.jpeg', 240, 'Main Course', 1, '2026-02-18 18:15:20'),
(117, 21, 'Garlic Naan', 'Soft naan topped with garlic and butter', 'roti.jpeg', 50, 'Breads', 1, '2026-02-18 18:15:20'),
(118, 21, 'Tandoori Platter', 'Assorted tandoor items - paneer, mushroom, broccoli', 'thali9.jpeg', 350, 'Starters', 1, '2026-02-18 18:15:20'),
(119, 21, 'Dum Biryani', 'Slow-cooked aromatic rice with vegetables and saffron', 'Biryani.avif', 250, 'Main Course', 1, '2026-02-18 18:15:20'),
(120, 21, 'Rasmalai', 'Soft paneer balls in sweetened saffron milk', 'dessert.jpeg', 80, 'Desserts', 1, '2026-02-18 18:15:20'),
(121, 22, 'Veg Club Sandwich', 'Triple-decker sandwich with veggies, cheese and chutney', 'sub2.jpg', 130, 'Sandwiches', 1, '2026-02-18 18:15:20'),
(122, 22, 'Masala Omelette', 'Spiced egg omelette with onion, tomato, chilli', 'egg.avif', 60, 'Eggs', 1, '2026-02-18 18:15:20'),
(123, 22, 'Bread Butter Jam', 'Fresh bread with butter and mixed fruit jam', 'roti.jpeg', 40, 'Bakery', 1, '2026-02-18 18:15:20'),
(124, 22, 'Cutting Chai', 'Half cup strong masala tea - Ahmedabad style', 'coffe.avif', 15, 'Beverages', 1, '2026-02-18 18:15:20'),
(125, 22, 'Khari Biscuit', 'Flaky puff pastry biscuit - perfect with chai', 'fafda.webp', 30, 'Bakery', 1, '2026-02-18 18:15:20'),
(126, 22, 'Fresh Fruit Juice', 'Seasonal fresh fruit juice without sugar', 'shake.avif', 80, 'Beverages', 1, '2026-02-18 18:15:20');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `address_id` int(11) NOT NULL,
  `delivery_agent_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `subtotal` float DEFAULT NULL,
  `discount_amount` float DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `total_amount` float NOT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `restaurant_id`, `address_id`, `delivery_agent_id`, `status`, `subtotal`, `discount_amount`, `coupon_code`, `total_amount`, `payment_method`, `payment_status`, `created_at`, `updated_at`) VALUES
(1, 4, 11, 1, 1, 'confirmed', 550, 0, NULL, 577.5, 'razorpay', 'completed', '2026-02-19 07:45:24', '2026-02-19 07:45:56'),
(2, 4, 1, 1, 2, 'confirmed', 130, 0, NULL, 176.5, 'razorpay', 'completed', '2026-02-19 09:19:32', '2026-02-19 09:21:18'),
(3, 7, 1, 2, 1, 'pending', 80, 0, NULL, 124, 'razorpay', 'pending', '2026-02-20 00:08:53', '2026-02-20 00:08:53'),
(4, 7, 1, 2, NULL, 'pending', 180, 0, NULL, 229, 'razorpay', 'pending', '2026-02-20 00:14:56', '2026-02-20 00:14:56'),
(5, 7, 1, 2, NULL, 'pending', 240, 0, NULL, 292, 'razorpay', 'pending', '2026-02-20 00:17:59', '2026-02-20 00:17:59'),
(6, 7, 1, 2, NULL, 'pending', 180, 0, NULL, 229, 'razorpay', 'pending', '2026-02-20 00:23:45', '2026-02-20 00:23:45'),
(7, 7, 1, 2, NULL, 'confirmed', 120, 0, NULL, 166, 'razorpay', 'completed', '2026-02-20 00:30:45', '2026-02-20 00:30:46'),
(8, 7, 1, 2, NULL, 'pending', 50, 0, NULL, 92.5, 'cod', 'pending', '2026-02-20 00:32:58', '2026-02-20 00:32:58'),
(9, 7, 1, 2, NULL, 'confirmed', 80, 0, NULL, 124, 'razorpay', 'completed', '2026-02-20 00:38:29', '2026-02-20 00:38:31'),
(10, 7, 1, 2, NULL, 'confirmed', 140, 0, NULL, 187, 'razorpay', 'completed', '2026-02-20 00:40:58', '2026-02-20 00:40:59'),
(11, 4, 1, 1, NULL, 'confirmed', 80, 0, NULL, 124, 'razorpay', 'completed', '2026-02-20 00:50:52', '2026-02-20 00:51:26'),
(12, 4, 1, 1, NULL, 'confirmed', 120, 0, NULL, 166, 'razorpay', 'completed', '2026-02-20 01:05:58', '2026-02-20 01:06:19'),
(13, 4, 1, 1, 1, 'delivered', 160, 0, NULL, 208, 'razorpay', 'completed', '2026-02-20 02:18:47', '2026-02-20 02:24:03'),
(14, 4, 1, 1, NULL, 'packed', 160, 0, NULL, 208, 'razorpay', 'completed', '2026-02-20 04:04:03', '2026-02-20 06:08:33'),
(15, 4, 10, 1, 1, 'delivered', 700, 40, 'FREEDEL', 693, 'razorpay', 'completed', '2026-02-20 04:07:35', '2026-02-20 06:05:35'),
(16, 4, 1, 1, NULL, 'confirmed', 450, 40, 'FREEDEL', 470.5, 'razorpay', 'completed', '2026-02-20 06:50:47', '2026-02-20 06:52:13'),
(17, 4, 11, 1, NULL, 'pending', 420, 40, 'FREEDEL', 439, 'razorpay', 'pending', '2026-07-08 13:20:46', '2026-07-08 13:20:46'),
(18, 7, 1, 2, NULL, 'pending', 50, 0, NULL, 92.5, 'razorpay', 'pending', '2026-08-04 19:24:36', '2026-08-04 19:24:36'),
(19, 7, 1, 2, NULL, 'confirmed', 80, 0, NULL, 124, 'razorpay', 'completed', '2026-08-04 20:50:21', '2026-08-04 20:50:41');

-- --------------------------------------------------------

--
-- Table structure for table `order_history`
--

CREATE TABLE `order_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `food_item_id` int(11) NOT NULL,
  `order_count` int(11) DEFAULT NULL,
  `last_ordered_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `food_item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `food_item_id`, `quantity`, `price`) VALUES
(1, 1, 61, 1, 550),
(2, 2, 4, 1, 70),
(3, 2, 7, 1, 60),
(4, 3, 1, 1, 80),
(5, 4, 2, 3, 60),
(6, 5, 2, 4, 60),
(7, 6, 2, 3, 60),
(8, 7, 2, 2, 60),
(9, 8, 5, 1, 50),
(10, 9, 1, 1, 80),
(11, 10, 4, 2, 70),
(12, 11, 1, 1, 80),
(13, 12, 2, 2, 60),
(14, 13, 6, 2, 80),
(15, 14, 6, 2, 80),
(16, 15, 56, 1, 700),
(17, 16, 3, 15, 30),
(18, 17, 64, 2, 30),
(19, 17, 62, 2, 180),
(20, 18, 5, 1, 50),
(21, 19, 1, 1, 80);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `amount` float NOT NULL,
  `method` varchar(20) NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `amount`, `method`, `transaction_id`, `status`, `created_at`) VALUES
(1, 1, 577.5, 'razorpay', 'pay_SHvVkti81YsHwM', 'completed', '2026-02-19 07:45:56'),
(2, 2, 176.5, 'razorpay', 'pay_SHx8VrLV2isYl4', 'completed', '2026-02-19 09:21:18'),
(3, 7, 166, 'razorpay', 'pay_mock_0bmc62f1i', 'completed', '2026-02-20 00:30:46'),
(4, 9, 124, 'razorpay', 'pay_mock_q7l10w4js', 'completed', '2026-02-20 00:38:31'),
(5, 10, 187, 'razorpay', 'pay_mock_x4z8dz2ci', 'completed', '2026-02-20 00:40:59'),
(6, 11, 124, 'razorpay', 'pay_SICz2jLAkIEBTv', 'completed', '2026-02-20 00:51:26'),
(7, 12, 166, 'razorpay', 'pay_SIDElSZ35ZQk76', 'completed', '2026-02-20 01:06:19'),
(8, 13, 208, 'razorpay', 'pay_SIEToKlH9PXNdZ', 'completed', '2026-02-20 02:19:16'),
(9, 14, 208, 'razorpay', 'pay_SIGH0Q6Ajsz929', 'completed', '2026-02-20 04:04:32'),
(10, 15, 693, 'razorpay', 'pay_SIGKeTwPhFlLxJ', 'completed', '2026-02-20 04:07:59'),
(11, 16, 470.5, 'razorpay', 'pay_SIJ89SXXbHyQIc', 'completed', '2026-02-20 06:52:13'),
(12, 19, 124, 'razorpay', 'pay_TLpYhP1bSf0heQ', 'completed', '2026-08-04 20:50:41');

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `cuisine_type` varchar(50) DEFAULT NULL,
  `rating` float DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`id`, `name`, `owner_id`, `description`, `image`, `cuisine_type`, `rating`, `address`, `is_active`, `created_at`) VALUES
(1, 'Manek Chowk Street Food', 7, 'Ahmedabad\'s iconic street food destination with the best chaats, dosas and more.', 'samosa.jpeg', 'Street Food', 4.5, 'Manek Chowk, Old City, Ahmedabad', 1, '2026-02-18 18:15:20'),
(2, 'Lucky Restaurant', NULL, 'Famous for authentic Lucknowi Biryani and kebabs since 1955.', 'Biryani.avif', 'Mughlai', 4.4, 'Lal Darwaja, Ahmedabad', 1, '2026-02-18 18:15:20'),
(3, 'Gopi Dining Hall', NULL, 'Traditional unlimited Gujarati Thali at its finest.', 'thali.jpg', 'Gujarati', 4.6, 'Ashram Road, Ahmedabad', 1, '2026-02-18 18:15:20'),
(4, 'Agashiye', 8, 'Award-winning rooftop fine dining Gujarati restaurant at The House of MG.', 'thali1.jpg', 'Gujarati', 4.8, 'The House of MG, Lal Darwaja, Ahmedabad', 1, '2026-02-18 18:15:20'),
(5, 'Vishalla', NULL, 'Village-themed open-air restaurant serving traditional Gujarati food on leaf plates.', 'thali2.jpg', 'Gujarati', 4.7, 'Sarkhej-Gandhinagar Highway, Ahmedabad', 1, '2026-02-18 18:15:20'),
(6, 'Honest Restaurant', 8, 'Popular Ahmedabad chain known for Punjabi, South Indian and Chinese food.', 'rc1.jpeg', 'Multi-Cuisine', 4.3, 'CG Road, Ahmedabad', 1, '2026-02-18 18:15:20'),
(7, 'Das Khaman House', 8, 'Legendary shop for the softest Khaman, Khandvi and Gujarati farsan since 1946.', 'khaman.jpg', 'Gujarati Snacks', 4.6, 'Manek Chowk, Ahmedabad', 1, '2026-02-18 18:15:20'),
(8, 'Sankalp Restaurant', NULL, 'Famous South Indian chain serving crispy dosas, idlis, and uttapams.', 'dosa.avif', 'South Indian', 4.4, 'Drive-In Road, Ahmedabad', 1, '2026-02-18 18:15:20'),
(9, 'Havmor Restaurant', NULL, 'Ahmedabad\'s iconic restaurant and ice cream brand since 1944.', 'cake.avif', 'Multi-Cuisine', 4.5, 'Ashram Road, Ahmedabad', 1, '2026-02-18 18:15:20'),
(10, 'Rajwadu', 7, 'Royal Rajasthani-Gujarati dining experience with live folk music and dance.', 'thali3.jpg', 'Gujarati', 4.5, 'Sarkhej-Gandhinagar Highway, Ahmedabad', 1, '2026-02-18 18:15:20'),
(11, 'Gordhan Thal', 8, 'Premium unlimited Gujarati Thali with 40+ items and sweets.', 'thali4.jpeg', 'Gujarati', 4.6, 'SG Highway, Ahmedabad', 1, '2026-02-18 18:15:20'),
(12, 'Patang Revolving Restaurant', 7, 'Ahmedabad\'s only revolving rooftop restaurant with panoramic city views.', 'roof.jpg', 'Multi-Cuisine', 4.3, 'Nehru Bridge, Ashram Road, Ahmedabad', 1, '2026-02-18 18:15:20'),
(13, 'Barbeque Nation', NULL, 'Live grill-on-your-table experience with unlimited starters, mains and desserts.', 'sizzler.jpeg', 'BBQ & Grill', 4.4, 'Prahlad Nagar, Ahmedabad', 1, '2026-02-18 18:15:20'),
(14, 'Tomatoes Restaurant', NULL, 'Popular family restaurant serving Indian, Chinese and Continental food.', 'pizza.avif', 'Multi-Cuisine', 4.2, 'Maninagar, Ahmedabad', 1, '2026-02-18 18:15:20'),
(15, 'The Green House', NULL, 'Trendy cafe with continental food, fresh juices, shakes and desserts.', 'cafe2.jpeg', 'Cafe', 4.3, 'Bodakdev, Ahmedabad', 1, '2026-02-18 18:15:20'),
(16, 'ZK\'s Restaurant', NULL, 'Best Indo-Chinese food in Ahmedabad with generous portions.', 'noodles.jpeg', 'Chinese', 4.2, 'Satellite Road, Ahmedabad', 1, '2026-02-18 18:15:20'),
(17, 'Shree Thaker Bhojanalay', NULL, 'Authentic Kathiyawadi-style unlimited thali with rustic flavors.', 'thali5.jpeg', 'Gujarati', 4.5, 'Kalupur, Ahmedabad', 1, '2026-02-18 18:15:20'),
(18, 'The Grand Bhagwati', 7, 'Premium dining with Indian, Chinese, Italian cuisines and lavish buffets.', 'rc2.jpeg', 'Multi-Cuisine', 4.4, 'SG Highway, Ahmedabad', 1, '2026-02-18 18:15:20'),
(19, 'Khamasa Cafe', NULL, 'Heritage cafe in the old city with Mughlai snacks, chai, and bun maska.', 'cafe4.jpeg', 'Cafe', 4.3, 'Khamasa, Old City, Ahmedabad', 1, '2026-02-18 18:15:20'),
(20, 'Riddhi Siddhi Kathiyawadi', NULL, 'Spicy and flavorful Kathiyawadi cuisine with authentic Saurashtra taste.', 'thali6.jpeg', 'Kathiyawadi', 4.4, 'Naranpura, Ahmedabad', 1, '2026-02-18 18:15:20'),
(21, 'Jalsa Restaurant', NULL, 'North Indian and Punjabi food with rich gravies, tandoor items and breads.', 'rc3.jpeg', 'Punjabi', 4.3, 'Prahladnagar, Ahmedabad', 1, '2026-02-18 18:15:20'),
(22, 'Cafe Good Luck', 8, 'Old Ahmedabad-style Irani cafe with fresh bakes, sandwiches and chai.', 'cafe5.jpeg', 'Bakery & Cafe', 4.2, 'Ellis Bridge, Ahmedabad', 1, '2026-02-18 18:15:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(256) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT NULL,
  `is_delivery_agent` tinyint(1) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `google_id` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `restaurant_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `phone`, `is_admin`, `is_delivery_agent`, `role`, `google_id`, `created_at`, `restaurant_id`) VALUES
(1, 'admin@foodexpress.com', 'pbkdf2:sha256:600000$Mvs5Pbj62t5dakTN$0b72ae9f9fdf86811873ca6556f0866dcec9950e94c39b189cbb72b43fb22be4', 'Admin User', '9999999999', 1, 0, 'user', NULL, '2026-02-18 18:15:20', NULL),
(2, 'rahul.agent@foodexpress.com', 'pbkdf2:sha256:600000$h9fRbhOUNSjs8HxK$21a3d138e2dcad20ec1d1d847cb6f9ecbcc9516b6970bd92b48628e82bd478a8', 'Rahul Kumar', '9876543210', 0, 1, 'user', NULL, '2026-02-18 18:15:20', NULL),
(3, 'priya.agent@foodexpress.com', 'pbkdf2:sha256:600000$SFOFXXwx8ww4SdqG$a163b05a29196675d722a11f1fb2ef545ee9860c81a7ccf53bc84add0157999d', 'Priya Singh', '9876543211', 0, 1, 'user', NULL, '2026-02-18 18:15:20', NULL),
(4, 'amit@example.com', 'pbkdf2:sha256:600000$9yYq6KJ7827DI2sI$82b8acb40ee58879e694f59709d9da7d4d9e4a520a3390acb1c4a7ad3fce74ec', 'Amit Sharma', '9123456780', 0, 0, 'user', NULL, '2026-02-18 18:15:20', NULL),
(5, 'sneha@example.com', 'pbkdf2:sha256:600000$yv0fwEAHuwI8nOSr$bd3b8df54838a04d67274b7c756220f400e9397e62d15a613db14ff5b42cf0e1', 'Sneha Patel', '9123456781', 0, 0, 'user', NULL, '2026-02-18 18:15:20', NULL),
(6, 'vikram@example.com', 'pbkdf2:sha256:600000$jC16kGiWRnk1GSZ3$d2d43afd087b65c594bedf2c39bffdefffb2d3cab8ed73a200f29faac743a8c7', 'Vikram Reddy', '9123456782', 0, 0, 'user', NULL, '2026-02-18 18:15:20', NULL),
(7, 'owner@restaurant.com', 'pbkdf2:sha256:600000$hadZF0dX9UFTgGl4$ff5023d61861744461f1f3b9e06b562ae5d1f9697001f97284344e0ac2d1144b', 'Restaurant Owner', '9876543210', 0, 0, 'restaurant_owner', NULL, '2026-02-19 20:46:44', 12),
(8, 'restaurant.owner@foodexpress.com', 'pbkdf2:sha256:600000$IDjFQrinV0mMRv9O$6bdfa2b78d0e7a32c97a160f0f593d3d636c85f799914a5851af0fed09d98144', 'John Restaurant Owner', '9876543211', 0, 0, 'restaurant_owner', NULL, '2026-02-19 20:47:20', 11);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coupon_id` (`coupon_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `delivery_agents`
--
ALTER TABLE `delivery_agents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_delivery_agent_current_order` (`current_order_id`);

--
-- Indexes for table `food_items`
--
ALTER TABLE `food_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `restaurant_id` (`restaurant_id`),
  ADD KEY `address_id` (`address_id`),
  ADD KEY `delivery_agent_id` (`delivery_agent_id`);

--
-- Indexes for table `order_history`
--
ALTER TABLE `order_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `restaurant_id` (`restaurant_id`),
  ADD KEY `food_item_id` (`food_item_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `food_item_id` (`food_item_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_users_email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD KEY `fk_user_restaurant` (`restaurant_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `delivery_agents`
--
ALTER TABLE `delivery_agents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `food_items`
--
ALTER TABLE `food_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `order_history`
--
ALTER TABLE `order_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD CONSTRAINT `coupon_usages_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`),
  ADD CONSTRAINT `coupon_usages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `coupon_usages_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `delivery_agents`
--
ALTER TABLE `delivery_agents`
  ADD CONSTRAINT `delivery_agents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_delivery_agent_current_order` FOREIGN KEY (`current_order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `food_items`
--
ALTER TABLE `food_items`
  ADD CONSTRAINT `food_items_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`),
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`delivery_agent_id`) REFERENCES `delivery_agents` (`id`);

--
-- Constraints for table `order_history`
--
ALTER TABLE `order_history`
  ADD CONSTRAINT `order_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `order_history_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`),
  ADD CONSTRAINT `order_history_ibfk_3` FOREIGN KEY (`food_item_id`) REFERENCES `food_items` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`food_item_id`) REFERENCES `food_items` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
