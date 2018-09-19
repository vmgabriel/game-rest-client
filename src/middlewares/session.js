module.exports = (req, res, next) => {
    if (req.session.user_id == null) {
        res.redirect("/");
    } else {
        next();
    }
}
