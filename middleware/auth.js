function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // User is authenticated
        return next();
    } else {
        // User is not authenticated, redirect to login page
        return res.redirect('/login.html');
    }
}

module.exports = { isAuthenticated };