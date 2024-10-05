const { User } = require("../../models/User");

exports.blockUser = async (data, socket) => {
    try {
        const { currentUserId, userId } = data;
        console.log("🚀 ~ exports.blockUser= ~ userId:", userId)
        console.log("🚀 ~ exports.blockUser= ~ currentUserId:", currentUserId)
        console.log("🚀 ~ data:", data.currentUserId    );

        // Find the current user
        const currentUser = await User.findById(currentUserId);
        console.log("🚀 ~ exports.blockUser= ~ currentUser:", currentUser)
        if (!currentUser) {
            socket.emit('error', { message: 'No user found with this id' });
            return;
        }

        if (currentUser.blockList.includes(userId)) {
            socket.emit('error', { message: 'User is already blocked' });
            return;
        }

        // Add user to block list
        currentUser.blockList.push(userId);
        await currentUser.save();
        console.log(currentUser);

        // Optionally emit a success event
        // socket.emit('userBlocked', { message: 'User successfully blocked', blockedUserId: userId });
    } catch (error) {
        // Handle any potential errors
        socket.emit('error', { message: 'Something went wrong while blocking the user', error: error.message });
        console.error("Error blocking user:", error);
    }
};

exports.unBlockUser = async (data, socket) => {
    try {
        console.log("🚀 ~ data:", data);
        const { currentUserId, userId } = data;

        // Find the current user
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            socket.emit('error', { message: 'No user found with this id' });
            return;
        }

        if (!currentUser.blockList.includes(userId)) {
            socket.emit('error', { message: 'User is already unblocked' });
            return;
        }

        // Remove the user from the block list by filtering out the userId
        currentUser.blockList = currentUser.blockList.filter((id) => id !== userId);

        // Save the updated user
        await currentUser.save();
        console.log(currentUser);

        // Optionally emit a success event
        // socket.emit('userUnblocked', { message: 'User successfully unblocked', unblockedUserId: userId });
    } catch (error) {
        // Handle any potential errors
        socket.emit('error', { message: 'Something went wrong while unblocking the user', error: error.message });
        console.error("Error unblocking user:", error);
    }
};
