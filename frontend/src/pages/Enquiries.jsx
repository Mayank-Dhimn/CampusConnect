import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function Enquiries() {
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/enquiries/received').then((r) => setReceived(r.data)).catch((e) => setError(errMsg(e)));
    api.get('/enquiries/sent').then((r) => setSent(r.data)).catch((e) => setError(errMsg(e)));
  };
  useEffect(load, []);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/enquiries/${id}`, { status });
      load();
    } catch (err) {
      alert(errMsg(err));
    }
  };

  const list = tab === 'received' ? received : sent;

  return (
    <div className="container py-4">
      <h3 className="mb-3">My enquiries</h3>
      <ul className="nav nav-pills mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
            Received ({received.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
            Sent ({sent.length})
          </button>
        </li>
      </ul>
      {error && <div className="alert alert-danger">{error}</div>}

      {list.length === 0 ? (
        <div className="alert alert-info">No enquiries here yet.</div>
      ) : (
        <div className="d-grid gap-3">
          {list.map((e) => (
            <div className="card border-0 shadow-sm" key={e.enquiry_id}>
              <div className="card-body">
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <div>
                    <Link to={`/products/${e.product_id}`} className="fw-semibold text-decoration-none">{e.product_title}</Link>
                    <div className="small text-muted">
                      {tab === 'received'
                        ? <>From <strong>{e.buyer_name}</strong> ({e.buyer_email})</>
                        : <>To <strong>{e.seller_name}</strong> ({e.seller_email})</>}
                      {' • '}{fmt(e.created_at)}
                    </div>
                  </div>
                  <span className={`badge align-self-start ${e.status === 'New' ? 'bg-primary' : e.status === 'Responded' ? 'bg-success' : 'bg-secondary'}`}>
                    {e.status}
                  </span>
                </div>
                <p className="mt-2 mb-2">{e.message}</p>
                {tab === 'received' && (
                  <div className="d-flex gap-2">
                    {e.status !== 'Responded' && (
                      <button className="btn btn-sm btn-outline-success" onClick={() => setStatus(e.enquiry_id, 'Responded')}>Mark responded</button>
                    )}
                    {e.status !== 'Closed' && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setStatus(e.enquiry_id, 'Closed')}>Close</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
