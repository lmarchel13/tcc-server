const { Router } = require("express");
const { PlanService } = require("../services");

const router = Router();

router.get("/", async (req, res) => {
  const plans = await PlanService.find();
  return res.send(plans);
});

router.post("/", async (req, res, next) => {
  try {
    const plan = await PlanService.createPlan(req.body);
    return res.status(201).send(plan);
  } catch (error) {
    log.error("Could not create plan", { error });
    next(error);
  }
});

module.exports = router;
