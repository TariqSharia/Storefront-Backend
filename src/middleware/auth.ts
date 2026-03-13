import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization; 
        if (!authorizationHeader) {
            return res.status(401).json('Access denied, no token provided');
        }
        const token = authorizationHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        next();
    } catch (error) {
        res.status(401).json('Access denied, invalid token');
    }
};

export default verifyAuthToken;