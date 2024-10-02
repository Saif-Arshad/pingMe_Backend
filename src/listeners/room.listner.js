const { Room } = require("../../models/Room");
const { User } = require("../../models/User");

exports.getOrCreateRoom = async (user1Id, user2Id) => {
    const roomId = [user1Id, user2Id].sort().join('-');

    // Check if the room already exists
    let room = await Room.findOne({ roomId });
    console.log("🚀 ~ exports.getOrCreateRoom= ~ room:", room)
    if (!room) {
        // Create a new room
        console.log("working")
        room = new Room({ roomId, participants: [user1Id, user2Id] });
        await room.save();

        // Update users' roomHistory
        const users = await User.find({ _id: { $in: [user1Id, user2Id] } });
        await Promise.all(users.map(async (user) => {
            if (!user.roomHistory.includes(room._id)) {
                user.roomHistory.push(room._id);
                await user.save();
            }
        }));
    }
    return room;
};
