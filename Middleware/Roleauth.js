const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const roleAccess = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  try {
    const token = authHeader.substring(7); // Remove 'Bearer ' from token
    const verify = jwt.verify(token, SECRET_KEY);
    if(verify){
      const findId = await User.findById({ _id: verify.id});
      if (findId.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden 403 User Not Authorized' });
      }
    }else{
        return res.status(401).json({ message: "Invalid token" });
    }
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

module.exports = roleAccess;
