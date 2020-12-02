const { Router } = require("express");
const { MessageService } = require("../services");
const { validateToken, getUserFromToken } = require("../middlewares");
const { logger } = require("../utils");

const router = Router();
const log = logger("Message Controller");

router.get("/", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    query: { companyId, limit = 20, offset = 0 },
    userId,
  } = req;
  log.info("Loading messages:", { companyId, userId });

  try {
    const messages = await MessageService.getMessagesForUser({ userId, companyId, limit, offset });

    return res.send(messages);
  } catch (error) {
    log.error("Error while loading message for user", error.message);
    next(error);
  }
});

router.post("/", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    userId,
    body: { text, companyId, direction },
  } = req;

  log.info("Sending message:", { userId, text, companyId });

  try {
    const message = await MessageService.createMessage({ text, companyId, userId, direction });

    log.info("Message created", { id: message.id });
    return res.status(201).send(message);
  } catch (error) {
    log.error("Error while creating message", error.message);
    next(error);
  }
});

router.delete("/:id", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    userId,
    params: { id },
  } = req;

  try {
    await MessageService.deleteMessage({ userId, id });
    res.status(204).send({});
  } catch (error) {
    log.error("Error while deleting message", error.message);
    next(error);
  }
});

module.exports = router;
