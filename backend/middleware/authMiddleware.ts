import jwt from "jsonwebtoken"

import { Request, Response, NextFunction } from "express"
import { JWT_SECRET } from "../config/jwt.config"

function authenticateUser(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Token is invalid or not provided" })
    }
    const token = authHeader.split(' ')[1]
    const verified = jwt.verify(token, JWT_SECRET)
    if (!token) {
        console.log("invalid")
        return res.status(411).json({ message: "unauthorised" })
    }
    next()
}


export default authenticateUser