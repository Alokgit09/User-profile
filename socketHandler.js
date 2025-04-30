module.exports = (io) => {
  let users = {}; // Store users and their socket IDs

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register the user with their userId
    socket.on("register", (userId) => {
      users[userId] = socket.id;
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
      console.log("All registered users:", users);
    });

    socket.on("offer", ({ to, from, offer }) => {
      console.log(`📤 Offer received at server from ${from} to ${to}`);
      const targetSocketId = users[to];
      if (targetSocketId) {
        console.log(`Forwarding offer from ${from} to ${to}`);
        io.to(targetSocketId).emit("offer", { offer, from, to });
      }
    });

    // Answer forwarding
    socket.on("answer", ({ answer, to, from }) => {
      console.log(`📥 Answer received at server from ${from} to ${to}`);
      const targetSocketId = users[to];
      if (targetSocketId) {
        console.log(`Forwarding answer from ${from} to ${to}`);
        io.to(targetSocketId).emit("answer", { answer, from, to });
      }
    });

    socket.on("candidate", ({ candidate, to, from }) => {
      const toSocketId = users[to];
      if (toSocketId) {
        console.log(`Forwarding ICE candidate from ${from} to ${to}`);
        io.to(toSocketId).emit("candidate", { candidate, from });
      } else {
        console.warn(`No socket ID found for user ${to}`);
      }
    });

    socket.on("callEnded", ({ to, from }) => {
      socket.to(to).emit("remoteCallEnded");
    });

    // Handle public message (your original chat)
    socket.on("chat message", (data) => {
      console.log("Public message:", data);
      socket.broadcast.emit("response", data); // send to everyone except sender
    });

    socket.on("is_user_online", (receiverId, callback) => {
      console.log("User check:", receiverId, "->", users[receiverId]);
      callback(!!users[receiverId]);
    });

    socket.on("private_message", ({ senderId, receiverId, message }) => {
      console.log(
        `Private message from ${senderId} to ${receiverId}: ${message}`
      );
      const recipientSocketId = users[receiverId];
      console.log(`Recipient Socket ID: ${recipientSocketId}`);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive_private_message", {
          senderId,
          message,
        });
      } else {
        console.log(`User ${receiverId} not connected`);
      }
    });

    // On disconnect, remove user from users list
    socket.on("disconnect", () => {
      for (let userId in users) {
        if (users[userId] === socket.id) {
          // console.log(`User ${userId} disconnected`);
          delete users[userId];
          console.log(
            `❌ User ${userId} disconnected and removed from users map`
          );
          break;
        }
      }
    });
  });
};
