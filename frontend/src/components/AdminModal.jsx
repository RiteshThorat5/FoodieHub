import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import maskPhoneNumber from "../utils/maskPhone";

function AdminModal({ onClose }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("dashboard"); // dashboard, foods, categories, orders, users
  const [stats, setStats] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Food Form state
  const [foodForm, setFoodForm] = useState({
    name: "",
    category: "Burger",
    price: "",
    image: "",
    description: "",
    ingredients: "",
    rating: "4.5",
    isAvailable: true,
  });
  const [editingFoodId, setEditingFoodId] = useState(null);

  // Category Form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
  });

  const loadAllAdminData = async () => {
    setLoading(true);
    setFeedback("");
    try {
      const [statsRes, foodsRes, catsRes, ordersRes, usersRes] = await Promise.all([
        API.get("/orders/stats/dashboard"),
        API.get("/foods"),
        API.get("/categories"),
        API.get("/orders"),
        API.get("/users"),
      ]);
      setStats(statsRes.data);
      setFoods(foodsRes.data);
      setCategories(catsRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setFeedback("Failed to load admin data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Food actions
  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...foodForm,
        price: Number(foodForm.price),
        rating: Number(foodForm.rating),
        ingredients: foodForm.ingredients
          ? foodForm.ingredients.split(",").map((s) => s.trim())
          : [],
      };

      if (editingFoodId) {
        await API.put(`/foods/${editingFoodId}`, payload);
        setFeedback("Food item updated successfully.");
      } else {
        await API.post("/foods", payload);
        setFeedback("Food item added successfully.");
      }

      setEditingFoodId(null);
      setFoodForm({
        name: "",
        category: categories[0]?.name || "Burger",
        price: "",
        image: "",
        description: "",
        ingredients: "",
        rating: "4.5",
        isAvailable: true,
      });
      loadAllAdminData();
    } catch (err) {
      setFeedback("Error saving food: " + err.message);
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      await API.delete(`/foods/${id}`);
      setFeedback("Food deleted successfully.");
      loadAllAdminData();
    } catch (err) {
      setFeedback("Error deleting food: " + err.message);
    }
  };

  const handleToggleFoodAvailability = async (id, currentStatus) => {
    try {
      await API.put(`/foods/${id}/availability`, { isAvailable: !currentStatus });
      loadAllAdminData();
    } catch (err) {
      setFeedback("Error changing availability: " + err.message);
    }
  };

  const startEditFood = (f) => {
    setEditingFoodId(f._id);
    setFoodForm({
      name: f.name,
      category: f.category,
      price: f.price,
      image: f.image,
      description: f.description || "",
      ingredients: f.ingredients ? f.ingredients.join(", ") : "",
      rating: f.rating || 4.5,
      isAvailable: f.isAvailable !== false,
    });
    setTab("foods");
  };

  // Category actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post("/categories", categoryForm);
      setCategoryForm({ name: "", description: "", image: "" });
      setFeedback("Category added successfully.");
      loadAllAdminData();
    } catch (err) {
      setFeedback("Error creating category: " + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      loadAllAdminData();
    } catch (err) {
      setFeedback("Error deleting category: " + err.message);
    }
  };

  // Order actions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setFeedback(`Order status updated to ${newStatus}`);
      loadAllAdminData();
    } catch (err) {
      setFeedback("Error updating order status: " + err.message);
    }
  };

  // User actions
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      setFeedback("User deleted successfully.");
      loadAllAdminData();
    } catch (err) {
      setFeedback("Error deleting user: " + err.message);
    }
  };

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
            <h2>FoodieHub Admin Portal</h2>
          </div>
          <p className="login-subtitle">
            Welcome, {user?.name || "Ritesh"} | Manage foods, categories, orders, customers and business metrics
          </p>
        </div>

        {feedback && <div className="admin-feedback-bar">{feedback}</div>}

        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${tab === "dashboard" ? "active" : ""}`}
            onClick={() => setTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`admin-tab-btn ${tab === "foods" ? "active" : ""}`}
            onClick={() => setTab("foods")}
          >
            Foods ({foods.length})
          </button>
          <button
            className={`admin-tab-btn ${tab === "categories" ? "active" : ""}`}
            onClick={() => setTab("categories")}
          >
            Categories ({categories.length})
          </button>
          <button
            className={`admin-tab-btn ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}
          >
            Orders ({orders.length})
          </button>
          <button
            className={`admin-tab-btn ${tab === "users" ? "active" : ""}`}
            onClick={() => setTab("users")}
          >
            Customers ({users.length})
          </button>
        </div>

        <div className="admin-content-area">
          {loading && <div className="loading-state">Refreshing administrative data...</div>}

          {/* TAB 1: DASHBOARD */}
          {tab === "dashboard" && stats && (
            <div className="admin-dashboard-view">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Customers</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalFoods}</h3>
                  <p>Total Food Items</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalCategories}</h3>
                  <p>Categories</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
                <div className="stat-card highlight-orange">
                  <h3>{stats.pendingOrders}</h3>
                  <p>Pending Orders</p>
                </div>
                <div className="stat-card highlight-green">
                  <h3>{stats.deliveredOrders}</h3>
                  <p>Delivered Orders</p>
                </div>
                <div className="stat-card revenue-card">
                  <h3>₹{stats.totalRevenue}</h3>
                  <p>Delivered Revenue</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.todayOrders}</h3>
                  <p>Today's Orders (₹{stats.todayRevenue})</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE FOODS */}
          {tab === "foods" && (
            <div className="admin-foods-view">
              <div className="admin-form-panel">
                <h3>{editingFoodId ? "Edit Food Item" : "Add New Food Item"}</h3>
                <form onSubmit={handleSaveFood} className="admin-inline-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Farmhouse Pizza"
                        value={foodForm.name}
                        onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        className="admin-select"
                        value={foodForm.category}
                        onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        placeholder="249"
                        value={foodForm.price}
                        onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Image URL *</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={foodForm.image}
                        onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Ingredients (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Cheese, Tomato, Basil"
                        value={foodForm.ingredients}
                        onChange={(e) =>
                          setFoodForm({ ...foodForm, ingredients: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Rating (1-5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={foodForm.rating}
                        onChange={(e) => setFoodForm({ ...foodForm, rating: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="Short appetizing description"
                      value={foodForm.description}
                      onChange={(e) =>
                        setFoodForm({ ...foodForm, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-actions-inline">
                    <button type="submit" className="login-submit admin-save-btn">
                      {editingFoodId ? "Update Food" : "+ Save Food"}
                    </button>
                    {editingFoodId && (
                      <button
                        type="button"
                        className="login-btn cancel-btn"
                        onClick={() => {
                          setEditingFoodId(null);
                          setFoodForm({
                            name: "",
                            category: "Burger",
                            price: "",
                            image: "",
                            description: "",
                            ingredients: "",
                            rating: "4.5",
                            isAvailable: true,
                          });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((f) => (
                      <tr key={f._id}>
                        <td>
                          <img src={f.image} alt={f.name} className="table-thumb" />
                        </td>
                        <td><strong>{f.name}</strong></td>
                        <td>{f.category}</td>
                        <td>₹{f.price}</td>
                        <td>{f.rating || "4.5"}</td>
                        <td>
                          <button
                            className={`toggle-avail-btn ${
                              f.isAvailable !== false ? "avail-active" : "avail-inactive"
                            }`}
                            onClick={() =>
                              handleToggleFoodAvailability(f._id, f.isAvailable !== false)
                            }
                          >
                            {f.isAvailable !== false ? "Available" : "Unavailable"}
                          </button>
                        </td>
                        <td>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => startEditFood(f)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteFood(f._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE CATEGORIES */}
          {tab === "categories" && (
            <div className="admin-categories-view">
              <div className="admin-form-panel">
                <h3>Add New Category</h3>
                <form onSubmit={handleSaveCategory} className="admin-inline-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Chinese"
                        value={categoryForm.name}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        type="text"
                        placeholder="Noodles, Manchurian & Rolls"
                        value={categoryForm.description}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={categoryForm.image}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, image: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <button type="submit" className="login-submit admin-save-btn">
                    + Save Category
                  </button>
                </form>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c._id}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.description || "N/A"}</td>
                        <td>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteCategory(c._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MANAGE ORDERS */}
          {tab === "orders" && (
            <div className="admin-orders-view">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status Flow</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td>
                          <strong>#{o._id.substring(o._id.length - 8).toUpperCase()}</strong>
                        </td>
                        <td>
                          <div>{o.customerName || o.userId?.name || "Customer"}</div>
                          <small style={{ color: "#777" }}>{maskPhoneNumber(o.phone)}</small>
                        </td>
                        <td>
                          {o.items.map((it, i) => (
                            <div key={i} style={{ fontSize: "12px" }}>
                              {it.foodName} × {it.quantity}
                            </div>
                          ))}
                        </td>
                        <td><strong>₹{o.totalAmount}</strong></td>
                        <td>
                          <div>{o.paymentMethod}</div>
                          <small style={{ color: o.paymentStatus === "Paid" ? "green" : "#b78103" }}>
                            ({o.paymentStatus})
                          </small>
                        </td>
                        <td>
                          <select
                            className="order-status-select"
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <small>
                            {new Date(o.createdAt).toLocaleDateString("en-IN")}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: MANAGE USERS */}
          {tab === "users" && (
            <div className="admin-users-view">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.phone ? maskPhoneNumber(u.phone) : "—"}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              u.role === "admin" ? "status-confirmed" : "status-pending"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                        <td>
                          {u.role !== "admin" && (
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteUser(u._id)}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminModal;
