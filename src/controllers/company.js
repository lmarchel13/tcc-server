const { Router } = require("express");
const { validateToken, getUserFromToken } = require("../middlewares");
const { Company } = require("../models");
const { NotFoundError } = require("../utils/errors");
const { CompanyValidator } = require("./validators");
const { CompanyService } = require("../services");

const router = Router();

router.post("/", validateToken, getUserFromToken, CompanyValidator.createCompany, async (req, res) => {
  const payload = {
    ...req.body,
    userId: req.userId,
  };

  try {
    const company = CompanyService.createCompany(payload);
    return res.status(201).send(company);
  } catch (error) {
    log.error("Could not create company", error);
    next(error);
  }
});

router.get("/", async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  const companies = await CompanyService.find({ limit, offset });

  return res.status(200).send(companies);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const company = await CompanyService.getCompanyById(id);
    return res.status(200).send(company);
  } catch (error) {
    log.error("Could not get company", { id });
    next(error);
  }
});

router.patch("/:id", validateToken, getUserFromToken, CompanyValidator.patchCompany, async (req, res) => {
  const { id } = req.params;

  try {
    const company = await CompanyService.getCompanyById(id);
    return res.status(200).send(company);
  } catch (error) {
    log.error("Could not get company", { id });
    next(error);
  }

  try {
    await CompanyService.updateCompany(id, req.body);
    return res.send(company);
  } catch (error) {
    log.error("Could not update company", { id, error });
    return next(new BadRequestError(error.message));
  }
});

module.exports = router;
