import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function ProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [street, setStreet] = useState(user?.address?.street || "");
  const [city, setCity] = useState(user?.address?.city || "");
  const [state, setState] = useState(user?.address?.state || "");
  const [pincode, setPincode] = useState(user?.address?.pincode || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");

    try {
      await updateProfile({
        name,
        phone,
        address: {
          street,
          city,
          state,
          pincode,
        },
      });
      setMsg("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page modal-overlay" onClick={onClose}>
      <div
        className="login-card profile-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <h1>My Profile</h1>
        <p className="login-subtitle">Manage your personal and delivery information</p>

        {msg && <div className="success-alert">{msg}</div>}
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Email (read-only)</label>
            <input type="email" value={user?.email || ""} disabled />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              placeholder="e.g. 123 Main Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Saving Changes..." : "Save Profile Details →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
