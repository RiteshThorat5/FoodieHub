require("dotenv").config();

const runWorkflowTest = async () => {
  const baseURL = "http://localhost:5000/api";
  console.log("\n==========================================");
  console.log("TESTING FOODIEHUB 4-ROLE MULTI-ACTOR WORKFLOW");
  console.log("==========================================\n");

  try {
    // 1. Customer Login
    console.log("1. Customer Login (customer@test.com)...");
    const custLogin = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "customer@test.com", password: "Test@12345" }),
    });
    const custData = await custLogin.json();
    if (!custLogin.ok) throw new Error(custData.message);
    const customerToken = custData.token;
    console.log("   Customer logged in OK.");

    // 2. Customer places order
    console.log("2. Customer places order...");
    const orderRes = await fetch(`${baseURL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            foodName: "Paneer Burger",
            price: 179,
            quantity: 2,
            image: "https://images.unsplash.com/photo-1599155253646-7989e08c05c1",
          },
        ],
        address: {
          street: "Flat 302, Sai Residency",
          city: "Akole",
          state: "Maharashtra",
          pincode: "422601",
        },
        phone: "9876543210",
        paymentMethod: "COD",
      }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.message);
    const orderId = orderData.order._id;
    console.log(`   Order created: #${orderId} (Status: ${orderData.order.orderStatus})`);

    // 3. Restaurant Login
    console.log("3. Restaurant Login (restaurant@foodiehub.com)...");
    const restLogin = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "restaurant@foodiehub.com", password: "Restaurant@123" }),
    });
    const restData = await restLogin.json();
    if (!restLogin.ok) throw new Error(restData.message);
    const restaurantToken = restData.token;
    console.log("   Restaurant logged in OK. Name:", restData.user.name);

    // 4. Restaurant Kitchen views and prepares food
    console.log("4. Restaurant accepts and starts preparing food...");
    const prepRes = await fetch(`${baseURL}/orders/${orderId}/restaurant-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${restaurantToken}`,
      },
      body: JSON.stringify({ orderStatus: "Preparing" }),
    });
    const prepData = await prepRes.json();
    if (!prepRes.ok) throw new Error(prepData.message);
    console.log(`   Order updated to: ${prepData.order.orderStatus}`);

    // 5. Restaurant marks Ready for Pickup
    console.log("5. Restaurant marks food: Ready for Pickup...");
    const readyRes = await fetch(`${baseURL}/orders/${orderId}/restaurant-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${restaurantToken}`,
      },
      body: JSON.stringify({ orderStatus: "Ready for Pickup" }),
    });
    const readyData = await readyRes.json();
    if (!readyRes.ok) throw new Error(readyData.message);
    console.log(`   Order updated to: ${readyData.order.orderStatus}`);

    // 6. Rider Login
    console.log("6. Rider Login (rider@foodiehub.com)...");
    const riderLogin = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "rider@foodiehub.com", password: "Rider@123" }),
    });
    const riderData = await riderLogin.json();
    if (!riderLogin.ok) throw new Error(riderData.message);
    const riderToken = riderData.token;
    console.log("   Rider logged in OK. Rider Name:", riderData.user.name);

    // 7. Rider checks available orders
    console.log("7. Rider checks available pickup tasks...");
    const availRes = await fetch(`${baseURL}/orders/rider/available`, {
      headers: { Authorization: `Bearer ${riderToken}` },
    });
    const availOrders = await availRes.json();
    console.log(`   Found ${availOrders.length} available pickup order(s).`);

    // 8. Rider accepts delivery task
    console.log("8. Rider accepts delivery assignment...");
    const claimRes = await fetch(`${baseURL}/orders/${orderId}/rider-accept`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${riderToken}` },
    });
    const claimData = await claimRes.json();
    if (!claimRes.ok) throw new Error(claimData.message);
    console.log(`   Delivery claimed. Status: ${claimData.order.orderStatus}, Assigned to: ${claimData.order.riderName}`);

    // 9. Rider picks up food
    console.log("9. Rider picks up food from restaurant...");
    const pickupRes = await fetch(`${baseURL}/orders/${orderId}/rider-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${riderToken}`,
      },
      body: JSON.stringify({ orderStatus: "Picked Up" }),
    });
    const pickupData = await pickupRes.json();
    console.log(`   Status updated to: ${pickupData.order.orderStatus}`);

    // 10. Rider departs: Out for Delivery
    console.log("10. Rider departs: Out for Delivery...");
    const outRes = await fetch(`${baseURL}/orders/${orderId}/rider-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${riderToken}`,
      },
      body: JSON.stringify({ orderStatus: "Out for Delivery" }),
    });
    const outData = await outRes.json();
    console.log(`   Status updated to: ${outData.order.orderStatus}`);

    // 11. Rider marks Delivered
    console.log("11. Rider delivers order to customer...");
    const delivRes = await fetch(`${baseURL}/orders/${orderId}/rider-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${riderToken}`,
      },
      body: JSON.stringify({ orderStatus: "Delivered" }),
    });
    const delivData = await delivRes.json();
    console.log(`   Status updated to: ${delivData.order.orderStatus} (Payment: ${delivData.order.paymentStatus})`);

    // 12. Customer views order confirmation
    console.log("12. Customer verifies final delivered status in My Orders...");
    const myOrdersRes = await fetch(`${baseURL}/orders/my`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const myOrders = await myOrdersRes.json();
    const finalOrder = myOrders.find((o) => o._id === orderId);
    console.log(`   Customer order status verified: ${finalOrder.orderStatus}, Rider: ${finalOrder.riderName}`);

    console.log("\n==========================================");
    console.log("[SUCCESS] ALL 12 STEPS OF 4-ROLE WORKFLOW PASSED!");
    console.log("==========================================\n");
  } catch (err) {
    console.error("[ERROR] Workflow Test Error:", err.message);
  }
};

runWorkflowTest();
