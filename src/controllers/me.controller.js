const { User, UserToken } = require("../../models/User");
const jwt = require("jsonwebtoken");


const handleError = (res, statusCode, message) => {
    return res.status(statusCode).json({ status: statusCode, message });
};

// me route for protected routes
exports.me = async (req, res) => {
    const { headers } = await req.body
    const { authorization } = headers;
    if (!authorization) {
        return handleError(res, 401, "Unauthorized");
    }
    const token = authorization.split(" ")[1];
    console.log("🚀 ~ exports.me= ~ token:", token)
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log("🚀 ~ exports.me= ~ decoded:", decoded)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.error({ status: 401, message: "Expired token" });
    }
    ""
    try {
        const user = await User.findById(decoded.id);
        console.log("🚀 ~ exports.me= ~ user:", decoded.id)
        if (!user) {
            return handleError(res, 404, "User not found");
        }
        return res.status(200).json({ status: 200, user });
    }
    catch (error) {
        return handleError(res, 500, "Some thing went wrong");
    }
}
