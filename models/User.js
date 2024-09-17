const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    profileName: {
        type: String,
        required: false,
    },
    searchHistory: {
        type: Array,
        default: []
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    profileImage: {
        type: String,
        required: false,
    },
    blockList: {
        type: Array,
        default: []
    },
    roomHistory: {
        type: Array,
        default: []
    },
    groupHistory: {
        type: Array,
        default: []
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const userTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", UserSchema);
const UserToken = mongoose.model("UserToken", userTokenSchema);
module.exports = { User, UserToken };

