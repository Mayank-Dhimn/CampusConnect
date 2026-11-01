const db = require('../config/db');

const ENQUIRY_SELECT = `
  SELECT e.enquiry_id, e.product_id, e.buyer_id, e.seller_id, e.message, e.status, e.created_at,
         p.title AS product_title, p.price AS product_price,
         b.name AS buyer_name, b.email AS buyer_email,
         s.name AS seller_name, s.email AS seller_email
  FROM enquiries e
  JOIN products p ON p.product_id = e.product_id
  JOIN users b ON b.user_id = e.buyer_id
  JOIN users s ON s.user_id = e.seller_id
`;

exports.sendEnquiry = async (req, res) => {
  try {
    const { product_id, message } = req.body;
    if (!product_id || !message || !message.trim()) {
      return res.status(400).json({ message: 'Product and message are required' });
    }

    const [rows] = await db.query('SELECT seller_id, status FROM products WHERE product_id = ?', [product_id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    const product = rows[0];
    if (product.status !== 'Available') {
      return res.status(400).json({ message: 'This product is not available' });
    }
    if (product.seller_id === req.user.id) {
      return res.status(400).json({ message: 'You cannot enquire about your own product' });
    }

    await db.query(
      'INSERT INTO enquiries (product_id, buyer_id, seller_id, message) VALUES (?, ?, ?, ?)',
      [product_id, req.user.id, product.seller_id, message.trim()]
    );
    res.status(201).json({ message: 'Enquiry sent to the seller' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSent = async (req, res) => {
  try {
    const [rows] = await db.query(`${ENQUIRY_SELECT} WHERE e.buyer_id = ? ORDER BY e.created_at DESC`, [req.user.id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReceived = async (req, res) => {
  try {
    const [rows] = await db.query(`${ENQUIRY_SELECT} WHERE e.seller_id = ? ORDER BY e.created_at DESC`, [req.user.id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'Responded', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const [rows] = await db.query('SELECT seller_id FROM enquiries WHERE enquiry_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Enquiry not found' });
    if (rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the seller can update this enquiry' });
    }
    await db.query('UPDATE enquiries SET status = ? WHERE enquiry_id = ?', [status, req.params.id]);
    res.status(200).json({ message: 'Enquiry updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
