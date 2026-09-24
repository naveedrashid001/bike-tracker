import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm, hasErrors } from '../utils/validators';
import '../styles/login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errors = validateLoginForm(form);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await login(form.phone.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      // Backend jo bhi message bheje wahi dikhao (e.g. rate-limit ya
      // "phone ya password ghalat hai") — apni taraf se guess na karein
      setServerError(err.response?.data?.message || 'Login nahi ho saka, dobara try karein');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Login</h1>
        {serverError && <p className="form-error">{serverError}</p>}

        <label>
          Phone
          <input
            name="phone"
            type="text"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
          />
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Login ho raha hai...' : 'Login'}
        </button>

        <p className="auth-switch">
          Account nahi hai? <Link to="/register">Register karein</Link>
        </p>
      </form>
    </div>
  );
}