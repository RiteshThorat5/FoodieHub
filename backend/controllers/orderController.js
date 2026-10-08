const Order = require("../models/Order");
const User = require("../models/User");
const Food = require("../models/Food");
const Category = require("../models/Category");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res) => {
  try {
    const { items, address, phone, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty. Please add items to order." });
    }

    if (!address || !address.street || !address.city || !address.pincode) {
      return res.status(400).json({
        message: "Please provide a complete delivery address (street, city, pincode).",
      });
    }

    if (!phone) {
      return res.status(400).json({ message: "Contact phone number is required." });
    }

    // Format items and calculate subtotal
    let subtotal = 0;
    const formattedItems = [];

    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      subtotal += price * qty;

      formattedItems.push({
        foodId: item.foodId || item.id || item._id,
        foodName: item.foodName || item.name,
        price: price,
        quantity: qty,
        image: item.image || "",
      });
    }

    const deliveryCharge = 40;
    const totalAmount = subtotal + deliveryCharge;

    const order = new Order({
      userId: req.user._id,
      customerName: req.user.name,
      items: formattedItems,
      totalAmount,
      deliveryCharge,
      address,
      phone,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
      orderStatus: "Pending",
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: "Order placed successfully.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: "Failed to place order. " + error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private (Customer)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure customer can only view their own order
    if (
      req.user.role !== "admin" &&
      order.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving order details" });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private / Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private / Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validStatuses = [
      "Pending",
      "Accepted",
      "Preparing",
      "Ready for Pickup",
      "Rider Assigned",
      "Picked Up",
      "Out for Delivery",
      "Delivered",
      "Completed",
      "Cancelled",
    ];

    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status provided" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "Delivered" && order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();
    res.json({
      message: `Order status updated to ${updatedOrder.orderStatus}`,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update order status" });
  }
};

// @desc    Get orders for restaurant kitchen portal
// @route   GET /api/orders/restaurant/kitchen
// @access  Private (Restaurant or Admin)
const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch restaurant orders" });
  }
};

// @desc    Restaurant updates cooking/prep status
// @route   PUT /api/orders/:id/restaurant-status
// @access  Private (Restaurant or Admin)
const updateRestaurantStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const allowed = ["Accepted", "Preparing", "Ready for Pickup", "Cancelled"];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid restaurant status" });
    }

    order.orderStatus = orderStatus;
    if (req.user.restaurantName) {
      order.restaurantName = req.user.restaurantName;
    }
    const updated = await order.save();
    res.json({ message: `Order status set to ${orderStatus}`, order: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders available for delivery pickup
// @route   GET /api/orders/rider/available
// @access  Private (Rider or Admin)
const getRiderAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: "Ready for Pickup",
      riderId: { $exists: false },
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available delivery orders" });
  }
};

// @desc    Get active deliveries assigned to current rider
// @route   GET /api/orders/rider/my-deliveries
// @access  Private (Rider)
const getRiderActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      riderId: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rider deliveries" });
  }
};

// @desc    Rider accepts delivery task
// @route   PUT /api/orders/:id/rider-accept
// @access  Private (Rider)
const riderAcceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.riderId && order.riderId.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Order already claimed by another rider" });
    }

    order.riderId = req.user._id;
    order.riderName = req.user.name;
    order.riderPhone = req.user.phone || "";
    order.orderStatus = "Rider Assigned";

    const updated = await order.save();
    res.json({ message: "Delivery accepted successfully.", order: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rider updates delivery progression
// @route   PUT /api/orders/:id/rider-status
// @access  Private (Rider)
const riderUpdateStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const allowed = ["Picked Up", "Out for Delivery", "Delivered", "Completed"];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid rider status" });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }

    const updated = await order.save();
    res.json({ message: `Order status updated to ${orderStatus}`, order: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Admin Dashboard statistics
// @route   GET /api/orders/stats/dashboard
// @access  Private / Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalRestaurants = await User.countDocuments({ role: "restaurant" });
    const totalRiders = await User.countDocuments({ role: "rider" });
    const totalFoods = await Food.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });
    const preparingOrders = await Order.countDocuments({
      orderStatus: { $in: ["Accepted", "Preparing"] },
    });
    const readyPickupOrders = await Order.countDocuments({
      orderStatus: "Ready for Pickup",
    });
    const outForDeliveryOrders = await Order.countDocuments({
      orderStatus: { $in: ["Rider Assigned", "Picked Up", "Out for Delivery"] },
    });
    const deliveredOrders = await Order.countDocuments({
      orderStatus: { $in: ["Delivered", "Completed"] },
    });
    const cancelledOrders = await Order.countDocuments({ orderStatus: "Cancelled" });

    // Revenue calculated from completed / delivered orders
    const revenueAggregate = await Order.aggregate([
      { $match: { orderStatus: { $in: ["Delivered", "Completed"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].total : 0;

    // Today's stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrdersCount = await Order.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    const todayRevenueAggregate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday },
          orderStatus: { $ne: "Cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const todayRevenue =
      todayRevenueAggregate.length > 0 ? todayRevenueAggregate[0].total : 0;

    res.json({
      totalUsers,
      totalRestaurants,
      totalRiders,
      totalFoods,
      totalCategories,
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyPickupOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todayOrders: todayOrdersCount,
      todayRevenue,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to calculate dashboard statistics" });
  }
};

module.exports = {
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
};
