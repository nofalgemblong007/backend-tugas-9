const rentalService = require('../services/rentalService');

const rentalController = {
  // Get all rentals
  getAllRentals: async (req, res, next) => {
    try {
      const rentals = await rentalService.getAllRentals();

      res.status(200).json({
        success: true,
        data: rentals,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get rental by ID
  getRentalById: async (req, res, next) => {
    try {
      const rental = await rentalService.getRentalById(req.params.id);

      res.status(200).json({
        success: true,
        data: rental,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get rental history (user)
  getMyRentals: async (req, res, next) => {
    try {
      const rentals = await rentalService.getRentalHistory(req.user.id);

      res.status(200).json({
        success: true,
        data: rentals,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create rental (sewa)
  createRental: async (req, res, next) => {
    try {
      const rental = await rentalService.createRental(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Peminjaman berhasil dibuat.',
        data: rental,
      });
    } catch (error) {
      next(error);
    }
  },

  // Return rental
  returnRental: async (req, res, next) => {
    try {
      const rental = await rentalService.returnRental(req.params.id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Produk berhasil dikembalikan.',
        data: rental,
      });
    } catch (error) {
      next(error);
    }
  },

  // Approve rental (pemilik)
  approveRental: async (req, res, next) => {
    try {
      const rental = await rentalService.approveRental(req.params.id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Peminjaman disetujui.',
        data: rental,
      });
    } catch (error) {
      next(error);
    }
  },

  // Cancel rental
  cancelRental: async (req, res, next) => {
    try {
      const rental = await rentalService.cancelRental(req.params.id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Peminjaman dibatalkan.',
        data: rental,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = rentalController;