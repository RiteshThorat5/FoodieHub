import { useState } from "react";
import { useAuth } from "./context/AuthContext";

function Login({ onLoginSuccess, onSignup, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error) {
      setErrorMsg(error.message || "Invalid email or password.");
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

        <h1>Welcome Back</h1>

        <p className="login-subtitle">
          Login to continue ordering delicious food.
        </p>

        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <div style={{ marginTop: "18px", padding: "12px", background: "#fafafa", borderRadius: "8px", border: "1px solid #eee" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", fontWeight: "600", textAlign: "center" }}>
            Select Demo Role:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              type="button"
              className="action-btn edit-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setEmail("customer@test.com"); setPassword("Test@12345"); }}
            >
              Customer
            </button>
            <button
              type="button"
              className="action-btn edit-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setEmail("restaurant@foodiehub.com"); setPassword("Restaurant@123"); }}
            >
              Restaurant
            </button>
            <button
              type="button"
              className="action-btn edit-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setEmail("rider@foodiehub.com"); setPassword("Rider@123"); }}
            >
              Rider
            </button>
            <button
              type="button"
              className="action-btn edit-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setEmail("admin@foodiehub.com"); setPassword("Admin@12345"); }}
            >
              Admin
            </button>
          </div>
        </div>

        <div className="login-footer">
          Don't have an account?{" "}
          <span
            onClick={onSignup}
            style={{
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;