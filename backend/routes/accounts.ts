import express from "express";
import authenticateUser from "../middleware/auth.middleware";

import { Request, Response } from "express";
import { Account } from "../models/account.models";
import { RequestWithUserId } from "../types/interfaces";
const router = express.Router()

// Route: for get user balance
router.get("/balance", authenticateUser, async (req: Request, res: Response) => {
    const userId = (req as RequestWithUserId).userId
    console.log(userId)
    const account = await Account.find({userId: userId})
    console.log(account)
    if(!account) {
        return res.status(400).json({
            message: "User have no initial balance"
        })
    }
    res.status(200).json({
        balance: account[0].balance
    })
})

export default router
