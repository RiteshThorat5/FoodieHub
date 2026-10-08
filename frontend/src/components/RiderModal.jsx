import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import maskPhoneNumber from "../utils/maskPhone";

function RiderModal({ onClose }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("active"); // active, available, history
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const loadRiderData = async () => {
    try {
      setLoading(true);
      const [availRes, activeRes] = await Promise.all([
        API.get("/orders/rider/available"),
        API.get("/orders/rider/my-deliveries"),
      ]);
      setAvailableOrders(availRes.data);
      setMyDeliveries(activeRes.data);
    } catch (err) {
      setFeedback("Failed to load rider portal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiderData();
  }, []);

  const handleClaimOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/rider-accept`);
      setFeedback("Delivery assignment accepted.");
      setTab("active");
      loadRiderData();
    } catch (err) {
      setFeedback("Failed to claim delivery: " + err.message);
    }
  };

  const handleUpdateDeliveryStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/rider-status`, {
        orderStatus: newStatus,
      });
      setFeedback(`Status updated: ${newStatus}`);
      loadRiderData();
    } catch (err) {
      setFeedback("Update failed: " + err.message);
    }
  };

  const currentTasks = myDeliveries.filter((o) =>
    ["Rider Assigned", "Picked Up", "Out for Delivery"].includes(o.orderStatus)
  );
  const completedTasks = myDeliveries.filter((o) =>
    ["Delivered", "Completed"].includes(o.orderStatus)
  );

  return (
    <div className="login-page modal-overlay" onClick={onClose}>
      <div
        className="login-card admin-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="admin-header">
          <div className="logo" style={{ marginBottom: "5px" }}>
            <h2>FoodieHub Delivery Partner Portal</h2>
          </div>
          <p className="login-subtitle">
            Welcome, {user?.name || "Vishal"} | Accept pickup tasks, navigate to restaurant and deliver meals safely
          </p>
        </div>

        {feedback && <div className="admin-feedback-bar">{feedback}</div>}

        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${tab === "active" ? "active" : ""}`}
            onClick={() => setTab("active")}
          >
            My Active Deliveries ({currentTasks.length})
          </button>
          <button
            className={`admin-tab-btn ${tab === "available" ? "active" : ""}`}
            onClick={() => setTab("available")}
          >
            Available Pickups ({availableOrders.length})
          </button>
          <button
            className={`admin-tab-btn ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            Completed ({completedTasks.length})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Refreshing delivery feed...</div>
        ) : tab === "available" ? (
          availableOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <p>No orders waiting for pickup at restaurants right now.</p>
            </div>
          ) : (
            <div className="orders-scroll-list">
              {availableOrders.map((ord) => (
                <div key={ord._id} className="order-card-item">
                  <div className="order-item-header">
                    <div>
                      <strong>Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}</strong>
                      <div className="order-date">Kitchen: {ord.restaurantName || "FoodieHub Kitchen"}</div>
                    </div>
                    <span className="status-badge status-confirmed">Ready for Pickup</span>
                  </div>

                  <div className="order-card-footer" style={{ marginTop: "10px" }}>
                    <div>
                      <div>Destination: <strong>{ord.address?.street}, {ord.address?.city}</strong></div>
                      <small style={{ color: "#ff5a1f", fontWeight: "bold" }}>
                        Collect: ₹{ord.totalAmount} ({ord.paymentMethod})
                      </small>
                    </div>

                    <button
                      className="details-add-btn"
                      style={{ padding: "10px 18px", fontSize: "14px" }}
                      onClick={() => handleClaimOrder(ord._id)}
                    >
                      Accept Delivery Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === "active" ? (
          currentTasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <p>You have no ongoing delivery tasks. Check Available Pickups.</p>
              <button
                className="details-trigger-btn"
                style={{ marginTop: "10px" }}
                onClick={() => setTab("available")}
              >
                Browse Available Pickups →
              </button>
            </div>
          ) : (
            <div className="orders-scroll-list">
              {currentTasks.map((ord) => (
                <div key={ord._id} className="order-card-item" style={{ borderLeft: "4px solid #ff5a1f" }}>
                  <div className="order-item-header">
                    <div>
                      <strong>Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}</strong>
                      <div className="order-date">Customer: {ord.customerName} ({maskPhoneNumber(ord.phone)})</div>
                    </div>
                    <span className="status-badge status-out">● {ord.orderStatus}</span>
                  </div>

                  <div className="order-items-mini">
                    <div><strong>Delivery Address:</strong> {ord.address?.street}, {ord.address?.city}, {ord.address?.state} - {ord.address?.pincode}</div>
                    <div style={{ marginTop: "5px" }}>
                      <strong>Payment to Collect:</strong> ₹{ord.totalAmount} ({ord.paymentMethod} - {ord.paymentStatus})
                    </div>
                  </div>

                  <div className="order-card-footer" style={{ marginTop: "12px", gap: "10px", flexWrap: "wrap" }}>
                    {ord.orderStatus === "Rider Assigned" && (
                      <button
                        className="details-add-btn"
                        style={{ padding: "10px 16px", background: "#f57c00" }}
                        onClick={() => handleUpdateDeliveryStatus(ord._id, "Picked Up")}
                      >
                        Confirm Pickup at Restaurant
                      </button>
                    )}

                    {ord.orderStatus === "Picked Up" && (
                      <button
                        className="details-add-btn"
                        style={{ padding: "10px 16px", background: "#1976d2" }}
                        onClick={() => handleUpdateDeliveryStatus(ord._id, "Out for Delivery")}
                      >
                        Depart: Out for Delivery
                      </button>
                    )}

                    {ord.orderStatus === "Out for Delivery" && (
                      <button
                        className="details-add-btn"
                        style={{ padding: "10px 16px", background: "#2e7d32" }}
                        onClick={() => handleUpdateDeliveryStatus(ord._id, "Delivered")}
                      >
                        Mark Order Delivered to Customer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="orders-scroll-list">
            {completedTasks.map((ord) => (
              <div key={ord._id} className="order-card-item">
                <div className="order-item-header">
                  <div>
                    <strong>Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}</strong>
                    <div className="order-date">{new Date(ord.updatedAt).toLocaleString("en-IN")}</div>
                  </div>
                  <span className="status-badge status-delivered">Delivered</span>
                </div>
                <div>Customer: {ord.customerName} | Earned total: ₹{ord.totalAmount}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RiderModal;
