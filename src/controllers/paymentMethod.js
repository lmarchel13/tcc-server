const { Router } = require("express");
const { PaymentMethodService } = require("../services");

const router = Router();

router.get("/", async (req, res) => {
  return res.send(PaymentMethodService.defaultPaymentMethods());
});

module.exports = router;
