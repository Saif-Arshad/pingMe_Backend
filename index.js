const express = require('express');

const port = '3000'
const app = express();
app.use(express.json());
app.get('/', (req, res) => {
    console.log("🚀 ~ app.get ~ req:", req)
    res.send("Hi i am Saif Ur Rehman")
})
app.get('/login', (req, res) => {
    console.log("🚀 ~ app.get ~ req:", req)
    res.send("You are at login page")
})
app.post('/me', (req, res) => {
    const data = req.body
    console.log("🚀 ~ app.post ~ data:", data)
    console.log("🚀 ~ app.get ~ req:", req)
    res.send(`Your name is ${data.name} and your email is ${data.email}`)
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})