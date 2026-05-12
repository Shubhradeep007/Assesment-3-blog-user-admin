const Blog = require("../models/Blog");
const cloudinary = require("cloudinary").v2;

const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const image = req.file ? req.file.path : null;

        const newBlog = new Blog({
            title,
            content,
            image,
            author: req.user._id
        });

        await newBlog.save();
        req.flash("success_msg", "Blog created successfully");
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error creating blog");
        res.redirect("/blogs/create");
    }
};

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isDeleted: false })
                                .populate("author", "name email")
                                .sort({ createdAt: -1 });
        res.render("blogs/index", { blogs });
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error fetching blogs");
        res.redirect("/");
    }
};

const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false }).populate("author", "name email profileImage");
        if (!blog) {
            req.flash("error_msg", "Blog not found");
            return res.redirect("/blogs");
        }
        res.render("blogs/show", { blog });
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error fetching blog");
        res.redirect("/blogs");
    }
};

const updateBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        let blog = await Blog.findById(req.params.id);

        if (!blog || blog.isDeleted) {
            req.flash("error_msg", "Blog not found");
            return res.redirect("/dashboard");
        }

        // Check if user is author or admin
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            req.flash("error_msg", "Not authorized");
            return res.redirect("/dashboard");
        }

        blog.title = title;
        blog.content = content;

        if (req.file) {
            // Unlink old image from Cloudinary
            if (blog.image) {
                try {
                    const publicId = 'assesment3-blog/' + blog.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (e) {
                    console.error("Error deleting old image from Cloudinary", e);
                }
            }
            blog.image = req.file.path;
        }

        await blog.save();
        req.flash("success_msg", "Blog updated successfully");
        res.redirect(`/blogs/${blog._id}`);
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error updating blog");
        res.redirect("/dashboard");
    }
};

const deleteBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog || blog.isDeleted) {
            req.flash("error_msg", "Blog not found");
            return res.redirect("/dashboard");
        }

        // Check ownership or admin
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            req.flash("error_msg", "Not authorized");
            return res.redirect("/dashboard");
        }

        if (req.user.role === "admin") {
            // Hard delete
            if (blog.image) {
                try {
                    const publicId = 'assesment3-blog/' + blog.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (e) {
                    console.error("Error deleting image from Cloudinary", e);
                }
            }
            await Blog.deleteOne({ _id: req.params.id });
            req.flash("success_msg", "Blog hard deleted by admin");
        } else {
            // Soft delete for user
            blog.isDeleted = true;
            await blog.save();
            req.flash("success_msg", "Blog deleted successfully");
        }

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error deleting blog");
        res.redirect("/dashboard");
    }
};

module.exports = { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog };
