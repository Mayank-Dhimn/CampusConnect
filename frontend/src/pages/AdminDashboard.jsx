import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Clock, CheckCircle, MessageSquare, Flag } from 'lucide-react';
import api, { errMsg } from '../services/api';

const TABS = ['Overview', 'Products', 'Users', 'Categories', 'Reports'];
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' });

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="col-6 col-lg-4">
      <div className="card stat-card shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div className={`rounded-circle p-3 bg-${color}-subtle text-${color}`}><Icon size={22} /></div>
          <div>
            <div className="fs-3 fw-bold lh-1">{value}</div>
            <small className="text-muted">{label}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [newCat, setNewCat] = useState('');
  const [error, setError] = useState('');

  const handle = (err) => setError(errMsg(err));

  const loadStats = () => api.get('/admin/dashboard').then((r) => setStats(r.data)).catch(handle);
  const loadProducts = () =>
    api.get('/admin/products', { params: statusFilter ? { status: statusFilter } : {} })
      .then((r) => setProducts(r.data)).catch(handle);
  const loadUsers = () => api.get('/admin/users').then((r) => setUsers(r.data)).catch(handle);
  const loadCategories = () => api.get('/categories').then((r) => setCategories(r.data)).catch(handle);
  const loadReports = () => api.get('/admin/reports').then((r) => setReports(r.data)).catch(handle);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === 'Products') loadProducts(); }, [tab, statusFilter]);
  useEffect(() => {
    if (tab === 'Users') loadUsers();
    if (tab === 'Categories') loadCategories();
    if (tab === 'Reports') loadReports();
  }, [tab]);

  const setProductStatus = async (id, status) => {
    try {
      await api.put(`/admin/products/${id}/status`, { status });
      loadProducts();
      loadStats();
    } catch (err) { handle(err); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Remove this listing permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
      loadStats();
    } catch (err) { handle(err); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this student and all their data?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadUsers();
      loadStats();
    } catch (err) { handle(err); }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { category_name: newCat });
      setNewCat('');
      loadCategories();
    } catch (err) { handle(err); }
  };

  const renameCategory = async (c) => {
    const name = window.prompt('New category name', c.category_name);
    if (!name || name === c.category_name) return;
    try {
      await api.put(`/categories/${c.category_id}`, { category_name: name });
      loadCategories();
    } catch (err) { handle(err); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (err) { handle(err); }
  };

  const setReportStatus = async (id, status) => {
    try {
      await api.put(`/admin/reports/${id}`, { status });
      loadReports();
      loadStats();
    } catch (err) { handle(err); }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Admin dashboard</h3>
      <ul className="nav nav-tabs mb-4">
        {TABS.map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => { setError(''); setTab(t); }}>{t}</button>
          </li>
        ))}
      </ul>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {tab === 'Overview' && stats && (
        <>
          <div className="row g-3 mb-4">
            <Stat icon={Users} label="Students" value={stats.totalUsers} color="primary" />
            <Stat icon={Package} label="Total products" value={stats.totalProducts} color="info" />
            <Stat icon={Clock} label="Pending approval" value={stats.pendingProducts} color="warning" />
            <Stat icon={CheckCircle} label="Available / Sold" value={`${stats.availableProducts} / ${stats.soldProducts}`} color="success" />
            <Stat icon={MessageSquare} label="Enquiries" value={stats.totalEnquiries} color="secondary" />
            <Stat icon={Flag} label="Open reports" value={stats.pendingReports} color="danger" />
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6>Products by category</h6>
              {stats.byCategory.map((c) => {
                const max = Math.max(...stats.byCategory.map((x) => x.total), 1);
                return (
                  <div key={c.category_name} className="mb-2">
                    <div className="d-flex justify-content-between small">
                      <span>{c.category_name}</span><span>{c.total}</span>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div className="progress-bar" style={{ width: `${(c.total / max) * 100}%`, background: '#4f46e5' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {tab === 'Products' && (
        <>
          <div className="mb-3" style={{ maxWidth: 220 }}>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option>Pending</option>
              <option>Available</option>
              <option>Sold</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Product</th><th>Seller</th><th>Price</th><th>Status</th><th className="text-end">Actions</th></tr>
                </thead>
                <tbody>
                  {products.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">No products</td></tr>}
                  {products.map((p) => (
                    <tr key={p.product_id}>
                      <td><Link to={`/products/${p.product_id}`}>{p.title}</Link><div className="small text-muted">{p.category_name}</div></td>
                      <td>{p.seller_name}<div className="small text-muted">{p.seller_email}</div></td>
                      <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td><span className="badge bg-secondary">{p.status}</span></td>
                      <td className="text-end">
                        {p.status !== 'Available' && (
                          <button className="btn btn-sm btn-success me-1" onClick={() => setProductStatus(p.product_id, 'Available')}>Approve</button>
                        )}
                        {p.status !== 'Rejected' && (
                          <button className="btn btn-sm btn-warning me-1" onClick={() => setProductStatus(p.product_id, 'Rejected')}>Reject</button>
                        )}
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(p.product_id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'Users' && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr><th>Name</th><th>Email</th><th>Department</th><th>Sem</th><th>Role</th><th>Joined</th><th /></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.department || '-'}</td>
                    <td>{u.semester || '-'}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>{u.role}</span></td>
                    <td>{fmt(u.created_at)}</td>
                    <td className="text-end">
                      {u.role === 'student' && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(u.user_id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Categories' && (
        <div style={{ maxWidth: 560 }}>
          <form className="input-group mb-3" onSubmit={addCategory}>
            <input className="form-control" placeholder="New category name" required value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <button className="btn btn-primary">Add</button>
          </form>
          <ul className="list-group shadow-sm">
            {categories.map((c) => (
              <li key={c.category_id} className="list-group-item d-flex justify-content-between align-items-center">
                {c.category_name}
                <span>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => renameCategory(c)}>Rename</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(c.category_id)}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'Reports' && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr><th>Product</th><th>Reported by</th><th>Reason</th><th>Date</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {reports.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No reports</td></tr>}
                {reports.map((r) => (
                  <tr key={r.report_id}>
                    <td><Link to={`/products/${r.product_id}`}>{r.product_title}</Link></td>
                    <td>{r.reporter_name}</td>
                    <td style={{ maxWidth: 280 }}>{r.reason}</td>
                    <td>{fmt(r.created_at)}</td>
                    <td><span className="badge bg-secondary">{r.status}</span></td>
                    <td className="text-end">
                      {r.status !== 'Reviewed' && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setReportStatus(r.report_id, 'Reviewed')}>Reviewed</button>}
                      {r.status !== 'Resolved' && <button className="btn btn-sm btn-outline-success" onClick={() => setReportStatus(r.report_id, 'Resolved')}>Resolve</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
