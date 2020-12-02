const {
  errors: { NotFoundError },
} = require("../utils");
const { Message, Company, User } = require("../models");
const { UnauthorizedError } = require("../utils/errors");
const Conversation = require("../models/Conversation");

const createMessage = async (payload) => {
  const { conversationId, text, sender, userId } = payload;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new NotFoundError("Chat não encontrado");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Usuario não encontrado");

  const message = new Message({ text, conversation, user, sender });

  await message.save();
  conversation.messages.push(message);
  await conversation.save();

  return message;
};

const deleteMessage = async ({ userId, id }) => {
  const message = await Message.findById(id);

  if (message.sender.id !== userId) {
    throw UnauthorizedError("Mensagem não pertence ao usuário");
  }

  return Message.findByIdAndDelete(id);
};

const getMessagesForUser = async ({ userId, companyId }) => {
  const company = await Company.findById(companyId);
  if (!company) throw NotFoundError("Empresa não encontrada");

  const sentMessages = await Message.find({
    sender: { _id: userId },
    company: { _id: companyId },
    direction: "from-user",
  });
  const receivedMessages = await Message.find({
    sender: { _id: companyId },
    company: { _id: companyId },
    direction: "from-owner",
  });

  return [...sentMessages, ...receivedMessages].sort((a, b) => {
    return a.createdAt > b.createdAt;
  });
};

const getMessagesFromCompanies = async (ids) => {
  const obj = {};
  for (const id of ids) {
    const messages = await Message.find({
      company: id,
    })
      .populate("company")
      .populate("sender");

    console.log(`Found ${messages.length} for companyId ${id}`);
    obj[id] = messages;
  }

  return obj;
};

module.exports = {
  createMessage,
  deleteMessage,
  getMessagesForUser,
  getMessagesFromCompanies,
};
