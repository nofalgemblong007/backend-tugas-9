const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../utils/errorHandler');

const authService = {
  // Register user baru
  register: async (userData) => {
    const { name, email, password, role } = userData;

    // Cek apakah email sudah ada
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email sudah terdaftar.', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user baru
    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'penyewa',
    });

    // Generate token
    const token = jwt.sign(
      { id: userId, email, role: role || 'penyewa' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: userId,
        name,
        email,
        role: role || 'penyewa',
      },
    };
  },

  // Login user
  login: async (credentials) => {
    const { email, password } = credentials;

    // Cek user ada
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Email atau password salah.', 401);
    }

    // Cek password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Email atau password salah.', 401);
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  // Get current user
  getCurrentUser: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User tidak ditemukan.', 404);
    }
    return user;
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    return await User.findAll();
  },
};

module.exports = authService;