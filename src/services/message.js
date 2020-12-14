const {
  errors: { NotFoundError, UnauthorizedError },
} = require("../utils");
const { Message, Company, User, Conversation } = require("../models");

const createMessage = async (payload) => {
  const { conversationId, text, sender, userId } = payload;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new NotFoundError("Chat não encontrado");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Usuario não encontrado");

  const newMessage = new Message({ text, conversation, user, sender });
  await newMessage.save();

  return newMessage;
};

const deleteMessage = async ({ userId, id }) => {
  const message = await Message.findById(id);

  if (message.sender.id !== userId) {
    throw UnauthorizedError("Mensagem não pertence ao usuário");
  }

  return Message.findByIdAndDelete(id);
};

const getMessagesFromCompanies = async (ids) => {
  const obj = {};
  for (const id of ids) {
    const messages = await Message.find({
      company: id,
    })
      .populate("company")
      .populate("sender");

    obj[id] = messages;
  }

  return obj;
};

module.exports = {
  createMessage,
  deleteMessage,
  getMessagesFromCompanies,
};
