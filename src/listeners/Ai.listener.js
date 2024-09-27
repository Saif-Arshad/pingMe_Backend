const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



exports.generateContent = async (socket, data) => {
    console.log("🚀 ~ exports.generateContent= ~ data:", data)
    console.log("🚀 ~ exports.generateContent= ~ data:", process.env.GOOGLE_API_KEY)
    try {
        const { chat } = data;
        const prompt = `Your name is Ping Me, and you are interacting on the Ping Me website, a sophisticated chat application. Please respond to the user's message in a helpful and engaging manner. Here is the user's query: ${chat}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log(responseText);
        socket.emit('content_generated', {
            isLoading: false,
            response: responseText,
            prompt: chat
        });
    } catch (error) {
        console.error('Error generating content:', error);
        socket.emit('error', { message: 'Error generating content' });
    }
}