const server = require("./src/app");

const { PORT } = require("./src/config");
const { logger, eventHandler } = require("./src/utils");

const appLog = logger("Application");
const wsLog = logger("WebSocket");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const connections = new Set();
const relationship = {};

io.on("connection", (socket) => {
  const userId = socket.id;
  wsLog.debug(`User connected: ${userId}`);

  connections.add(userId);

  socket.on("disconnect", () => {
    wsLog.debug(`User disconnected: ${userId}`);
    connections.delete(userId);
  });

  socket.on("join", (id) => {
    wsLog.debug(`User joined: ${id}`);
    relationship[id] = userId;
  });
});

eventHandler.on("NEW_MESSAGE_FROM_USER", (payload) => {
  wsLog.debug(`New message from ${payload.userId} to ${payload.room}`);

  const sendToRoom = relationship[payload.room];

  // io.emit("NEW_MESSAGE_FROM_USER", payload);
  io.to(sendToRoom).emit("NEW_MESSAGE_FROM_USER", payload);
});

eventHandler.on("NEW_MESSAGE_FROM_COMPANY", (payload) => {
  wsLog.debug(`New message from ${payload.userId} to ${payload.room}`);

  const sendToRoom = relationship[payload.room];

  // io.emit("NEW_MESSAGE_FROM_COMPANY", payload);
  io.to(sendToRoom).emit("NEW_MESSAGE_FROM_COMPANY", payload);
});

setInterval(() => {
  wsLog.debug(`Connected users to WS: ${connections.size}`);
}, 30000);

server.listen(PORT, () => {
  appLog.info(`Listening to port ${PORT}`);
});
