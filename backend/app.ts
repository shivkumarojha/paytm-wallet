import express from 'express'
import mongoose from 'mongoose'

// Root Router import
import  router  from './routes/index'


const app = express()

const PORT = 3000

// Root Router
app.use('/api/v1', router)


app.get('/', (req, res) => {
    res.status(200).json({message: "Done"})
})

// Connect with mongo db
async function dbConnect() {
    await mongoose.connect("mongodb://127.0.0.1:27017/paytm")
}
dbConnect().catch(err => console.log(err))

app.listen(PORT, () => {
    console.log("Server is running at ", PORT)
})