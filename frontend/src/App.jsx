import { useState, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import FoodDetailsModal from "./components/FoodDetailsModal";
import CheckoutModal from "./components/CheckoutModal";
import OrderSuccessModal from "./components/OrderSuccessModal";
import MyOrdersModal from "./components/MyOrdersModal";
import ProfileModal from "./components/ProfileModal";
import AdminModal from "./components/AdminModal";
import RestaurantModal from "./components/RestaurantModal";
import RiderModal from "./components/RiderModal";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import API from "./services/api";
import maskPhoneNumber from "./utils/maskPhone";
import "./App.css";

// Fallback initial food data if API is loading or network offline
const initialFoods = [
  {
    id: 1,
    name: "Cheese Burger",
    category: "Burger",
    price: 149,
    image: "https://images.unsplash.com/photo-1674073117843-5838b44b7ae0?auto=format&fit=crop&w=800&q=80",
    description: "Juicy burger with cheese and fresh vegetables",
    rating: 4.8,
    isAvailable: true,
  },
  {
    id: 2,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 249,
    image: "https://images.unsplash.com/photo-1774806189229-ed02b4f77de1?auto=format&fit=crop&w=800&q=80",
    description: "Classic pizza with tomato, mozzarella and basil",
    rating: 4.9,
    isAvailable: true,
  },
  {
    id: 3,
    name: "Chicken Biryani",
    category: "Biryani",
    price: 199,
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    description: "Aromatic basmati rice with delicious chicken",
    rating: 4.8,
    isAvailable: true,
  },
  {
    id: 4,
    name: "French Fries",
    category: "Snacks",
    price: 99,
    image: "https://images.unsplash.com/photo-1665117861973-fffa50c1afec?auto=format&fit=crop&w=800&q=80",
    description: "Crispy golden fries with special seasoning",
    rating: 4.7,
    isAvailable: true,
  },
  {
    id: 6,
    name: "Cold Coffee",
    category: "Drinks",
    price: 119,
    image: "https://images.unsplash.com/photo-1771405317950-04de06a70166?auto=format&fit=crop&w=800&q=80",
    description: "Chilled creamy coffee with chocolate",
    rating: 4.9,
    isAvailable: true,
  },
];

function App() {
  const { user, logout, isAdmin, isRestaurant, isRider, isCustomer } = useAuth();
  const {
    cart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    calculateSubtotal,
    calculateTotal,
    deliveryCharge,
    totalCount,
  } = useCart();

  // Navigation & Modals
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showDetailsFood, setShowDetailsFood] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showRestaurant, setShowRestaurant] = useState(false);
  const [showRider, setShowRider] = useState(false);

  // Dynamic Data from Backend API
  const [foods, setFoods] = useState(initialFoods);
  const [categories, setCategories] = useState([
    "All",
    "Burger",
    "Pizza",
    "Biryani",
    "Snacks",
    "Drinks",
  ]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loadingFoods, setLoadingFoods] = useState(true);

  // Fetch foods and categories from backend
  const fetchData = async () => {
    try {
      setLoadingFoods(true);
      const [foodsRes, catsRes] = await Promise.all([
        API.get("/foods"),
        API.get("/categories"),
      ]);

      if (foodsRes.data && foodsRes.data.length > 0) {
        setFoods(foodsRes.data);
      }

      if (catsRes.data && catsRes.data.length > 0) {
        const catNames = ["All", ...catsRes.data.map((c) => c.name)];
        setCategories(catNames);
      }
    } catch (err) {
      console.warn("Using offline food fallback:", err.message);
    } finally {
      setLoadingFoods(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const filteredFoods = foods.filter((food) => {
    const categoryMatch =
      category === "All" ||
      food.category?.toLowerCase() === category.toLowerCase();

    const searchMatch =
      food.name?.toLowerCase().includes(search.toLowerCase()) ||
      food.description?.toLowerCase().includes(search.toLowerCase()) ||
      food.category?.toLowerCase().includes(search.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const handleOrderSuccess = (order) => {
    setShowCheckout(false);
    setPlacedOrder(order);
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">
          <h2>FoodieHub</h2>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <a href="#home">Home</a>
          <a href="#menu">Menu</a>
          <a href="#about">About</a>
        </nav>

        {/* Header Right Actions */}
        <div className="nav-actions">
          {/* Desktop User Actions */}
          {user ? (
            <div className="desktop-user-actions">
              <span className="user-greeting">Welcome, {user.name}</span>

              {isRestaurant && (
                <button
                  className="nav-admin-btn"
                  title="Kitchen & Food Preparation Portal"
                  onClick={() => setShowRestaurant(true)}
                  style={{ background: "#e65100", borderColor: "#e65100" }}
                >
                  Kitchen
                </button>
              )}

              {isRider && (
                <button
                  className="nav-admin-btn"
                  title="Delivery Partner Portal"
                  onClick={() => setShowRider(true)}
                  style={{ background: "#1565c0", borderColor: "#1565c0" }}
                >
                  Deliveries
                </button>
              )}

              {isAdmin && (
                <button
                  className="nav-admin-btn"
                  title="Admin Dashboard"
                  onClick={() => setShowAdmin(true)}
                >
                  Admin
                </button>
              )}

              <button
                className="nav-icon-btn"
                title="My Orders"
                onClick={() => setShowOrders(true)}
              >
                Orders
              </button>

              <button
                className="nav-icon-btn"
                title="Profile"
                onClick={() => setShowProfile(true)}
              >
                Profile
              </button>

              <button className="login-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button
              className="login-btn desktop-login-btn"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          )}

          {/* Cart Button (Always visible on Desktop & Mobile) */}
          <a href="#cart" className="cart-nav-link" aria-label="View Cart">
            <button className="cart-btn">
              <span className="cart-label-text">Cart</span>{" "}
              <span className="cart-badge">{totalCount}</span>
            </button>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-nav-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <div className="logo">
                <h2>FoodieHub</h2>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-drawer-links">
              <a
                href="#home"
                className="drawer-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#menu"
                className="drawer-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Menu
              </a>
              <a
                href="#about"
                className="drawer-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </a>

              <hr className="drawer-divider" />

              {user ? (
                <>
                  <div className="drawer-user-info">
                    <span className="user-info-label">Logged in as:</span>
                    <strong className="user-info-name">Welcome, {user.name}</strong>
                    {user.email && (
                      <span className="user-info-email">{user.email}</span>
                    )}
                  </div>

                  {isRestaurant && (
                    <button
                      className="drawer-action-btn admin-btn-highlight"
                      style={{ background: "#e65100", color: "white", borderColor: "#e65100" }}
                      onClick={() => {
                        setShowRestaurant(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Restaurant Kitchen Portal
                    </button>
                  )}

                  {isRider && (
                    <button
                      className="drawer-action-btn admin-btn-highlight"
                      style={{ background: "#1565c0", color: "white", borderColor: "#1565c0" }}
                      onClick={() => {
                        setShowRider(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Delivery Partner Portal
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      className="drawer-action-btn admin-btn-highlight"
                      onClick={() => {
                        setShowAdmin(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    className="drawer-action-btn"
                    onClick={() => {
                      setShowOrders(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    My Orders
                  </button>

                  <button
                    className="drawer-action-btn"
                    onClick={() => {
                      setShowProfile(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    My Profile
                  </button>

                  <button
                    className="drawer-action-btn logout-btn-highlight"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  className="drawer-action-btn login-btn-highlight"
                  onClick={() => {
                    setShowLogin(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Login / Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showLogin && (
        <Login
          onLoginSuccess={() => setShowLogin(false)}
          onSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showSignup && (
        <Signup
          onSignupSuccess={() => {
            setShowSignup(false);
          }}
          onLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onClose={() => setShowSignup(false)}
        />
      )}

      {showDetailsFood && (
        <FoodDetailsModal
          food={showDetailsFood}
          onClose={() => setShowDetailsFood(null)}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          onClose={() => setPlacedOrder(null)}
          onViewOrders={() => {
            setPlacedOrder(null);
            setShowOrders(true);
          }}
        />
      )}

      {showOrders && <MyOrdersModal onClose={() => setShowOrders(false)} />}

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}

      {showRestaurant && (
        <RestaurantModal onClose={() => setShowRestaurant(false)} />
      )}

      {showRider && <RiderModal onClose={() => setShowRider(false)} />}

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="small-title">Delicious food, delivered fast</p>

          <h1>
            Your Favorite Food,
            <br />
            <span>Just One Click Away!</span>
          </h1>

          <p className="hero-text">
            Order delicious meals from your favorite restaurants and enjoy them at
            your doorstep.
          </p>

          <a href="#menu" className="order-btn">
            Order Now →
          </a>
        </div>

        <div className="hero-food">
          <img src="/hero-chef.png" alt="FoodieHub Owner and Chef" />
        </div>
      </section>

      {/* MENU SECTION */}
      <section className="menu-section" id="menu">
        <div className="section-heading">
          <div>
            <p className="small-title">OUR MENU</p>
            <h2>Explore Delicious Food</h2>
          </div>

          <div className="search-wrapper">
            <input
              type="text"
              className="food-search-input"
              placeholder="Search for your favorite food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* CATEGORIES (Horizontally scrollable on mobile) */}
        <div className="categories">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* FOOD GRID */}
        {loadingFoods ? (
          <div className="loading-state" style={{ padding: "40px", textAlign: "center" }}>
            Loading fresh FoodieHub menu...
          </div>
        ) : filteredFoods.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>No food found matching your search.</p>
          </div>
        ) : (
          <div className="food-grid">
            {filteredFoods.map((food) => {
              const foodId = food._id || food.id;
              const isUnavailable = food.isAvailable === false;

              return (
                <div className="food-card" key={foodId}>
                  <div
                    className="food-image"
                    onClick={() => setShowDetailsFood(food)}
                    style={{ cursor: "pointer" }}
                    title="Click to view full details"
                  >
                    <img src={food.image} alt={food.name} />
                  </div>

                  <div className="food-info">
                    <span className="food-category">{food.category}</span>

                    <h3
                      onClick={() => setShowDetailsFood(food)}
                      style={{ cursor: "pointer" }}
                    >
                      {food.name}
                    </h3>

                    <p>{food.description}</p>

                    <div className="food-bottom">
                      <div className="food-price-rating">
                        <strong>₹{food.price}</strong>
                        {food.rating && (
                          <span className="food-card-rating">
                            Rating: {food.rating}
                          </span>
                        )}
                      </div>

                      <div className="food-card-actions">
                        <button
                          type="button"
                          className="details-trigger-btn"
                          onClick={() => setShowDetailsFood(food)}
                          title="View Details & Ingredients"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          disabled={isUnavailable}
                          className={isUnavailable ? "food-card-soldout" : ""}
                          onClick={() => addToCart(food)}
                        >
                          {isUnavailable ? "Sold Out" : "+ Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CART SECTION */}
      <section className="cart-section" id="cart">
        <div>
          <p className="small-title">YOUR CART</p>
          <h2>Order Summary</h2>
        </div>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty. Please add items from the menu.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => {
                const itemId = item._id || item.id;
                return (
                  <div className="cart-item" key={`${itemId}-${index}`}>
                    <div className="cart-item-info">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-thumb"
                      />
                      <span className="cart-item-name">{item.name}</span>
                    </div>

                    <div className="cart-qty-ctrls">
                      <button onClick={() => decreaseQuantity(itemId)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(itemId)}>+</button>
                    </div>

                    <strong className="cart-item-price">
                      ₹{item.price * item.quantity}
                    </strong>

                    <button
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(itemId)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-total">
              <div className="cart-bill-details">
                <div className="bill-row">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal()}</span>
                </div>
                <div className="bill-row">
                  <span>Delivery Charge:</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="bill-row bill-grand-total">
                  <h3>Total:</h3>
                  <h3>₹{calculateTotal()}</h3>
                </div>
              </div>

              <button
                className="checkout-btn"
                onClick={() => {
                  if (!user) {
                    setShowLogin(true);
                  } else {
                    setShowCheckout(true);
                  }
                }}
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer id="about" className="main-footer">
        <div className="footer-columns">
          <div className="footer-col brand-col">
            <div className="logo" style={{ marginBottom: "10px" }}>
              <h2 style={{ color: "#ff5a1f" }}>FoodieHub</h2>
            </div>
            <p>
              Delicious meals from your favorite local kitchens delivered hot and
              fresh to your doorstep.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#menu">Our Menu</a>
            <a href="#about">About FoodieHub</a>
          </div>

          <div className="footer-col">
            <h4>Customer</h4>
            <button
              className="footer-link-btn"
              onClick={() => (user ? setShowOrders(true) : setShowLogin(true))}
            >
              My Orders
            </button>
            <button
              className="footer-link-btn"
              onClick={() => (user ? setShowProfile(true) : setShowLogin(true))}
            >
              Customer Profile
            </button>
            <a href="#cart">Shopping Cart</a>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <p>Address: Market Road, Akole, Maharashtra</p>
            <p>Phone: {maskPhoneNumber(import.meta.env.VITE_CONTACT_PHONE || "+91 84211 00***")}</p>
            <p>Email: support@foodiehub.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 FoodieHub. All rights reserved. | BCS & MCA Project</p>
        </div>
      </footer>
    </div>
  );
}

export default App;