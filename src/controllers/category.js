const { Router } = require("express");
const { ServiceService, CategoryService } = require("../services");
const { logger } = require("../utils");

const router = Router();

const log = logger("Category Controller");

router.get("/", async (req, res) => {
  const { limit, offset } = req.query;
  log.info("Get categories", { limit, offset });

  try {
    const categories = await CategoryService.find({ limit, offset });

    const lastService = categories.find((category) => category.name === "Outros");
    const other = categories.filter((category) => category.name !== "Outros");

    if (lastService) {
      return res.send([...other, lastService]);
    }

    return res.send(other);
  } catch (error) {
    log.error("Could not get categories", { error });
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    return res.status(201).send(category);
  } catch (error) {
    log.error("Could not create category", { error });
    next(error);
  }
});

router.get("/:id/services", async (req, res, next) => {
  const { id } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  try {
    await CategoryService.getById(id);
    const services = await ServiceService.getByCategoryId(id, { limit, offset });

    return res.send(services);
  } catch (error) {
    log.error("Could not get services by category", { id, error });
    next(error);
  }
});

module.exports = router;
