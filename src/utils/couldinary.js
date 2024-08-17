const v2 = require("cloudinary");
const cloudinary = v2;

const fs = require("fs");

(async function () {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.cloudinary_name,
    api_key: process.env.cloudinary_api_key,
    api_secret: process.env.cloudinary_api_secret, // Click 'View Credentials' below to copy your API secret
  });
})();

const uploadOnCloundinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File is Uploaded on cloudinary...", response.url);
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath)
    console.log(error);
    return null;
  }
};


module.exports = uploadOnCloundinary