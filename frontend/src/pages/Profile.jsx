import { useState } from 'react';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    department: user.department || '',
    semester: user.semester || '',
    password: '',
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const res = await api.put('/auth/profile', payload);
      setUser(res.data);
      setForm({ ...form, password: '' });
      setMsg({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-3">My profile</h3>
          {msg.text && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={user.email} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" required value={form.name} onChange={set('name')} />
            </div>
            <div className="row">
              <div className="col-8 mb-3">
                <label className="form-label">Department</label>
                <input className="form-control" value={form.department} onChange={set('department')} />
              </div>
              <div className="col-4 mb-3">
                <label className="form-label">Semester</label>
                <input type="number" min="1" max="12" className="form-control" value={form.semester} onChange={set('semester')} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">New password (leave blank to keep current)</label>
              <input type="password" minLength={6} className="form-control" value={form.password} onChange={set('password')} />
            </div>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
