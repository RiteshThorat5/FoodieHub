import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("foodiehub_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("foodiehub_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (food, quantity = 1) => {
    if (food.isAvailable === false) {
      alert("This item is currently unavailable.");
      return;
    }

    setCart((prevCart) => {
      const foodId = food._id || food.id;
      const existingIndex = prevCart.findIndex(
        (item) => (item._id || item.id) === foodId
      );

      if (existingIndex !== -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      } else {
        return [
          ...prevCart,
          {
            ...food,
            quantity: Math.max(1, quantity),
          },
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) =>
      prevCart.filter((item) => (item._id || item.id) !== id)
    );
  };

  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item._id || item.id) === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if ((item._id || item.id) === id) {
          const newQty = item.quantity - 1;
          return newQty >= 1 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const deliveryCharge = cart.length > 0 ? 40 : 0;

  const calculateTotal = () => {
    return calculateSubtotal() + deliveryCharge;
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        calculateSubtotal,
        calculateTotal,
        deliveryCharge,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
