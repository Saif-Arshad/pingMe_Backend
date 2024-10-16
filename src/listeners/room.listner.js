const { Room } = require("../../models/Room");
const { User } = require("../../models/User");

exports.getOrCreateRoom = async (user1Id, user2Id) => {
    try {
        const roomId = [user1Id, user2Id].sort().join('-');

        let room = await Room.findOne({ roomId });
        console.log("🚀 ~ exports.getOrCreateRoom= ~ room:", room)

        if (!room) {
            room = new Room({ roomId, participants: [user1Id, user2Id] });
            await room.save();
        }

        const users = await User.find({ _id: { $in: [user1Id, user2Id] } });

        await Promise.all(users.map(async (user) => {
            if (!user.roomHistory.includes(room._id)) {
                user.roomHistory.push(room._id);
                await user.save();
            }
        }));

        return room;

    } catch (error) {
        console.error("Error in getOrCreateRoom:", error);
        throw new Error("Failed to get or create room");
    }
};
