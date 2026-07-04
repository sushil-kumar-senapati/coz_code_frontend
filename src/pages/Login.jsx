import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Phone, Lock, Eye, EyeSlash } from '@phosphor-icons/react';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(phone, password);
      navigate(user.role === 'mp' ? '/mp-dashboard' : '/dashboard');
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
          <h1 className="page-title">{t('auth.login_title')}</h1>
          <p className="page-subtitle">{t('auth.login_subtitle')}</p>
        </div>

        {error && <div style={{ padding: '10px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><Phone size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('auth.phone')}</label>
            <input type="tel" className="form-input" placeholder={t('auth.phone_placeholder')} value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} required />
          </div>
          <div className="form-group">
            <label className="form-label"><Lock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} className="form-input" placeholder={t('auth.password_placeholder')} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? t('common.loading') : t('auth.login_btn')}
          </button>
        </form>
        <div className="auth-toggle">
          {t('auth.no_account')} <Link to="/register">{t('nav.register')}</Link>
        </div>
      </div>
    </div>
  );
}
