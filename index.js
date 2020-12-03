const server = require("./src/app");

const { PORT } = require("./src/config");
const { logger, eventHandler } = require("./src/utils");

const log = logger("Application");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  log.info(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  eventHandler.on("NEW_MESSAGE_FROM_USER", (payload) => {
    log.info("New message from user");
    socket.emit("NEW_MESSAGE_FROM_USER", payload);
  });

  eventHandler.on("NEW_MESSAGE_FROM_COMPANY", (payload) => {
    log.info("New message from company");
    socket.emit("NEW_MESSAGE_FROM_COMPANY", payload);
  });
});

server.listen(PORT, () => {
  log.info(`Listening to port ${PORT}`);
});
