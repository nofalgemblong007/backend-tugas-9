const { pool } = require('../config/database');

// User Model
const User = {
  // Find user by email
  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // Create new user
  create: async (userData) => {
    const { name, email, password, role } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'penyewa']
    );
    return result.insertId;
  },

  // Get all users
  findAll: async () => {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at, updated_at FROM users');
    return rows;
  },
};

// Product Model
const Product = {
  // Find all products
  findAll: async () => {
    const [rows] = await pool.query(`
      SELECT p.*, u.name as owner_name 
      FROM products p 
      JOIN users u ON p.owner_id = u.id
    `);
    return rows;
  },

  // Find product by ID
  findById: async (id) => {
    const [rows] = await pool.query(`
      SELECT p.*, u.name as owner_name 
      FROM products p 
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  },

  // Find products by owner
  findByOwner: async (ownerId) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE owner_id = ?', [ownerId]);
    return rows;
  },

  // Create product
  create: async (productData) => {
    const { name, description, category, price_per_day, stock, owner_id } = productData;
    const [result] = await pool.query(
      'INSERT INTO products (name, description, category, price_per_day, stock, owner_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, category, price_per_day, stock || 1, owner_id]
    );
    return result.insertId;
  },

  // Update product
  update: async (id, productData) => {
    const { name, description, category, price_per_day, stock, status } = productData;
    await pool.query(
      'UPDATE products SET name = ?, description = ?, category = ?, price_per_day = ?, stock = ?, status = ? WHERE id = ?',
      [name, description, category, price_per_day, stock, status, id]
    );
    return id;
  },

  // Delete product
  delete: async (id) => {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return id;
  },

  // Update stock
  updateStock: async (id, quantity) => {
    await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, id]);
  },

  // Update status
  updateStatus: async (id, status) => {
    await pool.query('UPDATE products SET status = ? WHERE id = ?', [status, id]);
  },
};

// Rental Model
const Rental = {
  // Find all rentals
  findAll: async () => {
    const [rows] = await pool.query(`
      SELECT r.*, p.name as product_name, u.name as user_name 
      FROM rentals r 
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    return rows;
  },

  // Find rental by ID
  findById: async (id) => {
    const [rows] = await pool.query(`
      SELECT r.*, p.name as product_name, u.name as user_name 
      FROM rentals r 
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);
    return rows[0];
  },

  // Find rentals by user
  findByUser: async (userId) => {
    const [rows] = await pool.query(`
      SELECT r.*, p.name as product_name 
      FROM rentals r 
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);
    return rows;
  },

  // Create rental with transaction
  create: async (rentalData, connection) => {
    const { product_id, user_id, rental_date, return_date, total_price } = rentalData;
    const [result] = await connection.query(
      'INSERT INTO rentals (product_id, user_id, rental_date, return_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, user_id, rental_date, return_date, total_price, 'pending']
    );
    return result.insertId;
  },

  // Update rental status
  updateStatus: async (id, status) => {
    await pool.query('UPDATE rentals SET status = ? WHERE id = ?', [status, id]);
  },

  // Update rental (return)
  update: async (id, rentalData) => {
    const { return_date, status } = rentalData;
    await pool.query(
      'UPDATE rentals SET return_date = ?, status = ? WHERE id = ?',
      [return_date, status, id]
    );
    return id;
  },
};

module.exports = {
  User,
  Product,
  Rental,
};