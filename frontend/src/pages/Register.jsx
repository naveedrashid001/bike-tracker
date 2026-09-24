import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateRegisterForm, hasErrors } from '../utils/validators';
import '../styles/register.css';

const initialForm = {
  name: '',
  fatherName: '',
  cnic: '',
  age: '',
  phone: '',
  password: '',
  consentAccepted: false,
};

const formatCnic = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 13); // 5 + 7 + 1 = 13 digits max

  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 12);
  const part3 = digits.slice(12, 13);

  let formatted = part1;
  if (part2) formatted += `-${part2}`;
  if (part3) formatted += `-${part3}`;
  return formatted;
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    if (name === 'cnic') {
      setForm({ ...form, cnic: formatCnic(value) });
      return;
    }

    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errors = validateRegisterForm(form);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        cnic: form.cnic.trim(),
        age: Number(form.age),
        phone: form.phone.trim(),
        password: form.password,
        consentAccepted: form.consentAccepted,
      });
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration nahi ho saki, dobara try karein');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-card">
        <aside className="reg-panel">
          <span className="reg-seal" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" stroke="#EEF3EF" strokeOpacity="0.35" strokeWidth="1" />
              <circle cx="24" cy="24" r="22" stroke="#A9823F" strokeWidth="1" strokeDasharray="2 4" />
              <path
                d="M24 14a6 6 0 00-6 6v3h-1a1 1 0 00-1 1v9a1 1 0 001 1h14a1 1 0 001-1v-9a1 1 0 00-1-1h-1v-3a6 6 0 00-6-6zm0 2a4 4 0 014 4v3h-8v-3a4 4 0 014-4z"
                fill="#EEF3EF"
              />
            </svg>
          </span>

          <p className="reg-panel-eyebrow">Bike registry</p>

          <h1 className="reg-panel-heading">Protect what moves you</h1>

          <p className="reg-panel-copy">
            Aapka account bike ko live tracking aur verified ownership record se jorta hai,
            taake chori ki soorat mein foran response mil sake.
          </p>

          <ul className="reg-panel-list">
            <li>Real-time location aur instant theft alert</li>
            <li>CNIC se verified ownership record</li>
            <li>24/7 monitoring team aapke saath</li>
          </ul>
        </aside>

        <div className="reg-formwrap">
          <form className="reg-form" onSubmit={handleSubmit} noValidate>
            <div className="reg-form-head">
              <h2>Register</h2>
              <p className="reg-form-sub">Apna account banayein, phir bike add karein</p>
            </div>

            {serverError && <p className="reg-error-banner">{serverError}</p>}

            <fieldset className="reg-fieldset">
              <legend>Identity details</legend>

              <div className="reg-field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {fieldErrors.name && <span className="reg-field-error">{fieldErrors.name}</span>}
              </div>

              <div className="reg-row-2">
                <div className="reg-field">
                  <label htmlFor="fatherName">Father name</label>
                  <input
                    id="fatherName"
                    name="fatherName"
                    type="text"
                    value={form.fatherName}
                    onChange={handleChange}
                  />
                  {fieldErrors.fatherName && <span className="reg-field-error">{fieldErrors.fatherName}</span>}
                </div>

                <div className="reg-field">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="100"
                    value={form.age}
                    onChange={handleChange}
                  />
                  {fieldErrors.age && <span className="reg-field-error">{fieldErrors.age}</span>}
                </div>
              </div>

              <div className="reg-field">
                <label htmlFor="cnic">CNIC (42101-1234567-1)</label>
                <input
                  id="cnic"
                  name="cnic"
                  type="text"
                  inputMode="numeric"
                  className="reg-mono"
                  value={form.cnic}
                  onChange={handleChange}
                  placeholder="42101-1234567-1"
                  maxLength={15}
                />
                {fieldErrors.cnic && <span className="reg-field-error">{fieldErrors.cnic}</span>}
              </div>
            </fieldset>

            <fieldset className="reg-fieldset">
              <legend>Account access</legend>

              <div className="reg-field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  inputMode="tel"
                  autoComplete="tel"
                  className="reg-mono"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03001234567"
                />
                {fieldErrors.phone && <span className="reg-field-error">{fieldErrors.phone}</span>}
              </div>

              <div className="reg-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                />
                {fieldErrors.password && <span className="reg-field-error">{fieldErrors.password}</span>}
              </div>
            </fieldset>

            <label className="reg-consent">
              <input
                name="consentAccepted"
                type="checkbox"
                checked={form.consentAccepted}
                onChange={handleChange}
              />
              <span>Main tracking consent qabool karta/karti hoon</span>
            </label>
            {fieldErrors.consentAccepted && <span className="reg-field-error">{fieldErrors.consentAccepted}</span>}

            <button type="submit" className="reg-submit" disabled={submitting}>
              {submitting ? 'Register ho raha hai...' : 'Register'}
            </button>

            <p className="reg-switch">
              Pehle se account hai? <Link to="/login">Login karein</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}