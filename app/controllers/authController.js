const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            req.flash("error_msg", "Email is already registered");
            return res.redirect("/register");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const profileImage = req.file ? req.file.path : null;


        let role = "user";
        if (email === "admin@admin.com") role = "admin"; // Hardcode first admin for ease

        user = new User({
            name,
            email,
            password: hashedPassword,
            profileImage,
            role
        });

        await user.save();
        req.flash("success_msg", "Registration successful. You can now log in.");
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error during registration.");
        res.redirect("/register");
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user || user.isDeleted) {
            req.flash("error_msg", "Invalid credentials or account deleted.");
            return res.redirect("/login");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash("error_msg", "Invalid credentials.");
            return res.redirect("/login");
        }

        const payload = {
            id: user._id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
        
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        req.flash("success_msg", "You are now logged in");
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Error during login.");
        res.redirect("/login");
    }
};

const logout = (req, res) => {
    res.clearCookie("token");
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
};

module.exports = { register, login, logout };
