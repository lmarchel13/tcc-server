const { Router } = require("express");
const { ServiceService } = require("../services");
const { logger } = require("../utils");

const router = Router();
const log = logger("Offer Controller");

router.get("/search", async (req, res, next) => {
  const { q, limit = 20, offset = 0 } = req.query;

  try {
    const services = await ServiceService.search(q, { limit, offset });

    return res.send(services);
  } catch (error) {
    log.error("Could not search for services", { q, error });
    next(error);
  }
});

router.get("/", async (req, res) => {
  const { limit } = req.query;
  const services = await ServiceService.getLastOffers(limit);

  res.send(services);
});

module.exports = router;
