import express from 'express'
import { JWT_SECRET } from '../config/jwt.config'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/db'
import bcrypt from 'bcrypt'

export const router = express.Router()

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

router.get('/health', (req, res) => {
    res.json({message: 'Okay'})
})

router.post('/signup', async(req, res) => {
    
    // safe parse req.body using zod validation
    const parsedData = signupUserBody.safeParse(req.body)
    
    // check if the validation failed
    if(!parsedData.success) {
        return res.status(411).json({message: "Inputs are not invalid", err: parsedData.error})
    }
    const {email, password, firstName, lastName } = req.body
    const isUserExist = await User.findOne({email: email})
    if(isUserExist) {
        return res.status(411).json({message: "User Exists!"})
    }else {

        // Hash the password first 
        const hashedPassword = await hashPassword(password)
        try {

            const newUser = await User.create({email: email, password: hashedPassword, firstName: firstName, lastName: lastName}) 

            res.status(200).json({message: 'User Created', userId: newUser._id}) 
        } catch(error) {
            return res.status(401).json({message: "Database error occured"})
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
                user: user.email
            }
            const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "1h"})
            res.status(200).json({message: "Loggedin Successfully", token: token})
        }
    }
    
})