const { Room } = require("../../models/Room");
const { User, UserToken } = require("../../models/User");

exports.getOrCreateRoom = async (user1Id, user2Id) => {
    const roomId = [user1Id, user2Id].sort().join('-');

    let room = await Room.findOne({ roomId });
    if (!room) {
        room = new Room({ roomId, participants: [user1Id, user2Id] });
        await room.save();
        const users = await User.find({
            _id: { $in: [user1Id, user2Id] }
        });
        users.map(async (user) => {
            if (!user.roomHistory.includes(room._id)) {
                user.roomHistory.push(room._id);
                return user.save();
            }
        });
    }
    return room;
};