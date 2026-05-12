const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser, updateUser } = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/rbac");

router.get("/", requireAuth, requireAdmin, getAllUsers);
router.put("/:id", requireAuth, requireAdmin, updateUser);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

module.exports = router;
