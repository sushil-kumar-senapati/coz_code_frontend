import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { LANGUAGES } from '../i18n';
import { House, PaperPlaneTilt, ChartBar, Sun, Moon, Translate, SignOut, UserCircle, ListBullets } from '@phosphor-icons/react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated, isMp } = useAuth();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('pp_lang', code);
    setLangOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">PP</div>
          <span className="navbar-title">{t('app_name')}</span>
        </Link>

        <div className="navbar-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <House size={18} /> {t('nav.home')}
          </Link>
          {isAuthenticated && !isMp && (
            <>
              <Link to="/submit" className={`nav-link ${isActive('/submit') ? 'active' : ''}`}>
                <PaperPlaneTilt size={18} /> {t('nav.submit')}
              </Link>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                <ChartBar size={18} /> {t('nav.dashboard')}
              </Link>
            </>
          )}
          {isAuthenticated && isMp && (
            <Link to="/mp-dashboard" className={`nav-link ${isActive('/mp-dashboard') ? 'active' : ''}`}>
              <ChartBar size={18} /> {t('nav.mp_dashboard')}
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          {/* Language Selector */}
          <div className="lang-dropdown" ref={langRef}>
            <button className="nav-icon-btn" onClick={() => setLangOpen(!langOpen)} title={t('nav.language')}>
              <Translate size={18} />
            </button>
            {langOpen && (
              <div className="lang-dropdown-menu">
                {LANGUAGES.map((lang) => (
                  <button key={lang.code} className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`} onClick={() => changeLang(lang.code)}>
                    <span>{lang.name}</span>
                    <span className="lang-native">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button className="nav-icon-btn" onClick={toggleTheme} title={t('nav.theme')}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth Actions */}
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-icon-btn" title={t('nav.profile')}>
                <UserCircle size={18} />
              </Link>
              <button className="nav-icon-btn" onClick={logout} title={t('nav.logout')}>
                <SignOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">{t('nav.login')}</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
