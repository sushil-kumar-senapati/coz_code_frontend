import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PaperPlaneTilt, ArrowRight, Translate, Eye, ChartLineUp, MapPin } from '@phosphor-icons/react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <motion.section className="hero" initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="hero-title">
          <span className="gradient">{t('home.hero_title')}</span>
        </h1>
        <p className="hero-subtitle">{t('home.hero_subtitle')}</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            <PaperPlaneTilt size={20} weight="bold" /> {t('home.cta_submit')}
          </Link>
          <a href="#how-it-works" className="btn btn-secondary btn-lg">
            {t('home.cta_learn')} <ArrowRight size={18} />
          </a>
        </div>
        <div className="hero-stats">
          {[
            { value: '12,450+', label: t('home.stat_citizens') },
            { value: '3,280', label: t('home.stat_issues') },
            { value: '186', label: t('home.stat_approved') },
            { value: '₹8.4 Cr', label: t('home.stat_budget') },
          ].map((s, i) => (
            <motion.div key={i} className="hero-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <div className="hero-stat-value">{s.value}</div>
              <div className="hero-stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <section className="steps-section" id="how-it-works">
        <h2 className="section-title">{t('home.how_it_works')}</h2>
        <div className="steps-grid">
          {[
            { num: 1, title: t('home.step1_title'), desc: t('home.step1_desc') },
            { num: 2, title: t('home.step2_title'), desc: t('home.step2_desc') },
            { num: 3, title: t('home.step3_title'), desc: t('home.step3_desc') },
            { num: 4, title: t('home.step4_title'), desc: t('home.step4_desc') },
          ].map((step, i) => (
            <motion.div key={i} className="step-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} viewport={{ once: true }}>
              <div className="step-number">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="steps-section">
        <h2 className="section-title">{t('home.features_title')}</h2>
        <div className="features-grid">
          {[
            { icon: <Translate size={24} />, title: t('home.feature1_title'), desc: t('home.feature1_desc') },
            { icon: <Eye size={24} />, title: t('home.feature2_title'), desc: t('home.feature2_desc') },
            { icon: <ChartLineUp size={24} />, title: t('home.feature3_title'), desc: t('home.feature3_desc') },
            { icon: <MapPin size={24} />, title: t('home.feature4_title'), desc: t('home.feature4_desc') },
          ].map((f, i) => (
            <motion.div key={i} className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <div className="feature-icon">{f.icon}</div>
              <div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
