const express = require("express");
const message = require("../Models/Message");

const MessageSender = async (req, res) => {
const { sender, receiver, message: msg } = req.body;  

  try {
    const newMessage = new message({
      sender,
      receiver,
      message: msg,
    });

    await newMessage.save();
    res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

module.exports = MessageSender;
