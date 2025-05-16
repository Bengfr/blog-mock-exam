const jwt = require('jsonwebtoken');
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired, please log in again.' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
});
}
module.exports = { authenticateToken };