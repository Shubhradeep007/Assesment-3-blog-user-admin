const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { register, login, logout } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);
router.get("/logout", requireAuth, logout);

module.exports = router;
