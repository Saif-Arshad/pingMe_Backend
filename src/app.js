const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { connectToDatabase } = require("../config/database");
const routes = require("./routes");
const { generateContent } = require('./listeners/Ai.listener');
const { chat, saveMessage } = require('./listeners/chat.listener');
const { getOrCreateRoom } = require('./listeners/room.listner');
const { deleteAllMessages } = require('./listeners/deleteMessages.listener');
const { blockUser, unBlockUser } = require('./listeners/block.listner');
const { archiveUsers, unArchiveUsers } = require('./listeners/archive-user.listner');
const { Message } = require("./../models/Room")
const port = 8000;
const app = express();
const server = http.createServer(app);
const Origins = ['https://pingmepro.vercel.app', 'http://localhost:5173'];

(async () => {
    try {
        // Ensure the database connection is established before starting the server
        await connectToDatabase();

        const allowedOrigins = Origins;
        const corsOptionsAll = {
            optionsSuccessStatus: 200,
            origin: allowedOrigins,
            credentials: true,
        };

        const io = new Server(server, {
            cors: {
                origin: allowedOrigins,
                credentials: true,
            }
            , addTrailingSlash: false
        }
        );
        app.use(express.json());
        app.use(cors(corsOptionsAll));

        let onlineUsers = {};

        // Handle client connections
        io.on('connection', (socket) => {
            const userId = socket.handshake.query.userId;

            // Add user to online users list if userId is present
            if (userId) {
                onlineUsers[userId] = socket.id;
                io.emit('online_users', Object.keys(onlineUsers));
            }

            // Handle AI content generation
            socket.on('generate_content', async (data) => {
                try {
                    await generateContent(socket, data);
                } catch (error) {
                    socket.emit('error', { message: 'Failed to generate content' });
                }
            });

            // Typing listeners
            // socket.on('user_typing', (data) => {
            //     io.emit('user_typing', data);
            // });

            // socket.on('user_stopped_typing', (data) => {
            //     io.emit('user_stopped_typing', data);
            // });

            // Join Room logic
            socket.on('joinRoom', async (roomId) => {
                try {
                    const { sender, receiver } = roomId;

                    if (!sender || !receiver) {
                        console.log("Invalid roomId, sender or receiver is undefined:", roomId);
                        return socket.emit('error', { message: 'Sender or receiver is undefined' });
                    }

                    const room = await getOrCreateRoom(sender, receiver);

                    // Add sender to the room
                    socket.join(room.roomId);
                    socket.emit("room_joined", room);

                    const receiverSocketId = onlineUsers[receiver];

                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit('roomInvite', { roomId });
                    } else {
                        console.log(`Receiver ${receiver} is not connected`);
                    }
                } catch (error) {
                    console.log("🚀 ~ socket.on ~ error:", error);
                    socket.emit('error', { message: 'Failed to join room' });
                }
            });

            socket.on('joinInvite', async (data) => {
                try {
                    const { sender, receiver } = data.roomId;
                    console.log("🚀 ~ socket.on ~ receiver:", receiver)
                    console.log("🚀 ~ socket.on ~ sender:", sender)

                    //     if (!sender || !receiver) {
                    //         console.log("Invalid roomId, sender or receiver is undefined:", roomId);
                    //         return socket.emit('error', { message: 'Sender or receiver is undefined' });
                    //     }

                    const room = await getOrCreateRoom(sender, receiver);
                    socket.join(room.roomId);
                    socket.emit("room_joined", room);
                } catch (error) {
                    console.log("🚀 ~ socket.on ~ error:", error);
                    socket.emit('error', { message: 'Failed to join room' });
                }
            });


            socket.on('private_message', async (data) => {
                try {
                    const { sender, receiver, message } = data;
                    const room = await getOrCreateRoom(sender, receiver);

                    const tempMessage = {
                        sender,
                        receiver,
                        message,
                        timestamp: Date.now(),
                    };
                    io.to(room.roomId).emit('newMessage', tempMessage);

                    // Save message to database
                    const newMessage = await saveMessage(sender, receiver, message);
                    room.messages.push(newMessage._id);
                    await room.save();

                } catch (error) {
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            // Delete User 
            socket.on('delete-chat', async (data) => {
                await deleteAllMessages(data, socket)
            })

            socket.on('block-user', async (data) => {
                const { currentUserId, userId } = data;

                blockUser(data, socket)

                const receiverSocketId = onlineUsers[userId];

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('block', { currentUserId });
                }


            })
            socket.on('unBlock-user', async (data) => {
                const { currentUserId, userId } = data;
                unBlockUser(data, socket)
                const receiverSocketId = onlineUsers[userId];

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('unBlock', { currentUserId });
                }
            })
            socket.on('archive-user', async (data) => {
                archiveUsers(data, socket)
            })
            socket.on('unArchive-user', async (data) => {
                unArchiveUsers(data, socket)
            })
            socket.on('markMessagesAsRead', async ({ conversationId, userId }) => {
                try {
                    await Message.updateMany(
                        { sender: conversationId, receiver: userId, isRead: false },
                        { $set: { isRead: true } }
                    );

                    // io.to(conversationId).emit('messagesRead', { conversationId, userId });
                } catch (error) {
                    console.error('Error updating message status:', error);
                }
            });

            // Handle disconnect and remove user from online users
            socket.on('disconnect', () => {
                if (userId) {
                    delete onlineUsers[userId];
                    io.emit('online_users', Object.keys(onlineUsers));
                }
            });
        });

        app.use("/api", routes);

        app.use((req, res) => {
            res.status(404).send({ error: "Route not found" });
        });

        server.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error);
    }
})();
