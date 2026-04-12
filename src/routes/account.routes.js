const express = require('express');
const {
  getBalance,
  getMe,
  transfer,
  getTransactions
} = require('../controllers/account.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/balance', authMiddleware, getBalance);
router.get('/me', authMiddleware, getMe);
router.post('/transfer', authMiddleware, transfer);
router.get('/transactions', authMiddleware, getTransactions);

module.exports = router;
