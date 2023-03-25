const logger = require("./logger");

const clients = {};

const addClient = (userId, socketId) => {
  clients[userId] = socketId;
};

const removeClient = (userId) => {
  if (clients.hasOwnProperty(userId)) {
    delete clients[userId];
  }
};

function socketHandler(io) {
  
  io.of("/").on("connection", (socket) => {
    // Get profile .
    const { id, isAdmin } = socket.handshake.auth;
    const { topic } = socket.handshake.query;
    logger.info(`[${id}:${isAdmin}][${topic}][${socket.id}] connected`);

    addClient(id, socket.id);

    socket.on("disconnect", () => {
      logger.info(`[${id}:${socket.id}] disconnected`);
      removeClient(id);
    });

    socket.on("messages", (data) => {
      const { items } = data;
      socket.broadcast.to(items).emit("NEW_MESSAGE", data);
    });
  });
}

module.exports = socketHandler



