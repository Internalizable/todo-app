import {Request, Response} from "express";
import jwt from 'jsonwebtoken';
import {JWT_SECRET} from "../config/config";

export const authenticateToken = async (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {

        if (err) {
            return res.sendStatus(403);
        }

        res.locals.user = decoded;
        next();
    });
}
