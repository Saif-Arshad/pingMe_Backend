const { User } = require("../../models/User");

exports.archiveUsers = async (data, socket) => {
    try {
        console.log("🚀 ~ data:", data);
        const { currentUserId, userId } = data;

        // Find the current user
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            socket.emit('error', { message: 'No user found with this id' });
            return;
        }

        if (currentUser.archiveUser.includes(userId)) {
            socket.emit('error', { message: 'User is already in archive' });
            return;
        }

        currentUser.archiveUser.push(userId);
        await currentUser.save();
        console.log(currentUser)
        // socket.emit('userBlocked', { message: 'User successfully blocked', blockedUserId: userId });
    } catch (error) {
        // Handle any potential errors
        socket.emit('error', { message: 'Something went wrong while archive the user', error: error.message });
        console.error("Error archiveing user:", error);
    }
};
exports.unArchiveUsers = async (data, socket) => {
    try {
        console.log("🚀 ~ data:", data);
        const { currentUserId, userId } = data;

        // Find the current user
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            socket.emit('error', { message: 'No user found with this id' });
            return;
        }

        if (!currentUser.archiveUser.includes(userId)) {
            socket.emit('error', { message: 'User is not in archive' });
            return;
        }

        currentUser.archiveUser = currentUser.archiveUser.filter((id) => id !== userId);

        await currentUser.save();
        console.log(currentUser)
        // socket.emit('userBlocked', { message: 'User successfully blocked', blockedUserId: userId });
    } catch (error) {
        // Handle any potential errors
        socket.emit('error', { message: 'Something went wrong while archive the user', error: error.message });
        console.error("Error archiveing user:", error);
    }
};
