const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  getRestaurantOrders,
  updateRestaurantStatus,
  getRiderAvailableOrders,
  getRiderActiveOrders,
  riderAcceptOrder,
  riderUpdateStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Dashboard statistics (Admin)
router.get("/stats/dashboard", protect, adminOnly, getDashboardStats);

// Restaurant Kitchen Portal routes
router.get("/restaurant/kitchen", protect, getRestaurantOrders);
router.put("/:id/restaurant-status", protect, updateRestaurantStatus);

// Rider Delivery Partner routes
router.get("/rider/available", protect, getRiderAvailableOrders);
router.get("/rider/my-deliveries", protect, getRiderActiveOrders);
router.put("/:id/rider-accept", protect, riderAcceptOrder);
router.put("/:id/rider-status", protect, riderUpdateStatus);

// Customer order routes
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

// Admin order list
router.get("/", protect, adminOnly, getAllOrders);

// Order by ID
router.get("/:id", protect, getOrderById);

// Admin status update
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
