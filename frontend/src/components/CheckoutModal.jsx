import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../services/api";

function CheckoutModal({ onClose, onOrderSuccess }) {
  const { user } = useAuth();
  const { cart, calculateSubtotal, calculateTotal, deliveryCharge, clearCart } =
    useCart();

  const [phone, setPhone] = useState(user?.phone || "");
  const [street, setStreet] = useState(user?.address?.street || "");
  const [city, setCity] = useState(user?.address?.city || "Akole");
  const [state, setState] = useState(user?.address?.state || "Maharashtra");
  const [pincode, setPincode] = useState(user?.address?.pincode || "422601");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!phone || phone.trim().length < 10) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!street || !city || !pincode) {
      setErrorMsg("Please complete all required address fields.");
      return;
    }

    if (cart.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          foodId: item._id || item.id,
          foodName: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        address: {
          street,
          city,
          state,
          pincode,
        },
        phone,
        paymentMethod,
      };

      const res = await API.post("/orders", orderData);
      clearCart();
      onOrderSuccess(res.data.order);
    } catch (err) {
      setErrorMsg(err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page modal-overlay" onClick={onClose}>
      <div
        className="login-card checkout-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <h1>Checkout</h1>
        <p className="login-subtitle">
          Confirm your delivery address & payment method
        </p>

        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        <form onSubmit={handlePlaceOrder}>
          <div className="form-group">
            <label>Customer Name</label>
            <input type="text" value={user?.name || ""} disabled />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Street Address / House No. *</label>
            <input
              type="text"
              placeholder="e.g. Flat 204, Green Heights, Station Road"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="payment-method-group">
            <label>Payment Method</label>
            <div className="payment-options">
              <label className="payment-radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <span>Cash on Delivery (COD)</span>
              </label>

              <label className="payment-radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online"
                  checked={paymentMethod === "Online"}
                  onChange={() => setPaymentMethod("Online")}
                />
                <span>Online Payment (Sandbox)</span>
              </label>
            </div>
          </div>

          <div className="checkout-summary">
            <div className="summary-row">
              <span>Items Subtotal:</span>
              <span>₹{calculateSubtotal()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charge:</span>
              <span>₹{deliveryCharge}</span>
            </div>
            <div className="summary-row total-row">
              <strong>Order Total:</strong>
              <strong>₹{calculateTotal()}</strong>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={submitting}
          >
            {submitting ? "Placing Order..." : `Place Order (₹${calculateTotal()}) →`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutModal;
