const { Router } = require("express");

const { ConversationService, MessageService } = require("../services");
const { logger, eventHandler } = require("../utils");
const { validateToken, getUserFromToken } = require("../middlewares");

const router = Router();
const log = logger("Conversation Controller");

router.post("/:conversationId/messages", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    userId,
    body: { text, sender },
    params: { conversationId },
  } = req;
  const payload = { conversationId, text, sender, userId };

  log.info("Adding message to conversation", JSON.stringify({ userId, conversationId, sender }));

  try {
    const message = await MessageService.createMessage(payload);

    const eventName = sender === "USER" ? "NEW_MESSAGE_FROM_USER" : "NEW_MESSAGE_FROM_COMPANY";
    log.info(`Emitting event: ${eventName}`);

    eventHandler.emit(eventName, { userId, conversationId, message });

    return res.status(201).send(message);
  } catch (error) {
    log.error("Could not create message", { error });
    next(error);
  }
});

router.post("/", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    userId,
    body: { companyId, serviceId },
  } = req;

  const payload = {
    userId,
    companyId,
    serviceId,
  };

  log.info("Creating or retrieving conversation", JSON.stringify(payload));

  try {
    const conversation = await ConversationService.getConversation({ serviceId, companyId, userId });

    if (conversation) {
      log.info("Conversation found:", conversation.id);
      return res.status(200).send(conversation);
    }

    return ConversationService.createConversation({ serviceId, companyId, userId });
  } catch (error) {
    log.error("Could not create conversation", { error });
    next(error);
  }
});

router.get("/", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    userId,
    query: { companyId, serviceId },
  } = req;

  log.info("Loading conversation", JSON.stringify({ userId, companyId, serviceId }));

  try {
    const conversation = await ConversationService.getConversation({ userId, companyId, serviceId });
    return res.status(200).send(conversation);
  } catch (error) {
    log.error("Could not load conversation", { error });
    next(error);
  }
});

module.exports = router;
