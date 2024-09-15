const express = require('express');
const http = require('http');
// Import Server from 'socket.io';
const { Server } = require("socket.io");
const cors = require('cors');
const { connectToDatabase } = require("../config/database");
const port = 3000;
const app = express();
const server = http.createServer(app);
const routes = require("./routes");

// make a new instance of Server and pass in the http server instance 
// And also CORS options
(async () => {
    connectToDatabase()
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            // methods: ["GET", "POST"]
        }
    });


    app.use(express.json());

    // When a client establishes a connection with the server, 
    // this event listener will be triggered.
    io.on('connection', (socket) => {

        // Log the socket ID of the newly connected client to the console for tracking purposes.
        console.log(`⚡: ${socket.id} user just connected!`);

        // Listen for 'message_send' events from the client. When the client sends a message,
        // the server receives it and logs the message data to the console.
        socket.on('message_send', (data) => {
            console.log(data); // Output the received message data.


            // This will notify everyone about the new message.
            io.emit('message_receive', data);
        });

        // Listen for the 'disconnect' event which triggers when a client disconnects.
        // Log a message indicating that a user has disconnected from the server.
        socket.on('disconnect', () => {
            console.log('🔥: A user disconnected'); // Notify the server of the disconnection.
        });
    });

    app.use("/api", routes);

    app.use((req, res) => {
        return res.status(404).send({ error: "Route not found" });
    });
    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
})();