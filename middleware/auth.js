// Simple authentication middleware
// In production, you should use proper session management or JWT
const isAuthenticated = (req, res, next) => {
    // Check if user is authenticated (you can use session or JWT)
    if (req.session && req.session.isAuthenticated) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = isAuthenticated; 