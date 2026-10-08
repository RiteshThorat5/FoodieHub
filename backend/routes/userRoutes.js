const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.route("/")
  .get(protect, adminOnly, getAllUsers);

router.route("/:id")
  .get(protect, getUserById)
  .put(protect, updateUserProfile)
  .delete(protect, adminOnly, deleteUser);

module.exports = router;
