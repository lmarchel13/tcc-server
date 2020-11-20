const { Router } = require("express");
const { TransactionService } = require("../services");
const { validateToken, getUserFromToken } = require("../middlewares");
const { logger } = require("../utils");

const router = Router();

const log = logger("Transaction Controller");

router.get("/buyer", validateToken, getUserFromToken, async (req, res) => {
  const {
    userId,
    query: { limit = 20, offset = 0 },
  } = req;

  const transactions = await TransactionService.getBuyerTransactions(userId, { limit, offset });
  return res.send(transactions);
});

router.get("/seller", validateToken, getUserFromToken, async (req, res) => {
  const {
    userId,
    query: { limit = 20, offset = 0 },
  } = req;

  const transactions = await TransactionService.getSellerTransactions(userId, { limit, offset });
  return res.send(transactions);
});

router.delete("/:id", validateToken, getUserFromToken, async (req, res) => {
  const {
    userId,
    params: { id },
  } = req;

  try {
    await TransactionService.deleteTransaction({ id, userId });
  } catch (error) {
    log.error("Could not delete transaction", { id, error });
    next(error);
  }
});

module.exports = router;
