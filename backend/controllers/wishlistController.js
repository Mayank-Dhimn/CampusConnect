const db = require('../config/db');

exports.getWishlist = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.product_id, p.title, p.price, p.product_condition, p.image, p.status,
              c.category_name, u.name AS seller_name, w.created_at AS saved_at
       FROM wishlists w
       JOIN products p ON p.product_id = w.product_id
       JOIN categories c ON c.category_id = p.category_id
       JOIN users u ON u.user_id = p.seller_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });

    const [p] = await db.query('SELECT product_id FROM products WHERE product_id = ?', [product_id]);
    if (!p.length) return res.status(404).json({ message: 'Product not found' });

    await db.query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Already in wishlist' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [
      req.user.id,
      req.params.productId,
    ]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Not in wishlist' });
    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
