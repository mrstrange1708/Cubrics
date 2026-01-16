const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 * Attaches user info to req.user
 */
const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please login to access this resource'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Your session has expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Invalid authentication token'
            });
        }

        console.error('Auth Middleware Error:', error);
        return res.status(500).json({
            error: 'Authentication failed',
            message: 'An error occurred during authentication'
        });
    }
};

/**
 * Optional Auth Middleware
 * Attaches user info if token present, but doesn't require it
 */
const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email
                };
            }
        }

        next();
    } catch (error) {
        // Token invalid but continue without user info
        next();
    }
};

module.exports = { authMiddleware, optionalAuthMiddleware };
