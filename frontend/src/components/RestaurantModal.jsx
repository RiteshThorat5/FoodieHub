import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import maskPhoneNumber from "../utils/maskPhone";

function RestaurantModal({ onClose }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active"); // active, ready, completed
  const [feedback, setFeedback] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/restaurant/kitchen");
      setOrders(res.data);
    } catch (err) {
      setFeedback("Failed to load kitchen orders: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/restaurant-status`, {
        orderStatus: newStatus,
      });
      setFeedback(`Order status set to "${newStatus}".`);
      fetchOrders();
    } catch (err) {
      setFeedback("Update failed: " + err.message);
    }
  };

  const activeOrders = orders.filter((o) =>
    ["Pending", "Accepted", "Preparing"].includes(o.orderStatus)
  );
  const readyOrders = orders.filter((o) =>
    ["Ready for Pickup", "Rider Assigned"].includes(o.orderStatus)
  );
  const completedOrders = orders.filter((o) =>
    ["Picked Up", "Out for Delivery", "Delivered", "Completed", "Cancelled"].includes(
      o.orderStatus
    )
  );

  const displayedOrders =
    filter === "active"
      ? activeOrders
      : filter === "ready"
      ? readyOrders
      : completedOrders;

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
            <h2>FoodieHub Restaurant & Kitchen Portal</h2>
          </div>
          <p className="login-subtitle">
            Welcome, {user?.name || "Samarth"} | Manage incoming tickets, cooking preparation and handoff
          </p>
        </div>

        {feedback && <div className="admin-feedback-bar">{feedback}</div>}

        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active Kitchen Tickets ({activeOrders.length})
          </button>
          <button
            className={`admin-tab-btn ${filter === "ready" ? "active" : ""}`}
            onClick={() => setFilter("ready")}
          >
            Ready for Pickup ({readyOrders.length})
          </button>
          <button
            className={`admin-tab-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed / Dispatched ({completedOrders.length})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading kitchen queue...</div>
        ) : displayedOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>No orders in this stage right now.</p>
          </div>
        ) : (
          <div className="orders-scroll-list">
            {displayedOrders.map((ord) => (
              <div key={ord._id} className="order-card-item">
                <div className="order-item-header">
                  <div>
                    <strong>
                      Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                    </strong>
                    <div className="order-date">
                      Placed: {new Date(ord.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <span
                    className={`status-badge ${
                      ord.orderStatus === "Pending"
                        ? "status-pending"
                        : ord.orderStatus === "Preparing"
                        ? "status-preparing"
                        : ord.orderStatus === "Ready for Pickup"
                        ? "status-confirmed"
                        : "status-delivered"
                    }`}
                  >
                    ● {ord.orderStatus}
                  </span>
                </div>

                <div className="order-items-mini">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="mini-food-row">
                      <span>
                        <strong>{it.quantity}×</strong> {it.foodName}
                      </span>
                      <span>₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer" style={{ flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div>Customer: <strong>{ord.customerName}</strong> ({maskPhoneNumber(ord.phone)})</div>
                    <small style={{ color: "#777" }}>
                      Delivery: {ord.address?.street}, {ord.address?.city}
                    </small>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {ord.orderStatus === "Pending" && (
                      <button
                        className="details-add-btn"
                        style={{ padding: "8px 14px", fontSize: "13px" }}
                        onClick={() => handleUpdateStatus(ord._id, "Preparing")}
                      >
                        Accept & Start Cooking
                      </button>
                    )}

                    {ord.orderStatus === "Preparing" && (
                      <button
                        className="details-add-btn"
                        style={{
                          background: "#2e7d32",
                          padding: "8px 14px",
                          fontSize: "13px",
                        }}
                        onClick={() =>
                          handleUpdateStatus(ord._id, "Ready for Pickup")
                        }
                      >
                        Mark Ready for Pickup
                      </button>
                    )}

                    {ord.orderStatus === "Ready for Pickup" && (
                      <span style={{ fontSize: "13px", color: "#e65100", fontWeight: "600" }}>
                        Waiting for Delivery Rider to claim...
                      </span>
                    )}

                    {ord.riderName && (
                      <span style={{ fontSize: "13px", color: "#1565c0", fontWeight: "600" }}>
                        Rider: {ord.riderName} ({maskPhoneNumber(ord.riderPhone)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantModal;
