const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      ok: true,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      ok: true,
      user,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const transfer = async (req, res) => {
  try {
    const { toEmail, amount } = req.body;
    const fromUserId = req.user.id;

    if (!toEmail || !amount) {
      return res.status(400).json({
        ok: false,
        message: 'Email destino y monto son obligatorios'
      });
    }

    const numericAmount = Number(amount);

    if (numericAmount <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'El monto debe ser mayor a 0'
      });
    }

    const fromUser = await User.findById(fromUserId);

    if (!fromUser) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario origen no encontrado'
      });
    }

    if (fromUser.email === toEmail) {
      return res.status(400).json({
        ok: false,
        message: 'No podés transferirte a vos mismo'
      });
    }

    const toUser = await User.findOne({ email: toEmail });

    if (!toUser) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario destino no existe'
      });
    }

    if (fromUser.balance < numericAmount) {
      return res.status(400).json({
        ok: false,
        message: 'Saldo insuficiente'
      });
    }

    fromUser.balance -= numericAmount;
    toUser.balance += numericAmount;

    await fromUser.save();
    await toUser.save();

    await Transaction.create({
      fromUser: fromUser._id,
      toUser: toUser._id,
      amount: numericAmount,
      type: 'transfer'
    });

    res.status(200).json({
      ok: true,
      message: 'Transferencia realizada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { fromUser: req.user.id },
        { toUser: req.user.id }
      ]
    })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      ok: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getBalance,
  getMe,
  transfer,
  getTransactions
};
