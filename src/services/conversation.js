const {
  errors: { NotFoundError },
} = require("../utils");
const { Service, Company, User, Conversation } = require("../models");

const getConversation = async ({ serviceId, companyId, userId }) => {
  const [service, company, user] = await Promise.all([
    Service.findById(serviceId),
    Company.findById(companyId),
    User.findById(userId),
  ]);

  if (!user) throw new NotFoundError("Usuário não encontrado");
  if (!company) throw new NotFoundError("Empresa não encontrada");
  if (!service) throw new NotFoundError("Serviço não encontrado");

  try {
    const conversation = await Conversation.findOne({
      user: { _id: userId },
      company: { _id: companyId },
      service: { _id: serviceId },
    })
      .populate("user")
      .populate("company")
      .populate("service")
      .populate("messages");

    return conversation;
  } catch (error) {
    console.error("Error while loading conversation:", error.message);
    return null;
  }
};

const createConversation = async ({ serviceId, companyId, userId }) => {
  const [service, company, user] = await Promise.all([
    Service.findById(serviceId),
    Company.findById(companyId),
    User.findById(userId),
  ]);

  if (!user) throw new NotFoundError("Usuário não encontrado");
  if (!company) throw new NotFoundError("Empresa não encontrada");
  if (!service) throw new NotFoundError("Serviço não encontrado");

  const conversation = new Conversation({ service, company, user });
  await conversation.save();

  return conversation;
};

const getCompaniesConversation = async (companiesIDs) => {
  return Conversation.find({ company: companiesIDs })
    .populate("service")
    .populate("company")
    .populate("user")
    .populate("messages");
};

module.exports = { getConversation, createConversation, getCompaniesConversation };
