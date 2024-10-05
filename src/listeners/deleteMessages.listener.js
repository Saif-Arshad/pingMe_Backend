const { Room, Message } = require("../../models/Room");
const { User } = require("../../models/User");

exports.deleteAllMessages = async (id, socket) => {
    const { roomId } = id;

    try {
        const room = await Room.findOne({ roomId }).populate('messages');
        console.log("🚀 ~ exports.deleteAllMessages ~ room:", room);

        if (!room) {
            socket.emit('error', { message: 'No room found with this id' });
            return;
        }

        const participants = room.participants;

        const users = await User.find({ _id: { $in: participants } });
        await Promise.all(users.map(async (user) => {
            user.roomHistory = user.roomHistory.filter(historyRoomId => historyRoomId.toString() !== room._id.toString());
            await user.save();
        }));

        if (room.messages.length === 0) {
            socket.emit('info', { message: 'No messages to delete in this room' });
            return;
        }

        const deleteResult = await Message.deleteMany({ _id: { $in: room.messages } });
        console.log("🚀 ~ deleteAllMessages ~ deleteResult:", deleteResult);

        room.messages = [];

        await Room.deleteOne({ _id: room._id });
        socket.emit('success', { message: 'Room and all messages deleted successfully' });

    } catch (error) {
        console.error("🚀 ~ deleteAllMessages ~ error:", error);
        socket.emit('error', { message: 'Error deleting messages and room history', error });
    }
};
