import { useState, useEffect } from "react";
import API from "../services/api";
import maskPhoneNumber from "../utils/maskPhone";

function MyOrdersModal({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/my");
      setOrders(res.data);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Accepted":
      case "Preparing":
        return "status-preparing";
      case "Ready for Pickup":
      case "Rider Assigned":
        return "status-confirmed";
      case "Picked Up":
      case "Out for Delivery":
        return "status-out";
      case "Delivered":
      case "Completed":
        return "status-delivered";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getStageIndex = (status) => {
    switch (status) {
      case "Pending":
        return 1;
      case "Accepted":
      case "Preparing":
        return 2;
      case "Ready for Pickup":
      case "Rider Assigned":
        return 3;
      case "Picked Up":
      case "Out for Delivery":
        return 4;
      case "Delivered":
      case "Completed":
        return 5;
      default:
        return 1;
    }
  };

  const stages = [
    { num: 1, label: "Order Placed", icon: "1" },
    { num: 2, label: "Preparing", icon: "2" },
    { num: 3, label: "Ready Pickup", icon: "3" },
    { num: 4, label: "On the Way", icon: "4" },
    { num: 5, label: "Delivered", icon: "5" },
  ];

  return (
    <div className="login-page modal-overlay" onClick={onClose}>
      <div
        className="login-card orders-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
          <div>
            <h1 style={{ textAlign: "left", margin: "4px 0" }}>My Orders</h1>
            <p className="login-subtitle" style={{ textAlign: "left", margin: 0 }}>
              Live tracking from kitchen to your doorstep
            </p>
          </div>
          <button
            className="details-trigger-btn"
            style={{ marginTop: "10px" }}
            onClick={fetchOrders}
            title="Refresh order status"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading your orders...</div>
        ) : error ? (
          <div className="error-alert">{error}</div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <p>You have not placed any orders yet.</p>
            <button className="order-btn" onClick={onClose}>
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="orders-scroll-list">
            {orders.map((ord) => {
              const currentStage = getStageIndex(ord.orderStatus);
              const isCancelled = ord.orderStatus === "Cancelled";

              return (
                <div key={ord._id} className="order-card-item">
                  <div className="order-item-header">
                    <div>
                      <strong>
                        Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                      </strong>
                      <div className="order-date">
                        {new Date(ord.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                    <span className={`status-badge ${getStatusClass(ord.orderStatus)}`}>
                      ● {ord.orderStatus}
                    </span>
                  </div>

                  {/* Multi-role Live Tracking Pipeline */}
                  {!isCancelled ? (
                    <div className="order-tracker-timeline">
                      {stages.map((st) => {
                        const isDone = currentStage > st.num;
                        const isActive = currentStage === st.num;
                        const stepClass = isDone
                          ? "completed"
                          : isActive
                          ? "active"
                          : "";

                        return (
                          <div key={st.num} className={`tracker-step ${stepClass}`}>
                            <div className="tracker-circle">
                              {isDone ? "✓" : st.icon}
                            </div>
                            <span className="tracker-label">{st.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="error-alert" style={{ margin: "10px 0" }}>
                      This order was cancelled.
                    </div>
                  )}

                  {/* Rider & Kitchen Meta if assigned */}
                  {(ord.restaurantName || ord.riderName) && (
                    <div
                      style={{
                        background: "#fbfbfb",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        margin: "10px 0",
                        fontSize: "13px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {ord.restaurantName && (
                        <div>
                          <strong>Kitchen:</strong> {ord.restaurantName}
                        </div>
                      )}
                      {ord.riderName && (
                        <div style={{ color: "#1565c0" }}>
                          <strong>Assigned Rider:</strong> {ord.riderName}{" "}
                          {ord.riderPhone ? `(Phone: ${maskPhoneNumber(ord.riderPhone)})` : ""}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="order-items-mini">
                    {ord.items.map((item, i) => (
                      <div key={i} className="mini-food-row">
                        <span>
                          {item.foodName} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="footer-meta">
                      <span>Payment: {ord.paymentMethod} ({ord.paymentStatus})</span>
                      <span>
                        Delivery to: {ord.address?.street}, {ord.address?.city}
                      </span>
                    </div>
                    <div className="footer-total">
                      Total: <strong>₹{ord.totalAmount}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersModal;
