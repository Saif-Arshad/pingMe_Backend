const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { sanitizeObject } = require("../utils/sanitize");
const { User, UserToken } = require("../../models/User");
// dotenv.config();

// Function to handle error responses
const handleError = (res, statusCode, message) => {
    return res.status(statusCode).json({ status: statusCode, message });
};

//  Create a new user
async function createUser(req, res) {
    const data = sanitizeObject(req.body);
    console.log("🚀 ~ createUser ~ data:", data)
    if (!data.email || !data.password || !data.userName) {
        return handleError(res, 400, "Please provide email and password");
    }
    const isEmailAlreadyExist = await User.findOne({ email: data.email });
    if (isEmailAlreadyExist) {
        return handleError(res, 400, "Email already exists");
    }
    const isUserNameAlreadyExist = await User.findOne({ username: data.userName });
    if (isUserNameAlreadyExist) {
        return handleError(res, 400, "User Name already exists");
    }
    try {
        const newUser = new User({
            username: data.userName,
            email: data.email,
            password: await bcrypt.hash(data.password, 10),
        });

        // Save the new user using async/await
        const savedUser = await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.SECRET, {
            expiresIn: "15d",
        });
        await UserToken.create({ token });

        return res.status(200).json({
            status: 200,
            message: "User created successfully",
            data: savedUser,
            token
        });

    } catch (error) {
        console.error("🚀 ~ createUser ~ error:", error);
        return handleError(res, 500, "Error in registering user", error);
    }
}

//  login user

async function loginUser(req, res) {
    const data = sanitizeObject(req.body);
    if (!data.Credential || !data.password) {
        return handleError(res, 400, "Please provide email and password");
    }
    try {
        const user = await User.findOne({ email: data.email });
        if (!user) {
            return handleError(res, 404, "User not found");
        }
    } catch (error) {
        console.log("🚀 ~ loginUser ~ error:", error)
        return handleError(res, 500, "Error in login user", error);

    }
}

module.exports = {
    createUser,
}