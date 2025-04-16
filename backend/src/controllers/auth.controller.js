import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";

// Signup controller
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    console.log("Signup request received:", { fullName, email });
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully");

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      console.log("Creating token for user:", newUser._id);
      generateToken(newUser._id, res);
      await newUser.save();
      console.log("User saved to database successfully");

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login:", error.message);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Logout controller
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: true
    });
    res.status(200).json({message: "Logged out successfully"});
  } catch (error) {
    console.log("Error in logout:", error.message);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update profile controller
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
};

// Check authentication controller
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth", error.message);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};