const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.flash("error_msg", "Please log in to view this resource.");
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user || user.isDeleted) {
            res.clearCookie("token");
            req.flash("error_msg", "Account no longer exists. Please register again.");
            return res.redirect("/login");
        }

        req.user = user;
        // Make user available to all templates (if this middleware is used)
        res.locals.user = user;
        next();
    } catch (err) {
        res.clearCookie("token");
        req.flash("error_msg", "Session expired. Please log in again.");
        return res.redirect("/login");
    }
};

const checkUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            if (user && !user.isDeleted) {
                req.user = user;
                res.locals.user = user;
            } else {
                req.user = null;
                res.locals.user = null;
            }
            next();
        } catch (err) {
            req.user = null;
            res.locals.user = null;
            next();
        }
    } else {
        req.user = null;
        res.locals.user = null;
        next();
    }
};

module.exports = { requireAuth, checkUser };
