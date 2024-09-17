const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const handleError = (res, statusCode, message) => {
    return res.status(statusCode).json({ status: statusCode, message });
};

exports.generateContent = async (req, res) => {
    try {
        const { prompt } = req.body;
        const result = await model.generateContent(prompt);
        console.log(result.response.text());
        res.status(200).json({ response: result.response.text() });
    } catch (error) {
        handleError(res, 500, "something went wrong");
    }
}