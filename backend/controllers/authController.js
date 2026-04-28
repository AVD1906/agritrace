const pool = require('../config/db');

const {
  generateToken,
  hashPassword,
  comparePassword,
} = require('../utils/helpers');

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔥 FULL ROLE MAP (matches your DB exactly)
    const roleMap = {
      admin: 1,
      farmer: 2,
      processor: 3,
      distributor: 4,
      retailer: 5,
    };

    // 🔥 normalize role (important)
    const roleKey = role?.toLowerCase();

    const role_id = roleMap[roleKey];

    if (!role_id) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    // Check if email exists
    const [existing] = await pool.query(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO Users (name, email, password, role_id)
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role_id]
    );

    const userId = result.insertId;

    // Generate token
    const token = generateToken({
      user_id: userId,
      email,
      role_id,
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        user_id: userId,
        name,
        email,
        role_id,
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const user = rows[0];

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

// ================= GET CURRENT USER =================
const getMe = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT user_id, name, email, role_id 
       FROM Users WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};