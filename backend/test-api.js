require("dotenv").config();
const http = require("http");
const connectDB = require("./config/db");
const app = require("express")();
const cors = require("cors");
const express = require("express");

// Route imports
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "OK" }));
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use(notFound);
app.use(errorHandler);

const runTests = async () => {
  await connectDB();
  const server = app.listen(5005);
  const baseURL = "http://localhost:5005/api";

  console.log("\n--- RUNNING BACKEND API TESTS ---");

  try {
    // 1. Test Customer Login
    console.log("1. Testing Customer Login...");
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@test.com",
        password: "Test@12345",
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(`Customer Login Failed: ${loginData.message}`);
    const customerToken = loginData.token;
    console.log("   Customer Login PASSED. Token received.");

    // 2. Test Admin Login
    console.log("2. Testing Admin Login...");
    const adminLoginRes = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@foodiehub.com",
        password: "Admin@12345",
      }),
    });
    const adminData = await adminLoginRes.json();
    if (!adminLoginRes.ok) throw new Error(`Admin Login Failed: ${adminData.message}`);
    const adminToken = adminData.token;
    console.log("   Admin Login PASSED. Role:", adminData.user.role);

    // 3. Test /api/auth/me
    console.log("3. Testing GET /api/auth/me...");
    const meRes = await fetch(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const meData = await meRes.json();
    if (!meRes.ok) throw new Error(`Auth Me Failed: ${meData.message}`);
    console.log("   Auth Me PASSED for user:", meData.name);

    // 4. Test GET /api/foods
    console.log("4. Testing GET /api/foods...");
    const foodsRes = await fetch(`${baseURL}/foods`);
    const foods = await foodsRes.json();
    if (!foodsRes.ok) throw new Error("Foods fetch failed");
    console.log(`   GET Foods PASSED. Total items: ${foods.length}`);

    // 5. Test GET /api/categories
    console.log("5. Testing GET /api/categories...");
    const catsRes = await fetch(`${baseURL}/categories`);
    const cats = await catsRes.json();
    if (!catsRes.ok) throw new Error("Categories fetch failed");
    console.log(`   GET Categories PASSED. Total categories: ${cats.length}`);

    // 6. Test Create Order
    console.log("6. Testing POST /api/orders (Create Order)...");
    const testFood = foods[0];
    const orderRes = await fetch(`${baseURL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            foodId: testFood._id,
            foodName: testFood.name,
            price: testFood.price,
            quantity: 2,
            image: testFood.image,
          },
        ],
        address: {
          street: "123 MG Road",
          city: "Akole",
          state: "Maharashtra",
          pincode: "422601",
        },
        phone: "9876543210",
        paymentMethod: "COD",
      }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(`Order placement failed: ${orderData.message}`);
    console.log("   Create Order PASSED. Order ID:", orderData.order._id, "Total:", orderData.order.totalAmount);

    // 7. Test Customer GET /api/orders/my
    console.log("7. Testing GET /api/orders/my...");
    const myOrdersRes = await fetch(`${baseURL}/orders/my`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const myOrders = await myOrdersRes.json();
    if (!myOrdersRes.ok) throw new Error("My Orders failed");
    console.log(`   My Orders PASSED. Orders count: ${myOrders.length}`);

    // 8. Test Admin Dashboard Stats
    console.log("8. Testing GET /api/orders/stats/dashboard (Admin)...");
    const statsRes = await fetch(`${baseURL}/orders/stats/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const stats = await statsRes.json();
    if (!statsRes.ok) throw new Error("Dashboard stats failed");
    console.log("   Admin Stats PASSED:", stats);

    console.log("\n[SUCCESS] ALL 8 REST API TESTS PASSED SUCCESSFULLY!\n");
  } catch (err) {
    console.error("[ERROR] Test Error:", err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
};

runTests();
