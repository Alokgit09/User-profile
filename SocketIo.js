module.exports = (io) => {
    let users = {}; // Store users and their socket IDs

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // When a user joins, store their userId with the socket ID
        socket.on("join", (userId) => {
            users[userId] = socket.id;
            console.log(`User ${userId} connected with socket ID: ${socket.id}`);
        });

        // Handle private messages
        socket.on("privateMessage", ({ senderId, receiverId, message }) => {
            console.log(`Private message from ${senderId} to ${receiverId}: ${message}`);

            const receiverSocketId = users[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
            } else {
                console.log(`User ${receiverId} is not online.`);
            }
        });

        socket.on('chat message', (data) => {
            console.log('Message from client:', data);
            socket.broadcast.emit('response', data);
        });

        // When a user disconnects, remove them from the users list
        socket.on("disconnect", () => {
            for (let userId in users) {
                if (users[userId] === socket.id) {
                    console.log(`User ${userId} disconnected`);
                    delete users[userId];
                    break;
                }
            }
        });
    });
};
