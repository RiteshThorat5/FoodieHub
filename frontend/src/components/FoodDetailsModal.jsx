import { useState } from "react";
import { useCart } from "../context/CartContext";

function FoodDetailsModal({ food, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!food) return null;

  const handleAddToCart = () => {
    addToCart(food, quantity);
    onClose();
  };

  return (
    <div className="login-page modal-overlay" onClick={onClose}>
      <div
        className="login-card food-details-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="food-details-header">
          <div className="details-img-container">
            <img src={food.image} alt={food.name} />
            <span
              className={`details-badge ${
                food.isAvailable !== false ? "badge-available" : "badge-unavailable"
              }`}
            >
              {food.isAvailable !== false ? "Available" : "Currently Unavailable"}
            </span>
          </div>

          <div className="details-header-text">
            <span className="food-category">{food.category}</span>
            <h2>{food.name}</h2>
            <div className="details-rating">
              Rating: {food.rating ? food.rating.toFixed(1) : "4.5"} / 5.0
            </div>
            <p className="details-price">₹{food.price}</p>
          </div>
        </div>

        <div className="details-body">
          <p className="details-description">{food.description}</p>

          {food.ingredients && food.ingredients.length > 0 && (
            <div className="details-ingredients">
              <strong>Ingredients:</strong>
              <div className="ingredient-tags">
                {food.ingredients.map((ing, idx) => (
                  <span key={idx} className="ingredient-tag">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {food.isAvailable !== false ? (
            <div className="details-actions">
              <div className="qty-selector">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <button className="details-add-btn" onClick={handleAddToCart}>
                Add to Cart (₹{food.price * quantity})
              </button>
            </div>
          ) : (
            <div className="unavailable-notice">
              This item is currently sold out. Please check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodDetailsModal;
