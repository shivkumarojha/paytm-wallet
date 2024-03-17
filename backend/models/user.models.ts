import mongoose from "mongoose";


// Defining the Schema for user
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: 5,
        maxLength: 30,

    },
    password:{
        type: String,
        required: true,
    } ,

    firstName: {
        type: String,
        required: true,
        maxLength: 50
    },
    lastName:{
        type: String,
        required: true,
        trim: true
    }

})

// Model for User
export const User = mongoose.model('User', userSchema)

