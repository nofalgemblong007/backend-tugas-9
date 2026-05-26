const authService = require('../services/authService');

const authController = {
  // Register
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Login
  login: async (req, res, next) => {
    try {
      const result = await authService.login(req.body);

      res.status(200).json({
        success: true,
        message: 'Login berhasil.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user
  getCurrentUser: async (req, res, next) => {
    try {
      const user = await authService.getCurrentUser(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all users
  getAllUsers: async (req, res, next) => {
    try {
      const users = await authService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;