const { Router } = require("express");
const { validateToken, getUserFromToken } = require("../middlewares");
const Transaction = require("../models/Transaction");
const { CompanyService, ServiceService, UserService, TransactionService } = require("../services");
const {
  logger,
  errors: { UnauthorizedError },
} = require("../utils");
const { BadRequestError } = require("../utils/errors");

const router = Router();
const log = logger("Service Controller");

router.get("/offers", async (req, res, next) => {
  const { limit, offset } = req.query;
  const todayWeekday = new Date().getDay();

  try {
    const offers = await ServiceService.getServicesByDay(todayWeekday, { limit, offset });

    return res.send(offers);
  } catch (error) {
    log.error("Could not load day offers", { todayWeekday, error });
    next(error);
  }
});

router.get("/search", async (req, res, next) => {
  const { limit = 20, offset = 0, term = "" } = req.query;
  log.info(`Searching services by name: ${term}`);

  try {
    const services = await ServiceService.search(term, { limit, offset });
    return res.send(services);
  } catch (error) {
    log.error("Could not load services by term", { term, error });
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    log.info(`Get service by id (${id})`);
    const service = await ServiceService.getById(id);

    return res.send(service);
  } catch (error) {
    log.error("Could not find service", { id, error });
    next(error);
  }
});

router.delete("/:id", validateToken, getUserFromToken, async (req, res, next) => {
  const { id } = req.params;

  try {
    const {
      company: { id: companyId },
    } = await ServiceService.getById(id);

    const company = await CompanyService.getCompanyById(companyId);

    if (req.userId !== company.user.id) throw new UnauthorizedError("Service does not belong to company");

    await ServiceService.deleteService(id);

    return res.status(204).send();
  } catch (error) {
    log.error("Could not delete service", { id, error });
    next(error);
  }
});

router.post("/:serviceId/book", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    params: { serviceId },
    userId,
    body: { companyId, value, time, day },
  } = req;

  try {
    if (await TransactionService.validateTransaction(serviceId, day, time)) {
      throw new BadRequestError("Horário não disponível");
    }

    const [seller, buyer, service] = await Promise.all([
      CompanyService.getCompanyById(companyId),
      UserService.getById(userId),
      ServiceService.getById(serviceId),
    ]);

    const payload = {
      seller,
      buyer,
      service,
      value,
      time,
      day,
    };

    const transaction = new Transaction(payload);
    await transaction.save();

    return res.status(201).send(transaction);
  } catch (error) {
    log.error("Could not book service", { serviceId, userId, error });
    next(error);
  }
});

module.exports = router;
