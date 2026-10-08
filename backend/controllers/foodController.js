const Food = require("../models/Food");

// @desc    Get all foods (with optional category and search query)
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    const foods = await Food.find(query).sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    console.error("Get Foods Error:", error);
    res.status(500).json({ message: "Failed to fetch food items" });
  }
};

// @desc    Get single food by ID
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: "Invalid food ID or server error" });
  }
};

// @desc    Create a new food item
// @route   POST /api/foods
// @access  Private / Admin
const createFood = async (req, res) => {
  try {
    const { name, description, price, category, image, ingredients, rating, isAvailable } =
      req.body;

    if (!name || price === undefined || !category || !image) {
      return res.status(400).json({
        message: "Name, price, category, and image are required.",
      });
    }

    const food = new Food({
      name,
      description: description || "",
      price: Number(price),
      category,
      image,
      ingredients: Array.isArray(ingredients)
        ? ingredients
        : typeof ingredients === "string"
        ? ingredients.split(",").map((i) => i.trim()).filter(Boolean)
        : [],
      rating: rating ? Number(rating) : 4.5,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    const createdFood = await food.save();
    res.status(201).json({
      message: "Food item added successfully!",
      food: createdFood,
    });
  } catch (error) {
    console.error("Create Food Error:", error);
    res.status(500).json({ message: error.message || "Failed to create food item" });
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private / Admin
const updateFood = async (req, res) => {
  try {
    const { name, description, price, category, image, ingredients, rating, isAvailable } =
      req.body;

    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    if (name !== undefined) food.name = name;
    if (description !== undefined) food.description = description;
    if (price !== undefined) food.price = Number(price);
    if (category !== undefined) food.category = category;
    if (image !== undefined) food.image = image;
    if (ingredients !== undefined) {
      food.ingredients = Array.isArray(ingredients)
        ? ingredients
        : typeof ingredients === "string"
        ? ingredients.split(",").map((i) => i.trim()).filter(Boolean)
        : food.ingredients;
    }
    if (rating !== undefined) food.rating = Number(rating);
    if (isAvailable !== undefined) food.isAvailable = Boolean(isAvailable);

    const updatedFood = await food.save();
    res.json({
      message: "Food item updated successfully!",
      food: updatedFood,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update food item" });
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private / Admin
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food item deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete food item" });
  }
};

// @desc    Toggle or update availability
// @route   PUT /api/foods/:id/availability
// @access  Private / Admin
const updateFoodAvailability = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    food.isAvailable = req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : !food.isAvailable;
    await food.save();

    res.json({
      message: `Food item availability set to ${food.isAvailable ? "Available" : "Unavailable"}`,
      food,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update food availability" });
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  updateFoodAvailability,
};
