const { Message } = require("../../models/Room");

exports.saveMessage = async (senderId, receiverId, messageContent) => {
    try {
        const message = new Message({
            message: messageContent,
            sender: senderId,
            receiver: receiverId,
        });
        await message.save();
        return message;
    } catch (error) {
        console.error("Error in saveMessage:", error);
        throw error;
    }
};
