const { User } = require("../../models/User");

exports.getCurrentUser = async (socket, id) => {
    try {
        const currentUser = await User.findById(id).populate({
            path: 'roomHistory',
            model: 'Room',
            populate: [
                {
                    path: 'messages',
                    model: 'Message',
                },
                // You can uncomment this if you need participant details
                // {
                //   path: 'participants',
                //   model: 'User',
                // },
            ],
        });

        if (!currentUser) {
            return socket.emit('error', { message: 'User not found' });
        }

        // Emit the user data with a proper event name
        socket.emit('currentUserData', currentUser);
    } catch (error) {
        // Emit the error with the event name
        socket.emit('error', {
            message: 'Something went wrong while getting the user',
            error: error.message,
        });
    }
};
