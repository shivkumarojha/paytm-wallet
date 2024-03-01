import mongoose from "mongoose";


// Defining the Schema for user
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String

})

// Model for User
export const User = mongoose.model('User', userSchema)

