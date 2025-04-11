const message = require("../Models/Message");

const getConversation = async (req, res) => {
  const { user1, user2 } = req.params;
console.log("User1:", user1, "User2:", user2);
  try {
    const messages = await message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 }); // oldest to newest

    console.log("Conversation messages:", messages);
    res.status(200).json({ success: true, messages });

  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve conversation" });
  }
};

module.exports = getConversation;