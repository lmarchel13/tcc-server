const { Router } = require("express");
const { validateToken, getUserFromToken } = require("../middlewares");
const { CompanyValidator, ServiceValidator } = require("./validators");
const { CompanyService, ServiceService, CategoryService, UserService } = require("../services");
const { logger } = require("../utils");
const { BadRequestError } = require("../utils/errors");

const router = Router();
const log = logger("Company Controller");

router.post("/", validateToken, getUserFromToken, CompanyValidator.createCompany, async (req, res, next) => {
  const payload = {
    ...req.body,
    userId: req.userId,
  };

  try {
    const user = await UserService.getById(req.userId);
    payload.user = user;

    const company = await CompanyService.createCompany(payload);
    return res.status(201).send(company);
  } catch (error) {
    log.error("Could not create company", { error });
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  const { limit = 20, offset = 0 } = req.query;
  const companies = await CompanyService.find({ limit, offset });

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

    if (company.userId !== userId) {
      log.error("Company does not belong to the user", { companyId: id, userId });
      throw new UnauthorizedError("Company does not belong to the user");
    }

    await CompanyService.updateCompany(id, userId, req.body);

    return res.send(company);
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

    if (company.userId !== userId) {
      log.error("Company does not belong to the user", { companyId: id, userId });
      throw new UnauthorizedError("Company does not belong to the user");
    }

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

    try {
      const company = await CompanyService.getCompanyById(id);
      const category = await CategoryService.getById(req.body.categoryId);

      const payload = { ...req.body, company, category };
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

module.exports = router;
