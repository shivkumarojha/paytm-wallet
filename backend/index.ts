import express from 'express'

const app = express()

const PORT = 3000

app.get('/', (req, res) => {
    res.status(200).json({message: "Done"})
})

app.listen(PORT, () => {
    console.log("Server is running at ", PORT)
})