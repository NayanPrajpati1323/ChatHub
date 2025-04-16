import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";

// ... existing code ...

//updateProfile
export const updateProfile = async (req, res) => {
  const { profilePic } = req.body;
  const userId = req.user._id;

  if (!profilePic) {
    return res.status(400).json({ message: "Profile pic is required" });
  }

  // Basic validation for base64 image
  if (!profilePic.startsWith('data:image/')) {
    return res.status(400).json({ message: "Invalid image format" });
  }

  try {
    console.log("Uploading profile picture for user:", userId);
    
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      resource_type: "image"
    });
    
    if (!uploadResponse || !uploadResponse.secure_url) {
      return res.status(500).json({ message: "Failed to upload image to Cloudinary" });
    }
    
    console.log("Cloudinary upload successful, updating user");
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { profilePic: uploadResponse.secure_url }, 
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile:", error);
    res.status(500).json({ 
      message: error.message || "Failed to update profile picture",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// ... existing code ... 