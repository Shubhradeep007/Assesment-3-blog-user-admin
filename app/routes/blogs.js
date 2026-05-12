const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog } = require("../controllers/blogController");
const { requireAuth } = require("../middleware/auth");
const Blog = require("../models/Blog");

router.get("/create", requireAuth, (req, res) => {
    res.render("blogs/create");
});

router.get("/edit/:id", requireAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog || blog.isDeleted) {
            req.flash("error_msg", "Blog not found");
            return res.redirect("/dashboard");
        }
        
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            req.flash("error_msg", "Not authorized");
            return res.redirect("/dashboard");
        }

        res.render("blogs/edit", { blog });
    } catch (err) {
        req.flash("error_msg", "Error loading blog");
        res.redirect("/dashboard");
    }
});

// API & View Routes combined
router.get("/", getAllBlogs);
router.post("/", requireAuth, upload.single("image"), createBlog);

router.get("/:id", getBlogById);
router.put("/:id", requireAuth, upload.single("image"), updateBlog);
router.delete("/:id", requireAuth, deleteBlog);

module.exports = router;
