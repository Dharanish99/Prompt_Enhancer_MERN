import { Clerk } from '@clerk/clerk-sdk-node';

const clerk = new Clerk({
    secretKey: process.env.CLERK_SECRET_KEY
});

export const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify the token with Clerk
        const payload = await clerk.verifyToken(token);

        if (!payload) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Attach user info to request
        req.auth = {
            userId: payload.sub,
            ...payload
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};
