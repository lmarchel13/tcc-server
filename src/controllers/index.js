const { Router } = require("express");
const UserController = require("./user");
const CompanyController = require("./company");

const router = Router();

router.use("/users", UserController);
router.use("/companies", CompanyController);

module.exports = router;
