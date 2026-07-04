import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getCitizenDashboard, getMySubmissions } from '../api/client';
import { PaperPlaneTilt, HourglassHigh, CheckCircle, XCircle, UsersThree } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const STATUS_BADGE = {
  submitted: 'badge-info', processing: 'badge-warning', processed: 'badge-accent', clustered: 'badge-accent',
  categorized: 'badge-info', scored: 'badge-info', approved: 'badge-success',
  rejected: 'badge-danger', failed: 'badge-danger',
};

const SECTOR_COLORS = {
  ROADS_PATHWAYS_BRIDGES: '#f97316', EDUCATION: '#3b82f6', HEALTH: '#ef4444',
  DRINKING_WATER: '#06b6d4', SANITATION: '#22c55e', ELECTRICITY: '#eab308',
  SPORTS: '#8b5cf6', COMMUNITY_INFRASTRUCTURE: '#ec4899', IRRIGATION: '#6366f1',
  RAILWAYS: '#f43f5e', DISASTER_RELIEF: '#a855f7',
};

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashData, subData] = await Promise.all([getCitizenDashboard(), getMySubmissions()]);
        setDashboard(dashData);
        setSubmissions(subData);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>{t('common.loading')}</div>;

  const myStats = dashboard?.my_stats || {};
  const areaStats = dashboard?.area_stats || {};
  const categoryStats = (dashboard?.category_stats || []).map(c => ({
    ...c, color: SECTOR_COLORS[c.category] || '#6366f1',
  }));

  const areaChart = [
    { name: t('citizen_dashboard.area_approved'), value: Number(areaStats.approved) || 0, fill: 'var(--success)' },
    { name: t('citizen_dashboard.area_pending'), value: Number(areaStats.pending) || 0, fill: 'var(--warning)' },
    { name: t('citizen_dashboard.area_rejected'), value: Number(areaStats.rejected) || 0, fill: 'var(--danger)' },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('citizen_dashboard.title')}</h1>
        <p className="page-subtitle">{t('citizen_dashboard.welcome')}, {user?.name || 'Citizen'}</p>
      </div>

      <div className="stats-grid">
        {[
          { icon: <PaperPlaneTilt size={22} />, value: Number(myStats.total) || 0, label: t('citizen_dashboard.total_submissions'), cls: 'accent' },
          { icon: <HourglassHigh size={22} />, value: Number(myStats.in_progress) || 0, label: t('citizen_dashboard.in_progress'), cls: 'warning' },
          { icon: <CheckCircle size={22} />, value: Number(myStats.approved) || 0, label: t('citizen_dashboard.approved'), cls: 'success' },
          { icon: <XCircle size={22} />, value: Number(myStats.rejected) || 0, label: t('citizen_dashboard.rejected'), cls: 'danger' },
        ].map((s, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid-2">
        {/* My Submissions Table */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">{t('citizen_dashboard.my_submissions')}</h3>
          </div>
          {submissions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>{t('citizen_dashboard.no_submissions')}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('citizen_dashboard.tracking_id')}</th>
                    <th>Issue</th>
                    <th>{t('citizen_dashboard.category')}</th>
                    <th>{t('citizen_dashboard.status')}</th>
                    <th><UsersThree size={14} /> {t('citizen_dashboard.people_count')}</th>
                    <th>{t('citizen_dashboard.submitted_on')}</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{sub.tracking_id}</td>
                      <td style={{ maxWidth: 250 }}>{(sub.raw_text || sub.translated_text_en || '').slice(0, 60)}...</td>
                      <td>{sub.category ? <span className="badge badge-accent">{t(`sectors.${sub.category}`, sub.category)}</span> : <span className="badge badge-neutral">Pending</span>}</td>
                      <td><span className={`badge ${STATUS_BADGE[sub.status] || 'badge-neutral'}`}>{t(`status.${sub.status}`, sub.status)}</span></td>
                      <td style={{ fontWeight: 600 }}>{sub.similar_count || '-'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{sub.created_at?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Area Stats Pie */}
        {areaChart.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">{t('citizen_dashboard.area_stats')}</h3></div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={areaChart} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={4} stroke="none">
                  {areaChart.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              {areaChart.map((a) => (
                <span key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.fill, display: 'inline-block' }} /> {a.name}: {a.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Distribution */}
        {categoryStats.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">{t('citizen_dashboard.category_wise')}</h3></div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryStats} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis type="category" dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={100} tickFormatter={(v) => t(`sectors.${v}`, v)} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>{categoryStats.map((c, i) => <Cell key={i} fill={c.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
