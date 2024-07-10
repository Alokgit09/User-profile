const User = require("../Models/User");
const path = require("path");
const fs = require("fs");

const destinationPath = path.join(__dirname, "../uploads");

const editUserDetails = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id);
    if (!user) {
      if (req.file) {
        // If user not found and file was uploaded, delete the file
        fs.unlinkSync(path.join(destinationPath, req.file.filename));
      }
      return res.status(404).json({ message: "User not found" });
    }

    // Create a plain object with the fields to be updated
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.file) {
      // Handle the new image file
      updateData.profileIcon = `/${req.file.filename}`;

      // Delete the old image file if it exists
      if (user.profileIcon) {
        const oldImage = path.join(destinationPath, path.basename(user.profileIcon));
        fs.unlink(oldImage, (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
          } else {
            console.log("Old image deleted successfully");
          }
        });
      }
    }

    const options = { new: true, runValidators: true };
   console.log("example>>>>>", Object.keys(updateData).length > 0);
    // Perform the update only if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const userUpdate = await User.findByIdAndUpdate(id, updateData, options);
      res.status(200).json(userUpdate);
      console.log("userUpdate>>", userUpdate);
      console.log(Object.keys(updateData));
    } else {
      res.status(400).json({ message: "No fields to update" });
    }
  } catch (err) {
    console.log({ message: err});
    return res.status(400).json({ message: err.message });
  }
};

module.exports = editUserDetails;