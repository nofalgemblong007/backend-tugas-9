const productService = require('../services/productService');

const productController = {
  // Get all products
  getAllProducts: async (req, res, next) => {
    try {
      const products = await productService.getAllProducts();

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get product by ID
  getProductById: async (req, res, next) => {
    try {
      const product = await productService.getProductById(req.params.id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get products by owner
  getMyProducts: async (req, res, next) => {
    try {
      const products = await productService.getProductsByOwner(req.user.id);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create product
  createProduct: async (req, res, next) => {
    try {
      const product = await productService.createProduct(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Produk berhasil ditambahkan.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update product
  updateProduct: async (req, res, next) => {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Produk berhasil diperbarui.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete product
  deleteProduct: async (req, res, next) => {
    try {
      await productService.deleteProduct(req.params.id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Produk berhasil dihapus.',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = productController;