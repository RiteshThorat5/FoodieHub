import { useState } from "react";
import { useAuth } from "./context/AuthContext";

function Signup({ onLogin, onSignupSuccess, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [restaurantName, setRestaurantName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { register } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        restaurantName: role === "restaurant" ? restaurantName : undefined,
        vehicleNumber: role === "rider" ? vehicleNumber : undefined,
      });

      if (onSignupSuccess) {
        onSignupSuccess(user);
      }
    } catch (error) {
      setErrorMsg(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page modal-overlay" onClick={onClose}>
      <div className="login-card" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        )}

        <h1>Create Account</h1>

        <p className="login-subtitle">
          Sign up to start ordering delicious food.
        </p>

        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Register As *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="admin-select"
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
            >
              <option value="customer">Customer (Order Meals)</option>
              <option value="restaurant">Restaurant Partner (Kitchen Portal)</option>
              <option value="rider">Delivery Rider (Delivery Partner)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {role === "restaurant" && (
            <div className="form-group">
              <label>Restaurant / Kitchen Name *</label>
              <input
                type="text"
                placeholder="e.g. FoodieHub Central Kitchen"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>
          )}

          {role === "rider" && (
            <div className="form-group">
              <label>Vehicle Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. MH-17-AB-1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="Create a password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <div className="login-footer">
          Already have an account?{" "}
          <span
            onClick={onLogin}
            style={{
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signup;