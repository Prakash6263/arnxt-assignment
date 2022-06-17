const express = require("express");
const router = express.Router();

//routers handlers
const userController = require("../controller/userController");
const mid = require("../middleware/auth");

// User APIs
router.post("/register", userController.registerUser);
router.post("/login", userController.login);
router.put("/user/:userId/profile", mid.Auth, userController.updateUser);

module.exports = router;
