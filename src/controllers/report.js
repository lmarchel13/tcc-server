const { Router } = require("express");
const { CompanyService, ReportService } = require("../services");
const { logger } = require("../utils");
const { validateToken, getUserFromToken } = require("../middlewares");

const router = Router();
const log = logger("Report Controller");

router.get("/", validateToken, getUserFromToken, async (req, res, next) => {
  const {
    query: { name },
    userId,
  } = req;

  log.info("Loading report", { name });

  try {
    const companies = await CompanyService.getUserCompanies(userId);
    const payload = { name, userId, companies };

    const data = await ReportService.getReport(payload);

    return res.send(data);
  } catch (error) {
    log.error("Could not load report", { error, name });
    next(error);
  }
});

module.exports = router;
