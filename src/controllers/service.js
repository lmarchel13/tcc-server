const { Router } = require("express");
const { validateToken, getUserFromToken } = require("../middlewares");
const { CompanyService, ServiceService } = require("../services");
const {
  logger,
  errors: { UnauthorizedError },
} = require("../utils");

const router = Router();
const log = logger("Service Controller");

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

    if (req.userId !== company.userId) throw new UnauthorizedError("Service does not belong to company");

    await ServiceService.deleteService(id);

    return res.status(204).send();
  } catch (error) {
    log.error("Could not delete service", { id, error });
    next(error);
  }
});

module.exports = router;
