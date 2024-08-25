const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const port = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Update this to the origin of your frontend
        methods: ["GET", "POST"]
    }
});

app.use(cors());

app.use(express.json());

io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('message', (data) => {
        console.log(data);
    });
    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
    });
});

app.get('/', (req, res) => {
    res.send("Hi I am Saif Ur Rehman");
});

// Uncomment and use these routes if needed
// app.get('/login', (req, res) => {
//     console.log("🚀 ~ app.get ~ req:", req);
//     res.send("You are at login page");
// });

// app.post('/me', (req, res) => {
//     const data = req.body;
//     console.log("🚀 ~ app.post ~ data:", data);
//     console.log("🚀 ~ app.get ~ req:", req);
//     res.send(`Your name is ${data.name} and your email is ${data.email}`);
// });

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
