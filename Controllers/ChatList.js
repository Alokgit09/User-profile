const User = require("../Models/User");

const getChatlistuser = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user ID in req.user
    const findUser = await User.find({ role: "user" });
    if (!findUser){
        return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "User found", data: findUser });
  }catch (err){
    return res.status(500).json({ error: "Server error", details: err.message });
  };
};


module.exports = getChatlistuser;