import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

export const userMiddleware = async (req, res, next) => {
    console.log('User middleware called');

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.error('No authorization header found');
        return res.status(401).json({ error: "Authentication required. Please login." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        console.error('Token not found in authorization header');
        return res.status(401).json({ error: "Authentication token missing. Please login again." });
    }

    try {
        // Get JWT secret from environment variable
        const jwtSecret = process.env.JWT_USER_PASSWORD;

        if (!jwtSecret) {
            console.error('JWT_USER_PASSWORD is not defined in environment variables');
            return res.status(500).json({ error: "Server configuration error. Please contact administrator." });
        }

        // Verify token
        const decoded = jwt.verify(token, jwtSecret);

        if (!decoded.id) {
            console.error('No user ID found in token payload');
            return res.status(401).json({ error: "Invalid token. Please login again." });
        }

        // Set user ID in request object
        req.userId = decoded.id;
        console.log("User authenticated. User ID:", req.userId);
        next();

    } catch (error) {
        console.error("JWT verification error:", error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired. Please login again." });
        }

        return res.status(401).json({ error: "Invalid authentication token. Please login again." });
    }
}
