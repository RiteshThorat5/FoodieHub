const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/users
// @access  Private / Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Not authorized to view this user profile" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error retrieving user" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
const updateUserProfile = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone, address } = req.body;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) {
      user.address = {
        street: address.street !== undefined ? address.street : user.address.street,
        city: address.city !== undefined ? address.city : user.address.city,
        state: address.state !== undefined ? address.state : user.address.state,
        pincode: address.pincode !== undefined ? address.pincode : user.address.pincode,
      };
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update profile" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private / Admin
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Admin cannot delete their own account." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
};
