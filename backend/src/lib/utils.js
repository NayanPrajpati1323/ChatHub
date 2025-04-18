import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"  // Fixed typo
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // Prevent XSS attacks
        sameSite: "none", // Changed to none for cross-origin
        secure: true, // Required when sameSite is None
    });

    return token;
};
