const { Router } = require("express");
const { ServiceService, CategoryService } = require("../services");

const router = Router();

router.get("/", async (req, res) => {
  const { limit, offset } = req.query;
  const categories = await CategoryService.find({ limit, offset });

  return res.send(categories);
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
