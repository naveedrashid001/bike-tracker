import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { validateBikeForm, hasErrors } from '../utils/validators';

const initialForm = {
  numberPlate: '',
  color: '',
  make: '',
  model: '',
  chassisNumber: '',
  engineNumber: '',
};

export default function AddBike() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errors = validateBikeForm(form);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      const res = await api.post('/bikes', {
        numberPlate: form.numberPlate.trim().toUpperCase(),
        color: form.color.trim(),
        make: form.make.trim() || undefined,
        model: form.model.trim() || undefined,
        chassisNumber: form.chassisNumber.trim() || undefined,
        engineNumber: form.engineNumber.trim() || undefined,
      });
      navigate(`/bikes/${res.data.bike._id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Bike add nahi ho saki, dobara try karein');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">
        ← Dashboard
      </Link>
      <form className="card-form" onSubmit={handleSubmit} noValidate>
        <h1>Nayi bike add karein</h1>
        {serverError && <p className="form-error">{serverError}</p>}

        <label>
          Number plate
          <input name="numberPlate" type="text" value={form.numberPlate} onChange={handleChange} placeholder="ABC-123" />
          {fieldErrors.numberPlate && <span className="field-error">{fieldErrors.numberPlate}</span>}
        </label>

        <label>
          Color
          <input name="color" type="text" value={form.color} onChange={handleChange} />
          {fieldErrors.color && <span className="field-error">{fieldErrors.color}</span>}
        </label>

        <label>
          Make (optional)
          <input name="make" type="text" value={form.make} onChange={handleChange} placeholder="Honda" />
        </label>

        <label>
          Model (optional)
          <input name="model" type="text" value={form.model} onChange={handleChange} placeholder="CD70" />
        </label>

        <label>
          Chassis number (optional)
          <input name="chassisNumber" type="text" value={form.chassisNumber} onChange={handleChange} />
        </label>

        <label>
          Engine number (optional)
          <input name="engineNumber" type="text" value={form.engineNumber} onChange={handleChange} />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Save ho raha hai...' : 'Bike save karein'}
        </button>
      </form>
    </div>
  );
}
