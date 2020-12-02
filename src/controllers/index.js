const { Router } = require("express");

const UserController = require("./user");
const CompanyController = require("./company");
const ServiceController = require("./service");
const CategoryController = require("./category");
const OfferController = require("./offer");
const PlanController = require("./plan");
const TransactionController = require("./transaction");
const MessageController = require("./message");

const router = Router();

router.use("/users", UserController);
router.use("/companies", CompanyController);
router.use("/services", ServiceController);
router.use("/categories", CategoryController);
router.use("/offers", OfferController);
router.use("/plans", PlanController);
router.use("/transactions", TransactionController);
router.use("/messages", MessageController);

module.exports = router;
