const User = require("../models/User");
const Blog = require("../models/Blog");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false }).select("-password");
        res.render("users", { users });
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error fetching users");
        res.redirect("/dashboard");
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash("error_msg", "User not found");
            return res.redirect("/users");
        }

        // Soft delete user
        user.isDeleted = true;
        await user.save();

        // Optionally, soft delete all their blogs
        await Blog.updateMany({ author: user._id }, { isDeleted: true });

        req.flash("success_msg", "User deleted successfully");
        res.redirect("/users");
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error deleting user");
        res.redirect("/users");
    }
};
const updateUser = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash("error_msg", "User not found");
            return res.redirect("/users");
        }

        user.role = role;
        await user.save();

        req.flash("success_msg", "User role updated successfully");
        res.redirect("/users");
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error updating user");
        res.redirect("/users");
    }
};

module.exports = { getAllUsers, deleteUser, updateUser };
