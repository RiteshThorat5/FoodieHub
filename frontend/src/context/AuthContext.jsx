import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("foodiehub_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("foodiehub_token") || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("foodiehub_token");
      if (savedToken) {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data);
          localStorage.setItem("foodiehub_user", JSON.stringify(res.data));
        } catch (err) {
          console.warn("Session expired or invalid, logging out:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem("foodiehub_token", receivedToken);
    localStorage.setItem("foodiehub_user", JSON.stringify(receivedUser));

    return receivedUser;
  };

  const register = async (userData) => {
    const res = await API.post("/auth/register", userData);
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem("foodiehub_token", receivedToken);
    localStorage.setItem("foodiehub_user", JSON.stringify(receivedUser));

    return receivedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("foodiehub_token");
    localStorage.removeItem("foodiehub_user");
  };

  const updateProfile = async (profileData) => {
    if (!user?._id) return;
    const res = await API.put(`/users/${user._id}`, profileData);
    const updated = res.data.user;
    setUser(updated);
    localStorage.setItem("foodiehub_user", JSON.stringify(updated));
    return updated;
  };

  const isAdmin = user?.role === "admin";
  const isRestaurant = user?.role === "restaurant";
  const isRider = user?.role === "rider";
  const isCustomer = user?.role === "customer" || (!isAdmin && !isRestaurant && !isRider);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
        isRestaurant,
        isRider,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
