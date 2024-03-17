import jwt from "jsonwebtoken"

import { Request, Response, NextFunction } from "express"


function authenticateUser(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Token is invalid or not provided" })
    }
    const token = authHeader.split(' ')[1]
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET as string)
        // @ts-ignore
        req.userId = verified.userId
        next()
    }
    catch(err) {
        return res.status(411).json({ message: "unauthorised" })
    }
    
}


export default authenticateUser