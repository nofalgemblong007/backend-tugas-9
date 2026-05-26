const { Product } = require('../models');
const { AppError } = require('../utils/errorHandler');

const productService = {
  // Get all products
  getAllProducts: async () => {
    return await Product.findAll();
  },

  // Get product by ID
  getProductById: async (id) => {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Produk tidak ditemukan.', 404);
    }
    return product;
  },

  // Get products by owner
  getProductsByOwner: async (ownerId) => {
    return await Product.findByOwner(ownerId);
  },

  // Create product (pemilik only)
  createProduct: async (productData, ownerId) => {
    const { name, description, category, price_per_day, stock } = productData;

    // Validasi input
    if (!name || !price_per_day) {
      throw new AppError('Nama dan harga per hari wajib diisi.', 400);
    }

    const productId = await Product.create({
      name,
      description,
      category,
      price_per_day,
      stock: stock || 1,
      owner_id: ownerId,
    });

    return await Product.findById(productId);
  },

  // Update product
  updateProduct: async (id, productData, userId) => {
    const product = await Product.findById(id);

    if (!product) {
      throw new AppError('Produk tidak ditemukan.', 404);
    }

    // Cek ownership (hanya pemilik yang bisa update)
    if (product.owner_id !== userId) {
      throw new AppError('Anda tidak memiliki izin untuk mengubah produk ini.', 403);
    }

    const { name, description, category, price_per_day, stock, status } = productData;

    await Product.update(id, {
      name: name || product.name,
      description: description || product.description,
      category: category || product.category,
      price_per_day: price_per_day || product.price_per_day,
      stock: stock || product.stock,
      status: status || product.status,
    });

    return await Product.findById(id);
  },

  // Delete product
  deleteProduct: async (id, userId) => {
    const product = await Product.findById(id);

    if (!product) {
      throw new AppError('Produk tidak ditemukan.', 404);
    }

    // Cek ownership
    if (product.owner_id !== userId) {
      throw new AppError('Anda tidak memiliki izin untuk menghapus produk ini.', 403);
    }

    await Product.delete(id);
    return { message: 'Produk berhasil dihapus.' };
  },
};

module.exports = productService;