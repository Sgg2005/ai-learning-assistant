import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    //checks to see if token exists in authorization header 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; //get token from header

            //verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password'); //get user from token and exclude password

            if(!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found',
                    statusCode: 401
                });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error.message);

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json ({
                    success: false,
                    error: 'Invalid token',
                    statusCode: 401
                });
            } 

            return res.status(401).json({
                success: false,
                error: 'Not authorized',
                statusCode: 401
            });
        }
    } else if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token',
            statusCode: 401
        });
    }
};

export default protect; 