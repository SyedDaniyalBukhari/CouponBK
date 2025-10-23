const cloudinary = require('cloudinary').v2;
  
cloudinary.config({
  cloud_name: "dbjwbveqn",
  api_key: "774241215571685",
  api_secret: "ysIyik3gF03KPDecu-lOHtBYLf8"
});

module.exports.cloudinaryUpload = async (fileToUpload) => {
  try {
    console.log("Attempting to upload file:", fileToUpload);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(fileToUpload)) {
      throw new Error(`File does not exist: ${fileToUpload}`);
    }
    
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: 'auto',
      folder: 'coupon-banners', // Optional: organize uploads in folders
      use_filename: true,
      unique_filename: true,
      quality: 'auto', // Optimize quality
      fetch_format: 'auto' // Optimize format
    });
    
    console.log("Cloudinary upload successful:", data.secure_url);
    
    return {
      url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      resource_type: data.resource_type
    };
    
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};