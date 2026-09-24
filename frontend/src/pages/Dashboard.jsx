import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/bikes')
      .then((res) => {
        if (!cancelled) setBikes(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('Bikes load nahi ho sakein');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>{user?.role === 'admin' ? 'Sab Bikes' : 'Meri Bikes'}</h1>
        <Link to="/bikes/new" className="button-link">
          + Nayi bike add karein
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && bikes.length === 0 && (
        <p className="empty-state">Abhi tak koi bike register nahi ki. "Nayi bike add karein" par click karein.</p>
      )}

      <div className="bike-grid">
        {bikes.map((bike) => (
          <Link to={`/bikes/${bike._id}`} className="bike-card" key={bike._id}>
            <h3>{bike.numberPlate}</h3>
            <p>{[bike.make, bike.model].filter(Boolean).join(' ') || 'Model nahi diya gaya'}</p>
            <p className="bike-color">Color: {bike.color}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
