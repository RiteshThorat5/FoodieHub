const jwt = require("jsonwebtoken");

const generateToken = (id, role = "customer") => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "foodiehub_fallback_jwt_secret_key_123",
    {
      expiresIn: "30d",
    }
  );
};

module.exports = generateToken;
