import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', semester: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setBusy(true);
    try {
      await register(form);
      navigate('/marketplace', { replace: true });
    } catch (err) {
      setError(errMsg(err, 'Registration failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card auth-card shadow mx-auto">
        <div className="card-body p-4">
          <h3 className="mb-1">Create your account</h3>
          <p className="text-muted">Join the campus marketplace</p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input className="form-control" required value={form.name} onChange={set('name')} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" required value={form.email} onChange={set('email')} />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" required minLength={6} value={form.password} onChange={set('password')} />
            </div>
            <div className="row">
              <div className="col-8 mb-3">
                <label className="form-label">Department</label>
                <input className="form-control" placeholder="e.g. MCA" value={form.department} onChange={set('department')} />
              </div>
              <div className="col-4 mb-3">
                <label className="form-label">Semester</label>
                <input type="number" min="1" max="12" className="form-control" value={form.semester} onChange={set('semester')} />
              </div>
            </div>
            <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Creating...' : 'Register'}</button>
          </form>
          <p className="text-center mt-3 mb-0">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
