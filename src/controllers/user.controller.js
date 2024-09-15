const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

// dotenv.config();

// Function to handle error responses
const handleError = (res, statusCode, message) => {
    return res.error({ status: statusCode, message });
};

//  Create a new user
async function createUser(req, res) {
    console.log("🚀 ~ createUser ~ req:", req)

}

module.exports = {
    createUser,
}