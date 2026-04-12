const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        ok: false,
        message: 'El usuario ya existe'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        balance: newUser.balance
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Email y password son obligatorios'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: 'Credenciales inválidas'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        ok: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      ok: true,
      message: 'Login exitoso',
      token
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      ok: true,
      user
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
  register,
  login,
  profile
};
