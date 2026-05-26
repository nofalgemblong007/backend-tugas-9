const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Penyewa routes
router.get('/history', rentalController.getMyRentals);
router.post('/', rentalController.createRental);
router.post('/:id/return', rentalController.returnRental);
router.post('/:id/cancel', rentalController.cancelRental);

// Pemilik routes
router.get('/', roleMiddleware('pemilik'), rentalController.getAllRentals);
router.get('/:id', rentalController.getRentalById);
router.post('/:id/approve', roleMiddleware('pemilik'), rentalController.approveRental);

module.exports = router;