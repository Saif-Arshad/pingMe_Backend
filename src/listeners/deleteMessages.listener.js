const { Room, Message } = require("../../models/Room");
const { User } = require("../../models/User");

exports.deleteAllMessages = async (id, socket) => {
    const { roomId, currentUserId } = id;
    console.log("🚀 ~ exports.deleteAllMessages ~ currentUserId:", currentUserId);

    try {
        console.log("🚀 ~ exports.deleteAllMessages ~ roomId:", roomId);

        // Find the room by roomId
        const room = await Room.findOne({ roomId }).populate('messages');
        console.log("🚀 ~ exports.deleteAllMessages ~ room:", room);

        if (!room) {
            socket.emit('error', { message: 'No room found with this id' });
            return;
        }

        // Find the current user by currentUserId
        const currentUser = await User.findById(currentUserId);
        console.log("🚀 ~ exports.deleteAllMessages ~ currentUser:", currentUser);

        if (!currentUser) {
            socket.emit('error', { message: 'No user found with this id' });
            return;
        }

        // Remove the roomId from the user's roomHistory array
        currentUser.roomHistory = currentUser.roomHistory.filter(historyRoomId => historyRoomId.toString() !== room._id.toString());
        await currentUser.save();

        if (room.messages.length === 0) {
            socket.emit('info', { message: 'No messages to delete in this room' });
            return;
        }

        // Delete all messages associated with this room
        const deleteResult = await Message.deleteMany({ _id: { $in: room.messages } });
        console.log("🚀 ~ deleteAllMessages ~ deleteResult:", deleteResult);

        // Clear the messages array in the room document
        room.messages = [];
        await room.save();

        // Emit success event to the client
        socket.emit('success', { message: 'All messages and room history deleted successfully' });

    } catch (error) {
        console.error("🚀 ~ deleteAllMessages ~ error:", error);
        socket.emit('error', { message: 'Error deleting messages and room history', error });
    }
};
