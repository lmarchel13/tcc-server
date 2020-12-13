const server = require("./src/app");
const { logger, eventHandler } = require("./src/utils");
const io = require("socket.io")(server, { cors: { origin: "*" } });

const log = logger("WebSocket");
const connections = new Set();
const relationship = {};

io.on("connection", (socket) => {
  const userId = socket.id;
  log.debug(`User connected: ${userId}`);

  connections.add(userId);

  socket.on("disconnect", () => {
    log.debug(`User disconnected: ${userId}`);
    connections.delete(userId);
  });

  socket.on("join", (id) => {
    log.debug(`User joined: ${id}`);
    relationship[id] = userId;
  });
});

eventHandler.on("NEW_MESSAGE_FROM_USER", (payload) => {
  log.debug(`NEW_MESSAGE_FROM_USER from ${payload.userId} to ${payload.room}`);

  const sendToRoom = relationship[payload.room];

  io.to(sendToRoom).emit("NEW_MESSAGE_FROM_USER", payload);
});

eventHandler.on("NEW_MESSAGE_FROM_COMPANY", (payload) => {
  log.debug(`NEW_MESSAGE_FROM_COMPANY from ${payload.userId} to ${payload.room}`);

  const sendToRoom = relationship[payload.room];

  io.to(sendToRoom).emit("NEW_MESSAGE_FROM_COMPANY", payload);
});

eventHandler.on("NEW_CONVERSATION", (payload) => {
  log.debug(`NEW_CONVERSATION from ${payload.userId} to ${payload.room}`);
  const sendToRoom = relationship[payload.room];

  io.to(sendToRoom).emit("NEW_CONVERSATION", payload);
});

setInterval(() => {
  log.debug(`Connected users to WS: ${connections.size}`);
}, 5000);
