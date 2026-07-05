const pool = require('../config/db');

// ================= CREATE PRODUCT =================
const createProduct = async (req, res) => {
  try {
    const { name, category } = req.body;

    const farmer_id = req.user?.user_id; 

    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    if (!name || !category) {
      return res.status(400).json({
        message: 'name and category are required',
      });
    }

    if (!farmer_id) {
      return res.status(401).json({
        message: 'User not authenticated',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO Products (product_name, category, farmer_id) VALUES (?, ?, ?)',
      [name, category, farmer_id]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product_id: result.insertId,
    });

  } catch (error) {
    console.error('createProduct error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET ALL PRODUCTS =================
const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS farmer_name 
       FROM Products p 
       JOIN Users u ON p.farmer_id = u.user_id`
    );

    res.json(rows);
  } catch (error) {
    console.error('getAllProducts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET PRODUCT BY ID =================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT p.*, u.name AS farmer_name 
       FROM Products p 
       JOIN Users u ON p.farmer_id = u.user_id 
       WHERE p.product_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
