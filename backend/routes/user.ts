import express from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/user.models'
import bcrypt from 'bcrypt'

import { Request, Response, NextFunction } from 'express'
import authenticateUser from '../middleware/auth.middleware'

// Import account model
import { Account } from '../models/account.models'

// import types
import { RequestWithUserId } from '../types/interfaces'
export const router = express.Router()

// JWT_SECRET
const JWT_SECRET: string = process.env.JWT_SECRET || ""

// User Zod object for Signup
const signupUserBody = z.object({
    email: z.string().email().min(5),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string()
})

// Zod validation for signin data
const signinBody = z.object({
    email: z.string().email().min(5),
    password: z.string().min(6)
})

// Function for hashing password 
async function hashPassword(password:string){
    try {
        const hpass = bcrypt.hash(password, 10)
        return hpass
    }catch(error) {
        return null
    }
}

router.get('/health',(req, res) => {
    res.json({message: 'Okay'})
})

router.post('/signup', async(req, res) => {
    
    // safe parse req.body using zod validation
    const parsedData = signupUserBody.safeParse(req.body)
    // check if the validation failed
    if(!parsedData.success) {
        return res.status(411).json({message: "Inputs are not invalid", err: parsedData.error})
    }
    
    const {email, password, firstName, lastName } = parsedData.data
    const isUserExist = await User.findOne({email: email})
    if(isUserExist) {
        return res.status(411).json({message: "User Exists!"})
    }else {

        // Hash the password first 
        const hashedPassword = await hashPassword(password)
        try {
            const newUser = await User.create({email: email, password: hashedPassword, firstName: firstName, lastName: lastName}) 
            
            // assign initial amount for the user
            const userId = newUser._id
            await Account.create({
                userId,
                balance: 1 + Math.random() *10000
            })
            res.status(200).json({message: 'User Created', userId: newUser._id}) 
        } catch(error) {
            return res.status(401).json({message: "Database error occured", error})
        };
        
    }
    
})

// Sign in route
router.post('/signin', async(req, res) => {
    const parsedData = signinBody.safeParse(req.body)
    if(!parsedData.success) {
        return res.status(411).json({message: 'invalid Input'})
    }

    const {email, password} = parsedData.data
    
    const user = await User.findOne({email: email})
    if(!user) {
        return res.status(401).json({message: 'No user with email id'})
    }else {
        const hashedPassword = user.password
        if(password && hashedPassword) {
            const passwordMatched =  await bcrypt.compare(password, hashedPassword) 
            if(!passwordMatched) {
                return res.json({message: "Password Doesn't matched"})
            }
            const payload = {
                userId: user._id
            }
            const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "1h"})
            res.status(200).json({message: "Loggedin Successfully", token: token})
        }
    }
    
})

// zod object for update user
const updateUserBody = z.object({
    password: z.string().min(6).optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
}) 

// Route for update user Information
router.put('/update-user', authenticateUser, async(req: Request, res: Response) => {
    const parsedData = updateUserBody.safeParse(req.body)
    if(!parsedData.success) {
        return res.status(403).json({message: "Invalid values"})
    }

        const {firstName, lastName} = parsedData.data
        const user = await User.findByIdAndUpdate((req as RequestWithUserId).userId, { firstName, lastName}).select("-password")
        res.status(200).json({message: "User is updated"})

})

// Filter users 
router.get("/bulk", authenticateUser, async(req: Request, res: Response) => {
    const filter = req.query.filter || ""
    console.log(filter)

    // regex
    const regex = new RegExp((filter as string), "i")
    // filter user from database
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": regex
            }
        }, {
            lastName: {
                "$regex": regex
            }
        }
    ]
    })

    res.status(200).json({
        user: users.map(user => ({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
    console.log(users)

})