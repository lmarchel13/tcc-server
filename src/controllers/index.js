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

const { startSeed } = require("../../seed");

const router = Router();

router.get("/seed", async (req, res) => {
  try {
    await startSeed();
    res.send({ ok: true });
  } catch (error) {
    res.send({ ok: false });
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
