const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const userAuthanting = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' from token
    const verify = jwt.verify(token, SECRET_KEY);

    if (verify) {
      const user = await User.findOne({ _id: verify.id });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // console.log("User:", user);
      req.user = user; // Attach user to request object for further use
      return next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (err) {
    console.error(err,'?????????????????????');
    return res.status(401).json({ message: err.message });
  }
};

module.exports = userAuthanting;
