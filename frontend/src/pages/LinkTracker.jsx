import { useState } from 'react';
import api from '../api/axiosClient';

export default function LinkTracker() {
  const [form, setForm] = useState({ imei: '', bikeId: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.imei.trim() || !form.bikeId.trim()) {
      setError('IMEI aur Bike ID dono zaroori hain');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/trackers/link', { imei: form.imei.trim(), bikeId: form.bikeId.trim() });
      setMessage(res.data.message);
      setForm({ imei: '', bikeId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Tracker link nahi ho saka');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <form className="card-form" onSubmit={handleSubmit} noValidate>
        <h1>Tracker link karein (Admin)</h1>
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}

        <label>
          Tracker IMEI
          <input name="imei" type="text" value={form.imei} onChange={handleChange} />
        </label>

        <label>
          Bike ID
          <input name="bikeId" type="text" value={form.bikeId} onChange={handleChange} placeholder="Bike ki MongoDB _id" />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Link ho raha hai...' : 'Link karein'}
        </button>
      </form>
    </div>
  );
}
