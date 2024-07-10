const User = require("../Models/User");

const makeAdminbyadmin = async (req, res) => {
  const { id } = req.params;
  const findUser = await User.findById(id);
  try {
    if (!findUser) {
      return res.status(404).send("User not found");
    }
    // const setRole = findUser.set({ role: 'admin' });
    // await findUser.save();
    const findUpdate = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { role: "admin" } },
      { new: true }
    );
    res.json(findUpdate);
    console.log("make admin>>>>>", findUpdate);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports = makeAdminbyadmin;
