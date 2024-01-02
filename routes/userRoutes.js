const express = require("express");
const router = express.Router();
const {
  registerUser,
  googleSignIn,
  loginUser,
  viewUserDetails,
  updateUserDetails,
  updateUserPassword,
} = require("../controllers/userController");
const auth = require("../middlewares/auth");

router.get("/", (req, res) => {
  res.send("User routes are working!");
});

// Register a user
router.post("/register", registerUser);

// Google Sign-In
router.post("/google-signin", googleSignIn);

// Login a user
router.post("/login", loginUser);

// View user details
router.get("/me", auth, viewUserDetails);

// Update user details
router.patch("/update", auth, updateUserDetails);

// Update user password
router.patch("/updatePassword", auth, updateUserPassword);

module.exports = router;
