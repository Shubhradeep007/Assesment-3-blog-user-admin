const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        req.flash("error_msg", "You are not authorized to perform this action.");
        res.redirect("/dashboard");
    }
};

module.exports = { requireAdmin };
