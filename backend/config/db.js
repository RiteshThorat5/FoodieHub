const mongoose = require("mongoose");

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;
  const localUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/foodiehub";

  // Attempt Atlas connection if configured
  if (atlasUri) {
    try {
      console.log("Connecting to MongoDB Atlas...");
      const conn = await mongoose.connect(atlasUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(` MongoDB Atlas Connected: ${conn.connection.host}`);
      return conn;
    } catch (atlasError) {
      console.warn(" MongoDB Atlas connection notice:", atlasError.message);
      console.warn("Falling back to local MongoDB server (127.0.0.1:27017)...");
    }
  }

  // Fallback to local MongoDB
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(` Local MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (localError) {
    console.error(" MongoDB Connection Failed completely:", localError.message);
    process.exit(1);
  }
};

module.exports = connectDB;
