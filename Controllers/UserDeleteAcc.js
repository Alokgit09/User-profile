const path = require('path');
const fs = require('fs');
const User = require("../Models/User");

const destinationPath = path.join(__dirname, "../uploads");

const userDeleteAccount = async (req, res) => {
  const { _id, profileIcon } = req.user;
  console.log("User details from req.user:", _id, profileIcon);
  
  if (!_id) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const userDeleted = await User.findByIdAndDelete(_id);

    if (profileIcon) {
      const imagePath = path.join(destinationPath, profileIcon);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
      } else {
        console.log("Image not found");
      }
    }

    res.status(200).json({ message: "User deleted successfully", user: userDeleted });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports = userDeleteAccount;