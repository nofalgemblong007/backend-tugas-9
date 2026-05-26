const { pool } = require('../config/database');
const { Product, Rental } = require('../models');
const { AppError } = require('../utils/errorHandler');

const rentalService = {
  // Get all rentals (admin/pemilik)
  getAllRentals: async () => {
    return await Rental.findAll();
  },

  // Get rental by ID
  getRentalById: async (id) => {
    const rental = await Rental.findById(id);
    if (!rental) {
      throw new AppError('Peminjaman tidak ditemukan.', 404);
    }
    return rental;
  },

  // Get rental history by user
  getRentalHistory: async (userId) => {
    return await Rental.findByUser(userId);
  },

  // Create rental (sewa produk)
  createRental: async (rentalData, userId) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { product_id, rental_date, return_date } = rentalData;

      // Cek produk ada
      const product = await Product.findById(product_id);
      if (!product) {
        throw new AppError('Produk tidak ditemukan.', 404);
      }

      // Cek stok tersedia
      if (product.stock < 1) {
        throw new AppError('Stok produk tidak tersedia.', 400);
      }

      // Cek produk tidak dalam peminjaman aktif
      if (product.status === 'rented') {
        throw new AppError('Produk sedang disewa.', 400);
      }

      // Hitung total harga
      const startDate = new Date(rental_date);
      const endDate = new Date(return_date);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const total_price = product.price_per_day * days;

      // Buat rental
      const rentalId = await Rental.create({
        product_id,
        user_id: userId,
        rental_date,
        return_date,
        total_price,
      }, connection);

      // Kurangi stok dan update status produk
      await Product.updateStock(product_id, -1);
      await Product.updateStatus(product_id, 'rented');

      await connection.commit();

      return await Rental.findById(rentalId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Return rental (kembalikan produk)
  returnRental: async (rentalId, userId) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const rental = await Rental.findById(rentalId);

      if (!rental) {
        throw new AppError('Peminjaman tidak ditemukan.', 404);
      }

      // Cek ownership rental
      if (rental.user_id !== userId) {
        throw new AppError('Anda tidak memiliki izin untuk mengembalikan rental ini.', 403);
      }

      if (rental.status !== 'active' && rental.status !== 'pending') {
        throw new AppError('Rental sudah dikembalikan.', 400);
      }

      // Update rental status
      const returnDate = new Date().toISOString().split('T')[0];
      await Rental.update(rentalId, {
        return_date: returnDate,
        status: 'returned',
      });

      // Tambah stok dan update status produk
      await Product.updateStock(rental.product_id, 1);
      await Product.updateStatus(rental.product_id, 'available');

      await connection.commit();

      return await Rental.findById(rentalId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Approve rental (pemilik approve)
  approveRental: async (rentalId, ownerId) => {
    const rental = await Rental.findById(rentalId);

    if (!rental) {
      throw new AppError('Peminjaman tidak ditemukan.', 404);
    }

    // Cek ownership produk
    const product = await Product.findById(rental.product_id);
    if (product.owner_id !== ownerId) {
      throw new AppError('Anda tidak memiliki izin untuk menyetujui rental ini.', 403);
    }

    // Update status rental
    await Rental.updateStatus(rentalId, 'active');

    return await Rental.findById(rentalId);
  },

  // Cancel rental
  cancelRental: async (rentalId, userId) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const rental = await Rental.findById(rentalId);

      if (!rental) {
        throw new AppError('Peminjaman tidak ditemukan.', 404);
      }

      // Cek ownership
      if (rental.user_id !== userId) {
        throw new AppError('Anda tidak memiliki izin untuk membatalkan rental ini.', 403);
      }

      if (rental.status === 'returned') {
        throw new AppError('Rental sudah dikembalikan tidak bisa dibatalkan.', 400);
      }

      // Update status rental
      await Rental.updateStatus(rentalId, 'cancelled');

      // Kembalikan stok produk
      await Product.updateStock(rental.product_id, 1);
      await Product.updateStatus(rental.product_id, 'available');

      await connection.commit();

      return await Rental.findById(rentalId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = rentalService;