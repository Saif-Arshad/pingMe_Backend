const jwt = require("jsonwebtoken");
const { UserToken } = require("../../models/User"); // Ensure this model is correctly defined

const verifyUserToken = async (req, res, next) => {
    try {
        let token = req.header("Authorization");

        if (!token) {
            return res.status(403).json({ status: 403, message: "Access Denied" });
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }

        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded;

        // Check if the token has expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ status: 401, message: "Expired token" });
        }

        // Check if the token exists in the database
        const tokenInstance = await UserToken.findOne({ token: token });
        if (!tokenInstance) {
            return res.status(401).json({ status: 401, message: "Session expired" });
        }

        // Pass the token to the next middleware
        req.token = token;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ status: 401, message: "Invalid token" });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ status: 401, message: "Expired token" });
        }

        return res.status(500).json({ status: 500, message: "Please provide token" });
    }
};

module.exports = { verifyUserToken };
