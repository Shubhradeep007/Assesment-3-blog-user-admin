const express = require("express");
const router = express.Router();
const { checkUser, requireAuth } = require("../middleware/auth");
const Blog = require("../models/Blog");

router.use(checkUser);

router.get("/", (req, res) => {
    res.redirect("/blogs");
});

router.get("/register", (req, res) => {
    if (req.user) return res.redirect("/dashboard");
    res.render("register");
});

router.get("/login", (req, res) => {
    if (req.user) return res.redirect("/dashboard");
    res.render("login");
});

router.get("/dashboard", requireAuth, async (req, res) => {
    try {
        let blogs;
        if (req.user.role === "admin") {
            // Admin sees all active blogs to manage them
            blogs = await Blog.find({ isDeleted: false }).populate("author", "name email").sort({ createdAt: -1 });
        } else {
            // Fetch user's blogs
            blogs = await Blog.find({ author: req.user._id, isDeleted: false }).populate("author", "name email").sort({ createdAt: -1 });
        }
        res.render("dashboard", { blogs });
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error loading dashboard");
        res.redirect("/");
    }
});

module.exports = router;
