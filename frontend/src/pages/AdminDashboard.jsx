import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadAll = async () => {
    setError('');
    try {
      const [statsRes, usersRes, bikesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/bikes'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setBikes(bikesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Admin data load nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Is user ko aur uski sab bikes ko delete karna hai? Ye wapis nahi ho sakta.')) return;
    setBusyId(id);
    setError('');
    try {
      await api.delete(`/admin/users/${id}`);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'User delete nahi ho saka');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteBike = async (id) => {
    if (!window.confirm('Is bike ko delete karna hai? Ye wapis nahi ho sakta.')) return;
    setBusyId(id);
    setError('');
    try {
      await api.delete(`/admin/bikes/${id}`);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Bike delete nahi ho saki');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      {error && <p className="form-error">{error}</p>}

      {stats && (
        <div className="bike-grid" style={{ marginBottom: 32 }}>
          <div className="bike-card">
            <h3>{stats.totalUsers}</h3>
            <p className="muted">Total registered users</p>
          </div>
          <div className="bike-card">
            <h3>{stats.totalBikes}</h3>
            <p className="muted">Total bikes</p>
          </div>
          <div className="bike-card">
            <h3>{stats.bikesWithTracker}</h3>
            <p className="muted">Bikes with tracker</p>
          </div>
          <div className="bike-card">
            <h3>{stats.bikesWithoutTracker}</h3>
            <p className="muted">Bikes without tracker</p>
          </div>
          <div className="bike-card">
            <h3>{stats.activeTheftReports}</h3>
            <p className="muted">Active theft reports</p>
          </div>
        </div>
      )}

      <h2>Sab Users ({users.length})</h2>
      <div className="table-wrapper" style={{ marginBottom: 32 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>CNIC</th>
              <th>Role</th>
              <th>Registered</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.phone}</td>
                <td>{u.cnic}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {u.role !== 'admin' && (
                    <button
                      type="button"
                      className="danger"
                      disabled={busyId === u._id}
                      onClick={() => handleDeleteUser(u._id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">Koi user nahi mila</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2>Sab Bikes ({bikes.length})</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Plate</th>
              <th>Owner</th>
              <th>Make / Model</th>
              <th>Tracker</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bikes.map((b) => (
              <tr key={b._id}>
                <td>
                  <Link to={`/bikes/${b._id}`}>{b.numberPlate}</Link>
                </td>
                <td>
                  {b.owner ? `${b.owner.name} (${b.owner.phone})` : '—'}
                </td>
                <td>{[b.make, b.model].filter(Boolean).join(' ') || '—'}</td>
                <td>
                  {b.tracker ? (
                    <span className={`status-pill ${b.tracker.status === 'online' ? 'online' : 'offline'}`}>
                      {b.tracker.status} ({b.tracker.imei})
                    </span>
                  ) : (
                    <span className="muted">Not linked</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="danger"
                    disabled={busyId === b._id}
                    onClick={() => handleDeleteBike(b._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {bikes.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">Koi bike nahi mili</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}