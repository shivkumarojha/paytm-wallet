import {Request, Response, NextFunction } from 'express'



// Interface for authenticate user and return User id  in request
export interface RequestWithUserId extends Request {
    userId: string
}

// interface for JwtVerifiedPayload
export interface JwtVerifiedPayload {
    userId: string
}
