function OrderSuccessModal({ order, onClose, onViewOrders }) {
  if (!order) return null;

  return (
    <div className="login-page modal-overlay" onClick={onClose}>
      <div
        className="login-card success-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <h1 style={{ color: "#2e7d32" }}>Order Placed Successfully</h1>
        <p className="login-subtitle">
          Thank you for choosing FoodieHub. Your order has been received.
        </p>

        <div className="order-details-box">
          <div className="detail-item">
            <span>Order ID:</span>
            <strong>#{order._id.substring(order._id.length - 8).toUpperCase()}</strong>
          </div>
          <div className="detail-item">
            <span>Status:</span>
            <span className="status-badge status-pending">
              {order.orderStatus || "Pending"}
            </span>
          </div>
          <div className="detail-item">
            <span>Customer Name:</span>
            <strong>{order.customerName || "Customer"}</strong>
          </div>
          <div className="detail-item">
            <span>Total Amount:</span>
            <strong className="text-orange">₹{order.totalAmount}</strong>
          </div>
          <div className="detail-item">
            <span>Payment Method:</span>
            <strong>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online"}</strong>
          </div>
          <div className="detail-item">
            <span>Delivery Address:</span>
            <span>
              {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
            </span>
          </div>
        </div>

        <div className="success-actions">
          <button
            className="order-btn"
            style={{ width: "100%", marginBottom: "10px" }}
            onClick={onViewOrders}
          >
            Track in My Orders
          </button>
          <button
            className="login-btn"
            style={{ width: "100%", border: "1px solid #ddd" }}
            onClick={onClose}
          >
            Continue Ordering Food
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessModal;
