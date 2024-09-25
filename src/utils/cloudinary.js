const cloudinary = require('cloudinary').v2;

// Cloudnairy Configartion
// # Sidebar programmable media ====> cloud Name
// #Setting > API key   ====> api_key
// #Setting > API SECRET ====>  api_secret

cloudinary.config({
    cloud_name: process.env.CLOUDNAIRY_CLOUD_NAME,
    api_key: process.env.CLOUDNAIRY_API_KEY,
    api_secret: process.env.CLOUDNAIRY_API_SECRET

})

module.exports = cloudinary;
