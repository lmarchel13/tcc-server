const { Router } = require("express");

const UserController = require("./user");
const CompanyController = require("./company");
const ServiceController = require("./service");
const CategoryController = require("./category");
const OfferController = require("./offer");
const PlanController = require("./plan");
const TransactionController = require("./transaction");
const ConversationController = require("./conversation");
const ReportController = require("./report");

const { run } = require("../../seed");

const router = Router();

router.get("/", (req, res) => {
  res.send({ ok: true, timestamp: new Date() });
});

router.get("/seed", async (req, res) => {
  try {
    await run(req.query.size);
    return res.send({ ok: true });
  } catch (error) {
    console.error("Error while running seed:", error);
    return res.send({ error: error.message });
  }
});

router.use("/users", UserController);
router.use("/companies", CompanyController);
router.use("/services", ServiceController);
router.use("/categories", CategoryController);
router.use("/offers", OfferController);
router.use("/plans", PlanController);
router.use("/transactions", TransactionController);
router.use("/conversations", ConversationController);
router.use("/reports", ReportController);

module.exports = router;
