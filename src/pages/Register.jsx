import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { pinLookup } from '../api/client';
import { Phone, Lock, MapPin, CheckCircle } from '@phosphor-icons/react';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', name: '', pinCode: '', password: '', confirmPassword: '' });
  const [location, setLocation] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinChange = async (val) => {
    setForm({ ...form, pinCode: val });
    setLocation(null);
    if (val.length === 6) {
      setPinLoading(true);
      try {
        const data = await pinLookup(val);
        setLocation(data);
      } catch { setLocation(null); }
      setPinLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await register({ phone: form.phone, password: form.password, name: form.name, home_pin_code: form.pinCode });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="page-title">{t('auth.register_title')}</h1>
          <p className="page-subtitle">{t('auth.register_subtitle')}</p>
        </div>

        {error && <div style={{ padding: '10px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><Phone size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('auth.phone')}</label>
            <input type="tel" className="form-input" placeholder={t('auth.phone_placeholder')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={15} required />
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label"><MapPin size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('auth.pin_code')}</label>
            <input type="text" className="form-input" placeholder={t('auth.pin_code_placeholder')} value={form.pinCode} onChange={(e) => handlePinChange(e.target.value.replace(/\D/g, ''))} maxLength={6} required />
            {pinLoading && <div className="form-hint">{t('common.loading')}</div>}
            {location && (
              <div className="location-grid">
                <div className="form-hint" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)' }}>
                  <CheckCircle size={14} weight="fill" /> {t('auth.auto_filled')}
                </div>
                {[
                  { label: t('auth.postal_name'), value: location.postal_name },
                  { label: t('auth.locality'), value: location.locality },
                  { label: t('auth.city'), value: location.city },
                  { label: t('auth.district'), value: location.district },
                  { label: t('auth.state'), value: location.state },
                  { label: t('auth.constituency'), value: location.mp_constituency },
                ].map((f) => (
                  <div key={f.label} className="location-field">
                    <span className="location-field-label">{f.label}</span>
                    <span className="location-field-value">{f.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label"><Lock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('auth.password')}</label>
            <input type="password" className="form-input" placeholder={t('auth.password_placeholder')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.confirm_password')}</label>
            <input type="password" className="form-input" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? t('common.loading') : t('auth.register_btn')}
          </button>
        </form>
        <div className="auth-toggle">
          {t('auth.has_account')} <Link to="/login">{t('nav.login')}</Link>
        </div>
      </div>
    </div>
  );
}
