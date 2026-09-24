import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <h1>404</h1>
      <p>Ye page nahi mila.</p>
      <Link to="/dashboard">Dashboard par jayein</Link>
    </div>
  );
}
