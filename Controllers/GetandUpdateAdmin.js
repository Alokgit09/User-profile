const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");


const destinationPath = path.join(__dirname, "../uploads");

const getAlldata = async (req, res) => {
  const user = req.user;
  const { id } = req.user;
  // console.log("Usrr Admin>>", id);
  try {
    if( user.role === "admin" ) {
      const getall = await User.find();
      res.status(201).json(getall);
    }else{
      const userdata = await User.find({ _id: id });
      res.status(201).json(userdata);
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};




const updateuserAlladmin = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
      const findId = await User.findById(id);
      if (!findId) {
        return res.status(404).json({ message: "User not Found" });
      }
      
      let updateUser = {};
      if (req.body.name) updateUser.name = req.body.name;
      if (req.body.email) updateUser.email = req.body.email;
      if (req.file) {
        updateUser.profileIcon = `/${req.file.filename}`;
        if (findId.profileIcon) {
          const oldImage = path.join(destinationPath, findId.profileIcon);
          fs.unlink(oldImage, (err) => {
            if (err) {
              console.log('Error deleting old image:', err);
            } else {
              console.log('Old image successfully deleted:', oldImage);
            }
          });
        }
      }
  
      const options = { new: true, runValidators: true };
      if (Object.keys(updateUser).length > 0) {
        const userUpdated = await User.findByIdAndUpdate(id, updateUser, options);
        res.status(201).json(userUpdated);
        console.log("userUpdated>>>", Object.keys(updateUser));
      } else {
        res.status(400).json({ message: "No fields to update" });
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };


  const DeleteuserbyAdmin = async (req, res) => {
   const { id } = req.params;
   const user = req.user;
   const idData = await User.findById(id);
   console.log("idData>>", idData);
   try{
    const userDelete = await User.findByIdAndDelete(id);
    if(idData.profileIcon){
        const imagePath = path.join(destinationPath, idData.profileIcon);
       if(fs.existsSync(imagePath)){
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully"); 
       }else{
        console.log('Image path not found');
       }
    }
    res.status(200).json({ message: "User deleted successfully", user: userDelete });
   }catch{
    return res.status(400).json({ message: err.message });
   }
  };


module.exports = {
  getAlldata,
  updateuserAlladmin,
  DeleteuserbyAdmin,
};
