const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sanitizeObject } = require("../utils/sanitize");
const { User, UserToken } = require("../../models/User");
const cloudinary = require('../utils/cloudinary')
const formidable = require('formidable');

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
async function uploadToCloudinary(filePath, options, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                ...options,
                timeout: 60000,
            }
            );
            return result;
        } catch (error) {
            console.error(`Cloudinary upload attempt ${attempts + 1} failed:`, error);
            attempts += 1;
            if (attempts >= maxRetries) {
                throw error; // Throw the error if max retries reached
            }
        }
    }
}

async function updateUser(req, res) {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Error parsing form data:", err);
            return handleError(res, 500, "Failed to parse form data.");
        }

        try {
            const updatedFields = { ...fields }; // Contains text fields like profileName

            // Ensure profileName is a string if it exists
            if (Array.isArray(updatedFields.profileName)) {
                updatedFields.profileName = updatedFields.profileName[0];
            }

            // Check if bannerImage file is present
            if (files.bannerImage && Array.isArray(files.bannerImage) && files.bannerImage.length > 0) {
                console.log("Uploading banner image to Cloudinary...");
                try {
                    const result = await uploadToCloudinary(files.bannerImage[0].filepath, {
                        folder: 'user',
                        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                    });
                    updatedFields.bannerImage = result.secure_url;
                } catch (error) {
                    console.error("Error uploading banner image to Cloudinary:", error);
                    return handleError(res, 500, "Failed to upload banner image.");
                }
            }

            // Check if profileImage file is present
            if (files.profileImage && Array.isArray(files.profileImage) && files.profileImage.length > 0) {
                console.log("Uploading profile image to Cloudinary...");
                try {
                    const result = await uploadToCloudinary(files.profileImage[0].filepath, {
                        folder: 'user',
                        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                    });
                    updatedFields.profileImage = result.secure_url;
                } catch (error) {
                    console.error("Error uploading profile image to Cloudinary:", error);
                    return handleError(res, 500, "Failed to upload profile image.");
                }
            }

            // Update the user information in the database
            const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedFields, { new: true });

            if (!updatedUser) {
                return handleError(res, 404, "User not found.");
            }

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: updatedUser,
            });
        } catch (error) {
            console.error("Error updating user profile:", error);
            return handleError(res, 500, "Failed to update profile.");
        }
    });
}





module.exports = {
    getUsers,
    createUser,
    updateUser,
    loginUser,
    checkUserName,
    signAdminOut
}