import express from "express";
import authenticateUser from "../middleware/auth.middleware";

import { Request, Response } from "express";
import { Account } from "../models/account.models";
import { RequestWithUserId } from "../types/interfaces";
import { User } from "../models/user.models";
const router = express.Router()

// Route: for get user balance
router.get("/balance", authenticateUser, async (req: Request, res: Response) => {
    const userId = (req as RequestWithUserId).userId
    
    const account = await Account.find({userId: userId})
    
    if(!account) {
        return res.status(400).json({
            message: "User have no initial balance"
        })
    }
    res.status(200).json({
        balance: account[0].balance
    })
})

// Transfer money to different account
router.post("/transfer", authenticateUser, async(req: Request, res: Response) => {
    const {to, amount } = req.body
    const senderId = (req as RequestWithUserId).userId
    try {

        const sender = await Account.find({userId: senderId})

        // Check if sender exists
        if(!sender) {
            return res.status(200).json({message: "Can't fetch sender from database"})
        }
        
        // check if the sender has sufficient balance
        if(sender[0].balance < amount) {
             return res.status(400).json({message: "Insufficient balance!!!"})
        }

        // find reciever using user id
        const receiver = await User.findById(to)
        if(!receiver) {
            return res.status(400).json({message: "Invalid Account to send money!!"})
        }

        // Debit amount from the sender
        await Account.updateOne({
            userId: senderId
        }, {
            $inc: {
                balance: -amount
            }
        })
        
        // credit amount to receiver account
        await Account.updateOne({
            userId: to
        }, {
            $inc: {
                balance: amount
            }
        })

        res.status(200).json({message: "Transfer Successfull"})

    } catch(error) {
        res.status(401).json({message: error || "Some db error occured"})
    }

})
export default router
