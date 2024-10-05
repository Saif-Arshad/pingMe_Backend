const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sanitizeObject } = require("../utils/sanitize");
const { User, UserToken } = require("../../models/User");
const cloudinary = require('../utils/cloudinary')
// Function to handle error responses
const handleError = (res, statusCode, message) => {
    return res.status(statusCode).json({ status: statusCode, message });
};



// getUsers for Chat

async function getUsers(req, res) {
    const currentUser = req.user

    try {
        const user = await User.find()
        // .populate({
        //     path: 'roomHistory',
        //     populate: {
        //         path: 'messages',
        //         model: 'Message'
        //     }
        // });


        const allUsers = user.filter((item) => item._id != currentUser.id)
        return res.status(200).json({
            success: true,
            message: `fetch all users successfully`,
            data: allUsers
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error in getting User",
            error: error
        })
    }
}

//  Create a new user
async function createUser(req, res) {
    const data = sanitizeObject(req.body);
    const { profileImage, bannerImage } = req.body;

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
            profileImage: profileImage,
            bannerImage: bannerImage
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
        return handleError(res, 500, "Error in registering user");
    }
}

//  login user

async function loginUser(req, res) {
    const data = sanitizeObject(req.body);
    if (!data.Credential || !data.password) {
        return handleError(res, 400, "Please provide email and password");
    }
    try {
        const user = await User.findOne({ $or: [{ email: data.Credential }, { username: data.Credential },] });
        if (!user) {
            return handleError(res, 404, "User Credentials are not correct");
        }
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            return handleError(res, 404, "User Credentials are not correct")
        }
        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: "15d",
        });
        await UserToken.create({ token });
        return res.status(200).json({
            status: 200,
            message: "User logged in successfully",
            data: user,
            token
        })
    } catch (error) {
        return handleError(res, 500, "Error in login user");

    }
}


//  userName checking API 

async function checkUserName(req, res) {
    const data = sanitizeObject(req.body)
    if (!data.userName) {
        return handleError(res, 400, "Please provide username")
    }
    const checkName = await User.findOne({ username: data.userName })
    if (checkName) {
        return res.status(200).json({
            status: 200,
            message: "Username already exist",
            data: checkName
        })
    }
    return res.status(200).json({
        status: 200,
        message: "Username is available",
        data: checkName
    })

}

async function signAdminOut(req, res) {
    try {
        await UserToken.deleteOne({ token: req.token });
        return res.status(200).json({
            status: 200,
            message: "Logged out successfully",
        })

    } catch (err) {
        return handleError(res, 500, err.message);
    }
}
//update user Info 
async function updateUser(req, res) {
    const data = sanitizeObject(req.body)
    // const result = await cloudinary.uploader.upload(data.image, {
    //     folder: "user",
    // });
    // const url = cloudinary.url(result.public_id, {
    //     transformation: [
    //         {
    //             quality: "auto",
    //             fetch_format: "auto"
    //         }, {
    //             width: 500,
    //             height: 500,
    //             crop: "fill",
    //             gravity: "auto"
    //         }
    //     ]

    // })

}


module.exports = {
    getUsers,
    createUser,
    updateUser,
    loginUser,
    checkUserName,
    signAdminOut
}