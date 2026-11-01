const db = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY category_name');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const [exists] = await db.query('SELECT category_id FROM categories WHERE category_name = ?', [category_name.trim()]);
    if (exists.length) return res.status(400).json({ message: 'Category already exists' });
    const [result] = await db.query('INSERT INTO categories (category_name) VALUES (?)', [category_name.trim()]);
    res.status(201).json({ category_id: result.insertId, category_name: category_name.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const [result] = await db.query('UPDATE categories SET category_name = ? WHERE category_id = ?', [
      category_name.trim(),
      req.params.id,
    ]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Category already exists' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const [used] = await db.query('SELECT COUNT(*) AS n FROM products WHERE category_id = ?', [req.params.id]);
    if (used[0].n > 0) {
      return res.status(400).json({ message: 'Cannot delete a category that has products' });
    }
    const [result] = await db.query('DELETE FROM categories WHERE category_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
