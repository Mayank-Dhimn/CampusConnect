const db = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const [[users]] = await db.query("SELECT COUNT(*) AS n FROM users WHERE role = 'student'");
    const [[products]] = await db.query('SELECT COUNT(*) AS n FROM products');
    const [[pending]] = await db.query("SELECT COUNT(*) AS n FROM products WHERE status = 'Pending'");
    const [[available]] = await db.query("SELECT COUNT(*) AS n FROM products WHERE status = 'Available'");
    const [[sold]] = await db.query("SELECT COUNT(*) AS n FROM products WHERE status = 'Sold'");
    const [[enquiries]] = await db.query('SELECT COUNT(*) AS n FROM enquiries');
    const [[reports]] = await db.query("SELECT COUNT(*) AS n FROM reports WHERE status = 'Pending'");
    const [byCategory] = await db.query(
      `SELECT c.category_name, COUNT(p.product_id) AS total
       FROM categories c LEFT JOIN products p ON p.category_id = c.category_id
       GROUP BY c.category_id ORDER BY total DESC`
    );

    res.status(200).json({
      totalUsers: users.n,
      totalProducts: products.n,
      pendingProducts: pending.n,
      availableProducts: available.n,
      soldProducts: sold.n,
      totalEnquiries: enquiries.n,
      pendingReports: reports.n,
      byCategory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, name, email, department, semester, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id, 10) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const [result] = await db.query("DELETE FROM users WHERE user_id = ? AND role = 'student'", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// All products, any status (for review)
exports.getAllProducts = async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status) {
      where = 'WHERE p.status = ?';
      params.push(status);
    }
    const [rows] = await db.query(
      `SELECT p.product_id, p.title, p.price, p.product_condition, p.image, p.status, p.created_at,
              c.category_name, u.name AS seller_name, u.email AS seller_email
       FROM products p
       JOIN categories c ON c.category_id = p.category_id
       JOIN users u ON u.user_id = p.seller_id
       ${where}
       ORDER BY FIELD(p.status,'Pending','Available','Sold','Rejected'), p.created_at DESC`,
      params
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Available', 'Rejected', 'Pending', 'Sold'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const [result] = await db.query('UPDATE products SET status = ? WHERE product_id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: `Product marked as ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.report_id, r.product_id, r.reason, r.status, r.created_at,
              p.title AS product_title, u.name AS reporter_name
       FROM reports r
       JOIN products p ON p.product_id = r.product_id
       JOIN users u ON u.user_id = r.reporter_id
       ORDER BY r.created_at DESC`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Reviewed', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const [result] = await db.query('UPDATE reports SET status = ? WHERE report_id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Report not found' });
    res.status(200).json({ message: 'Report updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
