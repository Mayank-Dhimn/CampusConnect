const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const removeFile = (filename) => {
  if (!filename) return;
  const full = path.join(__dirname, '..', 'uploads', filename);
  fs.unlink(full, () => {});
};

const BASE_SELECT = `
  SELECT p.product_id, p.seller_id, p.category_id, p.title, p.description, p.price,
         p.product_condition, p.image, p.status, p.created_at,
         c.category_name, u.name AS seller_name, u.department AS seller_department,
         u.semester AS seller_semester
  FROM products p
  JOIN categories c ON c.category_id = p.category_id
  JOIN users u ON u.user_id = p.seller_id
`;

// GET /api/products?search=&category=&minPrice=&maxPrice=&condition=
exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, condition } = req.query;
    const where = ["p.status = 'Available'"];
    const params = [];

    if (search) {
      where.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push('p.category_id = ?');
      params.push(parseInt(category, 10));
    }
    if (minPrice !== undefined && minPrice !== '') {
      where.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      where.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }
    if (condition && CONDITIONS.includes(condition)) {
      where.push('p.product_condition = ?');
      params.push(condition);
    }

    const [rows] = await db.query(
      `${BASE_SELECT} WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC`,
      params
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// GET /api/products/my-listings
exports.getMyListings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `${BASE_SELECT} WHERE p.seller_id = ? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query(`${BASE_SELECT} WHERE p.product_id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });

    const product = rows[0];
    const isOwner = req.user && req.user.id === product.seller_id;
    const isAdmin = req.user && req.user.role === 'admin';
    if (product.status !== 'Available' && product.status !== 'Sold' && !isOwner && !isAdmin) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/products  (multipart/form-data, field "image")
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category_id, product_condition } = req.body;

    if (!title || !price || !category_id) {
      removeFile(req.file && req.file.filename);
      return res.status(400).json({ message: 'Title, price and category are required' });
    }
    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      removeFile(req.file && req.file.filename);
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }
    const cond = CONDITIONS.includes(product_condition) ? product_condition : 'Good';

    const [cat] = await db.query('SELECT category_id FROM categories WHERE category_id = ?', [category_id]);
    if (!cat.length) {
      removeFile(req.file && req.file.filename);
      return res.status(400).json({ message: 'Invalid category' });
    }

    const [result] = await db.query(
      `INSERT INTO products (seller_id, category_id, title, description, price, product_condition, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, category_id, title.trim(), description || null, priceNum, cond, req.file ? req.file.filename : null]
    );
    res.status(201).json({
      message: 'Product submitted. It will be visible after admin approval.',
      product_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    removeFile(req.file && req.file.filename);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE product_id = ?', [req.params.id]);
    if (!rows.length) {
      removeFile(req.file && req.file.filename);
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = rows[0];
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      removeFile(req.file && req.file.filename);
      return res.status(403).json({ message: 'You can only edit your own products' });
    }

    const { title, description, price, category_id, product_condition, status } = req.body;
    const newTitle = title ? title.trim() : product.title;
    const newDesc = description !== undefined ? description : product.description;
    const newPrice = price !== undefined && price !== '' ? parseFloat(price) : product.price;
    const newCat = category_id || product.category_id;
    const newCond = CONDITIONS.includes(product_condition) ? product_condition : product.product_condition;

    if (Number.isNaN(newPrice) || newPrice < 0) {
      removeFile(req.file && req.file.filename);
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }

    // Sellers may only toggle Available <-> Sold on approved listings.
    let newStatus = product.status;
    if (status === 'Sold' && product.status === 'Available') newStatus = 'Sold';
    if (status === 'Available' && product.status === 'Sold') newStatus = 'Available';

    let image = product.image;
    if (req.file) {
      removeFile(product.image);
      image = req.file.filename;
    }

    await db.query(
      `UPDATE products SET title = ?, description = ?, price = ?, category_id = ?,
       product_condition = ?, image = ?, status = ? WHERE product_id = ?`,
      [newTitle, newDesc, newPrice, newCat, newCond, image, newStatus, req.params.id]
    );
    res.status(200).json({ message: 'Product updated' });
  } catch (err) {
    console.error(err);
    removeFile(req.file && req.file.filename);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE product_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    const product = rows[0];
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }
    await db.query('DELETE FROM products WHERE product_id = ?', [req.params.id]);
    removeFile(product.image);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// POST /api/products/:id/report
exports.reportProduct = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) return res.status(400).json({ message: 'Reason is required' });
    const [rows] = await db.query('SELECT product_id FROM products WHERE product_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    await db.query('INSERT INTO reports (reporter_id, product_id, reason) VALUES (?, ?, ?)', [
      req.user.id,
      req.params.id,
      reason.trim(),
    ]);
    res.status(201).json({ message: 'Report submitted. Thank you.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
