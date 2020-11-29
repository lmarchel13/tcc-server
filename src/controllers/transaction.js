const { Router } = require("express");
const { TransactionService } = require("../services");
const { validateToken, getUserFromToken } = require("../middlewares");
const { logger } = require("../utils");

const router = Router();

const log = logger("Transaction Controller");

router.get("/buyer", validateToken, getUserFromToken, async (req, res, next) => {
  try {
    const {
      userId,
      query: { limit = 20, offset = 0 },
    } = req;
    log.info("Loading buyer transactions", { userId });

    const transactions = await TransactionService.getBuyerTransactions(userId, { limit, offset });
    return res.send(transactions);
  } catch (error) {
    log.error("Could not load buyer transactions", { error });
    next(error);
  }
});

router.get("/seller", validateToken, getUserFromToken, async (req, res, next) => {
  try {
    const {
      userId,
      query: { limit = 20, offset = 0 },
    } = req;

    const transactions = await TransactionService.getSellerTransactions(userId, { limit, offset });
    return res.send(transactions);
  } catch (error) {
    log.error("Could not load seller transactions", { error });
    next(error);
  }
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

router.get("/", async (req, res) => {
  const { serviceId, day } = req.query;

  try {
    const transactions = await TransactionService.getTransactions({ serviceId, day });

    return res.send(transactions);
  } catch (error) {
    log.error("Could not load transactions", { ...req.query, error });
    next(error);
  }
});

module.exports = router;
