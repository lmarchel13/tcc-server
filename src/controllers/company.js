const { Router } = require("express");
const { validateToken, getUserFromToken } = require("../middlewares");
const { CompanyValidator, ServiceValidator, TransactionValidator } = require("./validators");
const {
  CompanyService,
  ServiceService,
  CategoryService,
  UserService,
  TransactionService,
  PaymentMethodService,
} = require("../services");
const { logger } = require("../utils");
const { BadRequestError, UnauthorizedError } = require("../utils/errors");

const router = Router();
const log = logger("Company Controller");

router.get("/my-companies", validateToken, getUserFromToken, async (req, res, next) => {
  log.info("Loading my companies", { userId: req.userId });
  try {
    const companies = await CompanyService.getUserCompanies(req.userId);

    log.info("Company founds", { count: companies.length });

    return res.send(companies);
  } catch (error) {
    log.error("Could not load my company", { error });
    next(error);
  }
});

router.post("/", validateToken, getUserFromToken, CompanyValidator.createCompany, async (req, res, next) => {
  log.info("Creating company", { userId: req.userId });
  const payload = {
    ...req.body,
    userId: req.userId,
  };

  try {
    const user = await UserService.getById(req.userId);
    payload.user = user;

    const company = await CompanyService.createCompany(payload);
    log.info("Company created", { id: company.id });
    return res.status(201).send(company);
  } catch (error) {
    log.error("Could not create company", { error });
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  const { limit = 20, offset = 0, term = "" } = req.query;
  const companies = await CompanyService.find({ limit, offset, term });

  return res.status(200).send(companies);
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const company = await CompanyService.getCompanyById(id);
    return res.status(200).send(company);
  } catch (error) {
    log.error("Could not get company", { id, error });
    next(error);
  }
});

router.patch("/:id", validateToken, getUserFromToken, CompanyValidator.patchCompany, async (req, res, next) => {
  const {
    userId,
    params: { id },
  } = req;

  try {
    const company = await CompanyService.getCompanyById(id);

    if (company.user.id !== userId) {
      log.error("Company does not belong to the user", { companyId: id, userId });
      throw new UnauthorizedError("Company does not belong to the user");
    }

    await CompanyService.updateCompany(id, req.body);
    const updatedCompany = await CompanyService.getCompanyById(id);

    return res.send(updatedCompany);
  } catch (error) {
    log.error("Could not update company", { id, error });

    return next(new BadRequestError(error.message));
  }
});

router.delete("/:id", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    userId,
    params: { id },
  } = req;

  try {
    const company = await CompanyService.getCompanyById(id);

    if (company.user.id !== userId) {
      log.error("Company does not belong to the user", { companyId: id, userId });
      throw new UnauthorizedError("Company does not belong to the user");
    }

    // TODO: Delete services from company

    await CompanyService.deleteCompany(id, req.body);

    return res.send(company);
  } catch (error) {
    log.error("Could not update company", { id, error });

    return next(new BadRequestError(error.message));
  }
});

router.get("/:id/services", async (req, res, next) => {
  const { id } = req.params;
  try {
    await CompanyService.getCompanyById(id);
    const services = await ServiceService.getByCompanyId(id);

    return res.send(services);
  } catch (error) {
    log.error("Could not get services from company", { id, error });
    next(error);
  }
});

router.post(
  "/:id/services",
  validateToken,
  getUserFromToken,
  ServiceValidator.createService,
  async (req, res, next) => {
    const {
      params: { id },
      body,
    } = req;

    log.info(`Creating service for company ${id}`);

    try {
      const company = await CompanyService.getCompanyById(id);
      const category = await CategoryService.getById(req.body.categoryId);

      const payload = { ...body, company, category };
      const service = await ServiceService.createService(payload);

      return res.status(201).send(service);
    } catch (error) {
      log.error("Could not create services for company", { id, error });
      next(new BadRequestError(error.message));
    }
  },
);

router.patch(
  "/:id/services",
  validateToken,
  getUserFromToken,
  ServiceValidator.patchService,
  async (req, res, next) => {
    const {
      params: { id },
      body,
    } = req;

    try {
      await CompanyService.getCompanyById(id);

      const service = await ServiceService.updateService(id, req.body);

      return res.status(200).send(service);
    } catch (error) {
      log.error("Could not update services for company", { id, error });
      next(error);
    }
  },
);

router.get("/:id/transactions", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    params: { id },
    userId,
    query: { limit = 20, offset = 0 },
  } = req;
  try {
    const company = await CompanyService.getCompanyById(id);

    if (company.user.id !== userId) throw new UnauthorizedError("Company does not belong to user");

    const transactions = await TransactionService.getCompanyTransactions(id, { limit, offset });

    return res.send(transactions);
  } catch (error) {
    log.error("Could not get transactions from company", { id, error });
    next(error);
  }
});

router.post(
  "/:id/transactions",
  validateToken,
  getUserFromToken,
  TransactionValidator.createTransaction,
  async (req, res, next) => {
    const {
      userId: buyerId,
      params: { id: sellerId },
      body: { serviceId, value },
    } = req;

    try {
      const company = await CompanyService.getCompanyById(sellerId);
      const service = await ServiceService.getById(serviceId);
      if (service.company.id !== company.id) throw new BadRequestError("Service does not belong to Company");

      const user = await UserService.getById(userId);

      const payload = {
        buyer: user,
        seller: company,
        service,
        value,
      };

      const transaction = await TransactionService.createTransaction(payload);

      return res.status(201).send(transaction);
    } catch (error) {
      log.error("Could not create transaction", { buyerId, sellerId, serviceId });
      next(error);
    }
  },
);

router.get("/:id/payment-methods", async (req, res, next) => {
  const { id } = req.params;

  try {
    await CompanyService.getCompanyById(id);
    const paymentMethods = await PaymentMethodService.getByCompanyId(id);

    return res.send(paymentMethods);
  } catch (error) {
    log.error("Could not get payment methods", { id, error });
    next(error);
  }
});

router.post("/:id/payment-methods", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    userId,
    params: { id: companyId },
    body,
  } = req;

  try {
    const company = await CompanyService.getCompanyById(companyId);
    if (company.user.id !== userId) throw new UnauthorizedError("Company does not belong to user");

    const paymentMethods = await PaymentMethodService.addPaymentMethods(company, body);

    return res.status(201).send(paymentMethods);
  } catch (error) {
    log.error("Could not add payment methods", { companyId, userId, error });
    next(error);
  }
});

router.delete(
  "/:companyId/payment-methods/:paymentMethodId",
  validateToken,
  getUserFromToken,
  async (req, res, next) => {
    const {
      userId,
      params: { companyId, paymentMethodId },
    } = req;

    try {
      const company = await CompanyService.getCompanyById(companyId);
      if (company.user.id !== userId) throw new UnauthorizedError("Company does not belong to user");

      await PaymentMethodService.deletePaymentMethod(paymentMethodId);

      res.status(204).send({});
    } catch (error) {
      log.error("Could not delete payment methods", { userId, companyId, error });
      next(error);
    }
  },
);

module.exports = router;
