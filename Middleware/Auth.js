const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const userAuthanting = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
       // console.log("🔍 Received Authorization Header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization header is missing or invalid" });
        }

        const token = authHeader.split(" ")[1]; // Correct way to extract token
        const verify = jwt.verify(token, SECRET_KEY);

        // console.log("✅ Token Verified:", verify);

        const user = await User.findById(verify.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next(); // Proceed
    } catch (err) {
        console.error("❌ Auth Error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = userAuthanting;
