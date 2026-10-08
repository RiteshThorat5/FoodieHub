require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Food = require("./models/Food");
const Category = require("./models/Category");
const connectDB = require("./config/db");

const seedData = async () => {
  try {
    await connectDB();

    console.log("Seeding FoodieHub database...");

    // 1. Clear existing foods and categories
    await Food.deleteMany({});
    await Category.deleteMany({});

    // 2. Seed Admin & Customer if they don't already exist
    const adminExists = await User.findOne({ email: "admin@foodiehub.com" });
    if (!adminExists) {
      await User.create({
        name: "Ritesh",
        email: "admin@foodiehub.com",
        password: "Admin@12345", // Will be hashed by User pre-save hook
        phone: "9876543211",
        role: "admin",
        address: {
          street: "FoodieHub HQ, Market Road",
          city: "Akole",
          state: "Maharashtra",
          pincode: "422601",
        },
      });
      console.log("[Seed] Admin account created: admin@foodiehub.com");
    } else {
      await User.updateOne({ email: "admin@foodiehub.com" }, { $set: { name: "Ritesh" } });
      console.log("[Seed] Admin account updated to Ritesh");
    }

    const customerExists = await User.findOne({ email: "customer@test.com" });
    if (!customerExists) {
      await User.create({
        name: "Roshan",
        email: "customer@test.com",
        password: "Test@12345", // Will be hashed by User pre-save hook
        phone: "9876543210",
        role: "customer",
        address: {
          street: "123 MG Road",
          city: "Akole",
          state: "Maharashtra",
          pincode: "422601",
        },
      });
      console.log("[Seed] Customer account created: customer@test.com");
    } else {
      await User.updateOne({ email: "customer@test.com" }, { $set: { name: "Roshan" } });
      console.log("[Seed] Customer account updated to Roshan");
    }

    const restaurantExists = await User.findOne({ email: "restaurant@foodiehub.com" });
    if (!restaurantExists) {
      await User.create({
        name: "Samarth",
        email: "restaurant@foodiehub.com",
        password: "Restaurant@123",
        phone: "9876543222",
        role: "restaurant",
        restaurantName: "Samarth Kitchen",
        address: {
          street: "Central Kitchen 4, Station Road",
          city: "Akole",
          state: "Maharashtra",
          pincode: "422601",
        },
      });
      console.log("[Seed] Restaurant account created: restaurant@foodiehub.com");
    } else {
      await User.updateOne({ email: "restaurant@foodiehub.com" }, { $set: { name: "Samarth", restaurantName: "Samarth Kitchen" } });
      console.log("[Seed] Restaurant account updated to Samarth");
    }

    const riderExists = await User.findOne({ email: "rider@foodiehub.com" });
    if (!riderExists) {
      await User.create({
        name: "Vishal",
        email: "rider@foodiehub.com",
        password: "Rider@123",
        phone: "9876543233",
        role: "rider",
        vehicleNumber: "MH-15-EV-4422",
        address: {
          street: "Rider Hub, Market Road",
          city: "Akole",
          state: "Maharashtra",
          pincode: "422601",
        },
      });
      console.log("[Seed] Rider account created: rider@foodiehub.com");
    } else {
      await User.updateOne({ email: "rider@foodiehub.com" }, { $set: { name: "Vishal" } });
      console.log("[Seed] Rider account updated to Vishal");
    }

    // 3. Seed Categories
    const categories = [
      {
        name: "Burger",
        description: "Juicy, grilled, and crunchy gourmet burgers",
        image: "https://images.unsplash.com/photo-1674073117843-5838b44b7ae0?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Pizza",
        description: "Freshly baked Italian crusts with rich toppings & mozzarella",
        image: "https://images.unsplash.com/photo-1774806189229-ed02b4f77de1?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Biryani",
        description: "Royal aromatic basmati rice cooked with authentic spices",
        image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Snacks",
        description: "Crispy appetizers, fries, samosas & quick bites",
        image: "https://images.unsplash.com/photo-1665117861973-fffa50c1afec?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Drinks",
        description: "Refreshing cold shakes, sodas, mojitos & cold coffees",
        image: "https://images.unsplash.com/photo-1771405317950-04de06a70166?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Desserts",
        description: "Sweet treats, cakes, brownies & Indian delicacies",
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
      },
    ];

    await Category.insertMany(categories);
    console.log(` Seeded ${categories.length} categories`);

    // 4. Seed Foods (Preserving all original items from App.jsx + full metadata)
    const foods = [
      // BURGERS
      {
        name: "Cheese Burger",
        category: "Burger",
        price: 149,
        image: "https://images.unsplash.com/photo-1674073117843-5838b44b7ae0?auto=format&fit=crop&w=800&q=80",
        description: "Juicy burger with cheese and fresh vegetables",
        ingredients: ["Bun", "Cheese Slice", "Vegetable Patty", "Lettuce", "Mayonnaise"],
        rating: 4.8,
        isAvailable: true,
      },
      {
        name: "Chicken Burger",
        category: "Burger",
        price: 159,
        image: "https://images.unsplash.com/photo-1766589221110-b19445b6d677?auto=format&fit=crop&w=800&q=80",
        description: "Crispy chicken patty with fresh vegetables",
        ingredients: ["Bun", "Chicken Patty", "Crispy Onions", "Special Sauce"],
        rating: 4.7,
        isAvailable: true,
      },
      {
        name: "Veg Burger",
        category: "Burger",
        price: 129,
        image: "https://images.unsplash.com/photo-1465799411029-5a317ff17837?auto=format&fit=crop&w=800&q=80",
        description: "Delicious veggie patty with fresh vegetables",
        ingredients: ["Bun", "Potato & Pea Patty", "Tomato", "Lettuce", "Herb Sauce"],
        rating: 4.5,
        isAvailable: true,
      },
      {
        name: "Double Cheese Burger",
        category: "Burger",
        price: 199,
        image: "https://images.unsplash.com/photo-1572448862527-d3c904757de6?auto=format&fit=crop&w=800&q=80",
        description: "Double patty burger with extra melted cheese",
        ingredients: ["Bun", "Double Patties", "Double Cheddar Cheese", "Pickles"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "BBQ Burger",
        category: "Burger",
        price: 169,
        image: "https://images.unsplash.com/photo-1521294102048-6cb73602dc43?auto=format&fit=crop&w=800&q=80",
        description: "Smoky BBQ burger with fresh vegetables",
        ingredients: ["Bun", "Smoky Patty", "BBQ Glaze", "Caramelized Onions"],
        rating: 4.6,
        isAvailable: true,
      },
      {
        name: "Paneer Burger",
        category: "Burger",
        price: 179,
        image: "https://images.unsplash.com/photo-1599155253646-7989e08c05c1?auto=format&fit=crop&w=800&q=80",
        description: "Grilled paneer patty with special sauce",
        ingredients: ["Bun", "Grilled Cottage Cheese", "Tandoori Mayo", "Capsicum"],
        rating: 4.7,
        isAvailable: true,
      },
      {
        name: "Spicy Burger",
        category: "Burger",
        price: 149,
        image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",
        description: "Hot and spicy burger with jalapeños",
        ingredients: ["Bun", "Spicy Patty", "Jalapenos", "Chili Sauce"],
        rating: 4.4,
        isAvailable: true,
      },

      // PIZZAS
      {
        name: "Margherita Pizza",
        category: "Pizza",
        price: 249,
        image: "https://images.unsplash.com/photo-1774806189229-ed02b4f77de1?auto=format&fit=crop&w=800&q=80",
        description: "Classic pizza with tomato, mozzarella and basil",
        ingredients: ["Pizza Crust", "Marinara Sauce", "Fresh Mozzarella", "Basil Leaves", "Olive Oil"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "Pepperoni Pizza",
        category: "Pizza",
        price: 299,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
        description: "Loaded with spicy pepperoni and mozzarella cheese",
        ingredients: ["Pizza Crust", "Pepperoni Slices", "Mozzarella", "Tomato Sauce"],
        rating: 4.8,
        isAvailable: true,
      },
      {
        name: "Cheese Burst Pizza",
        category: "Pizza",
        price: 279,
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
        description: "Extra cheesy pizza with delicious mozzarella",
        ingredients: ["Cheese Stuffed Crust", "Molten Cheese", "Herbs"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "Veggie Delight Pizza",
        category: "Pizza",
        price: 269,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        description: "Onions, capsicum, tomato, olives and mushrooms",
        ingredients: ["Pizza Base", "Bell Peppers", "Black Olives", "Mushrooms", "Mozzarella"],
        rating: 4.6,
        isAvailable: true,
      },
      {
        name: "BBQ Chicken Pizza",
        category: "Pizza",
        price: 299,
        image: "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?auto=format&fit=crop&w=800&q=80",
        description: "Grilled chicken with BBQ sauce and cheese",
        ingredients: ["Crust", "Smoky Chicken Chunks", "BBQ Sauce", "Red Onions"],
        rating: 4.7,
        isAvailable: true,
      },
      {
        name: "Paneer Tikka Pizza",
        category: "Pizza",
        price: 289,
        image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=800&q=80",
        description: "Tandoori paneer with onions and capsicum",
        ingredients: ["Crust", "Spiced Paneer Tikka", "Capsicum", "Onion", "Tandoori Sauce"],
        rating: 4.8,
        isAvailable: true,
      },
      {
        name: "Hawaiian Pizza",
        category: "Pizza",
        price: 279,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        description: "Pineapple with cheese and herbs",
        ingredients: ["Crust", "Juicy Pineapple", "Mozzarella", "Oregano"],
        rating: 4.2,
        isAvailable: true,
      },
      {
        name: "Mushroom Pizza",
        category: "Pizza",
        price: 269,
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
        description: "Fresh mushrooms with mozzarella cheese",
        ingredients: ["Crust", "Button Mushrooms", "Garlic Butter", "Mozzarella"],
        rating: 4.5,
        isAvailable: true,
      },
      {
        name: "Spicy Delight Pizza",
        category: "Pizza",
        price: 289,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
        description: "Hot and spicy pizza with jalapeños and onions",
        ingredients: ["Crust", "Jalapenos", "Red Paprika", "Spicy Sauce"],
        rating: 4.6,
        isAvailable: true,
      },
      {
        name: "Chicken Supreme Pizza",
        category: "Pizza",
        price: 309,
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
        description: "Chicken, olives, capsicum, onions and cheese",
        ingredients: ["Crust", "Roast Chicken", "Olives", "Capsicum", "Mozzarella"],
        rating: 4.9,
        isAvailable: true,
      },

      // BIRYANI
      {
        name: "Chicken Biryani",
        category: "Biryani",
        price: 199,
        image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
        description: "Aromatic basmati rice with delicious chicken",
        ingredients: ["Basmati Rice", "Chicken", "Saffron", "Fried Onions", "Ghee"],
        rating: 4.8,
        isAvailable: true,
      },
      {
        name: "Chicken Dum Biryani",
        category: "Biryani",
        price: 229,
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
        description: "Slow-cooked chicken with aromatic basmati rice",
        ingredients: ["Slow-cooked Dum Rice", "Marinated Chicken", "Whole Spices"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "Chicken Hyderabadi Biryani",
        category: "Biryani",
        price: 249,
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80",
        description: "Authentic Hyderabadi style chicken biryani",
        ingredients: ["Kacchi Dum Chicken", "Hyderabadi Spices", "Mint & Coriander"],
        rating: 5.0,
        isAvailable: true,
      },
      {
        name: "Chicken Tikka Biryani",
        category: "Biryani",
        price: 269,
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
        description: "Spicy chicken tikka with flavorful biryani rice",
        ingredients: ["Charcoal Tikka", "Biryani Gravy", "Basmati Rice"],
        rating: 4.7,
        isAvailable: true,
      },
      {
        name: "Chicken Special Biryani",
        category: "Biryani",
        price: 289,
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
        description: "Special chicken biryani with rich spices and herbs",
        ingredients: ["Boiled Egg", "Double Chicken", "Cashews", "Aromatic Rice"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "Chicken Royal Biryani",
        category: "Biryani",
        price: 299,
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
        description: "Premium chicken biryani with aromatic flavors",
        ingredients: ["Shahi Spices", "Kewra Water", "Rich Chicken Pieces"],
        rating: 4.8,
        isAvailable: true,
      },
      {
        name: "Mutton Dum Biryani",
        category: "Biryani",
        price: 299,
        image: "https://images.unsplash.com/photo-1691170979035-27e5ec943205?auto=format&fit=crop&w=800&q=80",
        description: "Tender mutton slow-cooked with aromatic basmati rice",
        ingredients: ["Tender Goat Meat", "Basmati Rice", "Traditional Masalas"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "Mutton Hyderabadi Biryani",
        category: "Biryani",
        price: 319,
        image: "https://images.unsplash.com/photo-1691171047345-dbcd78402f9e?auto=format&fit=crop&w=800&q=80",
        description: "Traditional Hyderabadi mutton biryani with rich spices",
        ingredients: ["Spiced Mutton", "Hyderabadi Gravy", "Dum Rice"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "Mutton Tikka Biryani",
        category: "Biryani",
        price: 329,
        image: "https://images.unsplash.com/photo-1559528896-c5310744cce8?auto=format&fit=crop&w=800&q=80",
        description: "Juicy mutton tikka with flavorful biryani rice",
        ingredients: ["Mutton Tikka Kebab", "Saffron Rice"],
        rating: 4.7,
        isAvailable: true,
      },
      {
        name: "Mutton Special Biryani",
        category: "Biryani",
        price: 349,
        image: "https://images.unsplash.com/photo-1705174299330-939dd03cc864?auto=format&fit=crop&w=800&q=80",
        description: "Special mutton biryani cooked with aromatic spices",
        ingredients: ["Chef Special Spices", "Rich Mutton Pieces"],
        rating: 4.8,
        isAvailable: true,
      },
      {
        name: "Mutton Royal Biryani",
        category: "Biryani",
        price: 369,
        image: "https://images.unsplash.com/photo-1691170979035-27e5ec943205?auto=format&fit=crop&w=800&q=80",
        description: "Royal mutton biryani with tender meat and fragrant rice",
        ingredients: ["Nawabi Style Mutton", "Golden Onions", "Fragrant Rice"],
        rating: 5.0,
        isAvailable: true,
      },

      // SNACKS
      {
        name: "French Fries",
        category: "Snacks",
        price: 99,
        image: "https://images.unsplash.com/photo-1665117861973-fffa50c1afec?auto=format&fit=crop&w=800&q=80",
        description: "Crispy golden fries with special seasoning",
        ingredients: ["Potato", "Sea Salt", "Peri-Peri Seasoning"],
        rating: 4.7,
        isAvailable: true,
      },
      {
        name: "Veg Sandwich",
        category: "Snacks",
        price: 129,
        image: "https://images.unsplash.com/photo-1534352211968-8d25dbe0e951?auto=format&fit=crop&w=800&q=80",
        description: "Fresh vegetables with creamy sauce",
        ingredients: ["Bread", "Cucumber", "Tomato", "Green Chutney", "Butter"],
        rating: 4.4,
        isAvailable: true,
      },
      {
        name: "Samosa",
        category: "Snacks",
        price: 49,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        description: "Crispy golden samosa filled with spicy potato",
        ingredients: ["Pastry Dough", "Spiced Potatoes", "Green Peas", "Tamarind Chutney"],
        rating: 4.8,
        isAvailable: true,
      },
      {
        name: "Onion Rings",
        category: "Snacks",
        price: 89,
        image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80",
        description: "Crispy fried onion rings with special seasoning",
        ingredients: ["Onion Rings", "Tempura Batter", "Garlic Dip"],
        rating: 4.3,
        isAvailable: true,
      },
      {
        name: "Chicken Nuggets",
        category: "Snacks",
        price: 129,
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
        description: "Crispy golden chicken nuggets with dipping sauce",
        ingredients: ["Minced Chicken", "Breadcrumbs", "Mustard Dip"],
        rating: 4.6,
        isAvailable: true,
      },
      {
        name: "Spring Rolls",
        category: "Snacks",
        price: 99,
        image: "https://images.unsplash.com/photo-1515022376298-7333f33e704b?auto=format&fit=crop&w=800&q=80",
        description: "Crispy vegetable spring rolls with tasty filling",
        ingredients: ["Roll Sheet", "Julienned Veggies", "Sweet Chili Sauce"],
        rating: 4.5,
        isAvailable: true,
      },
      {
        name: "Loaded Nachos",
        category: "Snacks",
        price: 149,
        image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80",
        description: "Crunchy nachos loaded with cheese and fresh toppings",
        ingredients: ["Corn Tortilla Chips", "Liquid Cheese Sauce", "Jalapenos", "Salsa"],
        rating: 4.7,
        isAvailable: true,
      },

      // DRINKS
      {
        name: "Cold Coffee",
        category: "Drinks",
        price: 119,
        image: "https://images.unsplash.com/photo-1771405317950-04de06a70166?auto=format&fit=crop&w=800&q=80",
        description: "Chilled creamy coffee with chocolate",
        ingredients: ["Espresso", "Cold Milk", "Chocolate Syrup", "Ice Cream"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "Fresh Lemonade",
        category: "Drinks",
        price: 79,
        image: "https://images.unsplash.com/photo-1618799805265-4f27cb61ede9?auto=format&fit=crop&w=800&q=80",
        description: "Freshly squeezed lemon with chilled water and ice",
        ingredients: ["Fresh Lime", "Mint", "Sugar", "Black Salt", "Crushed Ice"],
        rating: 4.6,
        isAvailable: true,
      },
      {
        name: "Mango Shake",
        category: "Drinks",
        price: 129,
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
        description: "Creamy mango shake made with fresh mangoes",
        ingredients: ["Alphonso Mango Pulp", "Full Cream Milk", "Dry Fruits"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "Strawberry Shake",
        category: "Drinks",
        price: 139,
        image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80",
        description: "Creamy strawberry milkshake with fresh berries",
        ingredients: ["Fresh Strawberries", "Milk", "Vanilla Ice Cream"],
        rating: 4.7,
        isAvailable: true,
      },
      {
        name: "Orange Juice",
        category: "Drinks",
        price: 99,
        image: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=800&q=80",
        description: "Freshly squeezed orange juice served chilled",
        ingredients: ["Sweet Oranges", "Ice Cubes"],
        rating: 4.5,
        isAvailable: true,
      },
      {
        name: "Blueberry Smoothie",
        category: "Drinks",
        price: 149,
        image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
        description: "Refreshing blueberry smoothie with creamy texture",
        ingredients: ["Wild Blueberries", "Greek Yogurt", "Honey"],
        rating: 4.8,
        isAvailable: true,
      },
      {
        name: "Mango Smoothie",
        category: "Drinks",
        price: 149,
        image: "https://images.unsplash.com/photo-1653542773369-51cce8d08250?auto=format&fit=crop&w=800&q=80",
        description: "Fresh mango smoothie with a naturally sweet taste",
        ingredients: ["Mango", "Yogurt", "Chia Seeds"],
        rating: 4.8,
        isAvailable: true,
      },
      {
        name: "Mint Lemonade",
        category: "Drinks",
        price: 89,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        description: "Refreshing lemon and mint drink served with ice",
        ingredients: ["Fresh Mint Leaves", "Lemon Juice", "Soda", "Ice"],
        rating: 4.7,
        isAvailable: true,
      },

      // DESSERTS
      {
        name: "Chocolate Brownie",
        category: "Desserts",
        price: 119,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
        description: "Rich and fudgy chocolate brownie with dark chocolate chips",
        ingredients: ["Dark Chocolate", "Cocoa", "Butter", "Walnuts"],
        rating: 4.9,
        isAvailable: true,
      },
      {
        name: "Gulab Jamun (2 Pcs)",
        category: "Desserts",
        price: 79,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        description: "Soft milk solid dumplings dipped in rose flavored sugar syrup",
        ingredients: ["Khoa", "Cardamom", "Rose Syrup", "Pistachio"],
        rating: 4.8,
        isAvailable: true,
      },
    ];

    await Food.insertMany(foods);
    console.log(` Successfully seeded ${foods.length} food items into FoodieHub!`);

    console.log(" Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(" Seed failed:", error);
    process.exit(1);
  }
};

seedData();
