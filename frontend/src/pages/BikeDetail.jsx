import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import api from '../api/axiosClient';

export default function BikeDetail() {
  const { id } = useParams();

  const [bike, setBike] = useState(null);
  const [tracker, setTracker] = useState(null);
  const [trackerError, setTrackerError] = useState('');
  const [liveLocation, setLiveLocation] = useState(null);
  const [liveError, setLiveError] = useState('');
  const [history, setHistory] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const loadAll = useCallback(async () => {
    setPageError('');
    try {
      const bikeRes = await api.get(`/bikes/${id}`);
      setBike(bikeRes.data);
    } catch (err) {
      setPageError(err.response?.data?.message || 'Bike load nahi ho saki');
      setLoading(false);
      return;
    }

    // Tracker status — agar tracker linked hi nahi hai to 404 aayega, ye
    // error nahi, ek normal state hai
    try {
      const trackerRes = await api.get(`/trackers/${id}/status`);
      setTracker(trackerRes.data);
      setTrackerError('');
    } catch (err) {
      setTracker(null);
      setTrackerError(err.response?.data?.message || 'Tracker status nahi mil saka');
    }

    // Live location
    try {
      const liveRes = await api.get(`/locations/${id}/live`);
      setLiveLocation(liveRes.data);
      setLiveError('');
    } catch (err) {
      setLiveLocation(null);
      setLiveError(err.response?.data?.message || 'Abhi tak koi location nahi mili');
    }

    // History (path)
    try {
      const historyRes = await api.get(`/locations/${id}/history`, { params: { limit: 100 } });
      setHistory(historyRes.data);
    } catch {
      setHistory([]);
    }

    // Active theft report (agar hai to)
    try {
      const activeRes = await api.get(`/theft/${id}/active`);
      setActiveReport(activeRes.data);
    } catch {
      setActiveReport(null);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleReportTheft = async () => {
    setActionError('');
    setActionBusy(true);
    try {
      const res = await api.post(`/theft/${id}/report`);
      setActiveReport(res.data.theftReport);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Theft report nahi ban saki');
    } finally {
      setActionBusy(false);
    }
  };

  const handleResolve = async () => {
    if (!activeReport) return;
    setActionError('');
    setActionBusy(true);
    try {
      await api.patch(`/theft/${activeReport._id}/resolve`);
      setActiveReport(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Report resolve nahi ho saki');
    } finally {
      setActionBusy(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!activeReport) return;
    setActionError('');
    try {
      // PDF route JWT se protected hai, isliye plain <a href> se seedha download
      // nahi ho sakta (Authorization header nahi bhej sakta) — isliye blob
      // fetch kar ke manually download trigger karte hain
      const res = await api.get(`/theft/${activeReport._id}/pdf`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `theft-report-${activeReport._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setActionError('PDF download nahi ho saki');
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (pageError) {
    return (
      <div className="page">
        <p className="form-error">{pageError}</p>
        <Link to="/dashboard">← Dashboard par wapis jayein</Link>
      </div>
    );
  }

  const pathPoints = [...history].reverse().map((log) => [log.lat, log.lng]);
  const mapCenter = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : pathPoints.length > 0
    ? pathPoints[pathPoints.length - 1]
    : [30.3753, 69.3451]; // Pakistan ka roughly center, jab koi location na ho

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">
        ← Dashboard
      </Link>

      <div className="bike-header">
        <h1>{bike.numberPlate}</h1>
        <p>{[bike.color, bike.make, bike.model].filter(Boolean).join(' · ')}</p>
        {bike.chassisNumber && <p className="muted">Chassis: {bike.chassisNumber}</p>}
        {bike.engineNumber && <p className="muted">Engine: {bike.engineNumber}</p>}
      </div>

      <div className="status-row">
        <div className={`status-pill ${tracker?.status === 'online' ? 'online' : 'offline'}`}>
          Tracker: {tracker ? tracker.status : 'Not linked'}
        </div>
        {tracker?.lastSeen && (
          <span className="muted">Last seen: {new Date(tracker.lastSeen).toLocaleString()}</span>
        )}
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      <div className="theft-actions">
        {activeReport ? (
          <>
            <div className="status-pill active-theft">Theft report ACTIVE</div>
            <button type="button" onClick={handleDownloadPdf} disabled={actionBusy}>
              PDF download karein
            </button>
            <button type="button" className="secondary" onClick={handleResolve} disabled={actionBusy}>
              Bike mil gayi — resolve karein
            </button>
          </>
        ) : (
          <button type="button" className="danger" onClick={handleReportTheft} disabled={actionBusy}>
            🚨 Bike chori ho gayi — report karein
          </button>
        )}
      </div>

      <h2>Location</h2>
      {liveError && !liveLocation && <p className="muted">{liveError}</p>}
      {trackerError && !tracker && <p className="muted">{trackerError}</p>}

      <div className="map-wrapper">
        <MapContainer center={mapCenter} zoom={liveLocation ? 15 : 6} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pathPoints.length > 1 && <Polyline positions={pathPoints} />}
          {liveLocation && (
            <Marker position={[liveLocation.lat, liveLocation.lng]}>
              <Popup>
                Latest location
                <br />
                {new Date(liveLocation.timestamp).toLocaleString()}
                <br />
                Speed: {liveLocation.speed} km/h
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <h2>Recent history</h2>
      {history.length === 0 ? (
        <p className="empty-state">Abhi tak koi location history nahi hai.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Lat</th>
                <th>Lng</th>
                <th>Speed</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.lat.toFixed(5)}</td>
                  <td>{log.lng.toFixed(5)}</td>
                  <td>{log.speed} km/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
