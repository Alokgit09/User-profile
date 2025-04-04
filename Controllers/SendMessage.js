const express = require("express");
const message = require("../Models/Message");

const MessageSender = async (req, res) => {
    const userId = req.user._id; // Assuming you have user ID in req.user
    console.log(userId);
 try{
 const { sender, receiver, messageContent } = req.body;
 if (!sender || !receiver || !message) {
    return res.status(400).json({ error: 'All fields are required' });
}
 const newMessage = new message({
        sender : "userId",
        receiver: "",
        message: messageContent
 });
 await newMessage.save();
 res.status(200).json({ message: "Message sent successfully", data: newMessage });
 }catch(err){
    res.status(500).json({ err: 'Server error', details: err.message });
 }
};

module.exports = MessageSender;