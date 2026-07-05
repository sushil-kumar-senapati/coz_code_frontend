import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getCitizenDashboard } from '../api/client';
import { PaperPlaneTilt, HourglassHigh, CheckCircle, XCircle, UsersThree, MapPin, Bell, TrendUp, ChartBar, Buildings, Trophy } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
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

const SECTOR_SHORT = {
  ROADS_PATHWAYS_BRIDGES: 'Roads', EDUCATION: 'Education', HEALTH: 'Health',
  DRINKING_WATER: 'Water', SANITATION: 'Sanitation', ELECTRICITY: 'Electricity',
  SPORTS: 'Sports', COMMUNITY_INFRASTRUCTURE: 'Community', IRRIGATION: 'Irrigation',
  RAILWAYS: 'Railways', DISASTER_RELIEF: 'Disaster',
};

const fmt = (n) => {
  if (!n) return '₹0'; n = Number(n);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { (async () => { try { setDashboard(await getCitizenDashboard()); } catch (e) { console.error(e); } setLoading(false); })(); }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>{t('common.loading')}</div>;

  const myStats = dashboard?.my_stats || {};
  const areaStats = dashboard?.area_stats || {};
  const categoryStats = (dashboard?.category_stats || []).map(c => ({ ...c, color: SECTOR_COLORS[c.category] || '#6366f1', shortName: SECTOR_SHORT[c.category] || c.category }));
  const submissions = dashboard?.my_submissions || [];
  const localityStats = dashboard?.locality_stats || [];
  const submissionTrend = dashboard?.submission_trend || [];
  const unreadNotifs = dashboard?.unread_notifications || 0;
  const budget = dashboard?.budget || {};
  const topIssues = dashboard?.top_issues || [];

  const areaChart = [
    { name: 'Approved', value: Number(areaStats.approved) || 0, fill: 'var(--success)' },
    { name: 'Pending', value: Number(areaStats.pending) || 0, fill: 'var(--warning)' },
    { name: 'Rejected', value: Number(areaStats.rejected) || 0, fill: 'var(--danger)' },
  ].filter(d => d.value > 0);

  const totalBudget = Number(budget.total_budget) || 50000000;
  const budgetAllocated = Number(budget.total_allocated) || 0;
  const budgetRemaining = Number(budget.remaining) || totalBudget;
  const budgetPct = Math.round((budgetAllocated / totalBudget) * 100);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('citizen_dashboard.title')}</h1>
        <p className="page-subtitle">{t('citizen_dashboard.welcome')}, {user?.name || 'Citizen'} — {user?.home_constituency || ''}</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {[
          { icon: <PaperPlaneTilt size={22} />, value: Number(myStats.total) || 0, label: t('citizen_dashboard.total_submissions'), cls: 'accent' },
          { icon: <HourglassHigh size={22} />, value: Number(myStats.in_progress) || 0, label: t('citizen_dashboard.in_progress'), cls: 'warning' },
          { icon: <CheckCircle size={22} />, value: Number(myStats.approved) || 0, label: t('citizen_dashboard.approved'), cls: 'success' },
          { icon: <XCircle size={22} />, value: Number(myStats.rejected) || 0, label: t('citizen_dashboard.rejected'), cls: 'danger' },
          { icon: <UsersThree size={22} />, value: Number(areaStats.total_people) || 0, label: 'Total Citizens', cls: 'accent' },
          { icon: <ChartBar size={22} />, value: Number(areaStats.total_issues) || 0, label: 'Area Issues', cls: 'info' },
          { icon: <Bell size={22} />, value: unreadNotifs, label: 'Unread Alerts', cls: unreadNotifs > 0 ? 'danger' : 'neutral' },
          { icon: <MapPin size={22} />, value: Number(areaStats.districts_covered) || 0, label: 'Districts', cls: 'accent' },
        ].map((s, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        {['overview', 'submissions', 'area'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: 'calc(var(--radius) - 2px)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'var(--font-display)',
              background: activeTab === tab ? 'var(--accent)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
            {tab === 'overview' ? '📊 Overview' : tab === 'submissions' ? '📝 My Submissions' : '🗺️ Area Analytics'}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (<>
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">💰 MPLADS Budget ({user?.home_constituency})</h3></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Budget Utilized</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{budgetPct}%</span>
            </div>
            <div className="budget-gauge"><div className="budget-gauge-fill" style={{ width: `${budgetPct}%` }} /></div>
            <div className="budget-labels"><span>{fmt(budgetAllocated)} allocated</span><span>{fmt(totalBudget)} total</span></div>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: '0.85rem', textAlign: 'center' }}>
              <div><div style={{ color: 'var(--text-muted)' }}>Remaining</div><div style={{ fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>{fmt(budgetRemaining)}</div></div>
              <div><div style={{ color: 'var(--text-muted)' }}>Approved</div><div style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{Number(budget.approved_count) || 0}</div></div>
              <div><div style={{ color: 'var(--text-muted)' }}>Pending</div><div style={{ fontWeight: 700, color: 'var(--warning)', fontFamily: 'var(--font-display)' }}>{Number(budget.pending_count) || 0}</div></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">{t('citizen_dashboard.area_stats')}</h3></div>
            {areaChart.length > 0 ? (<>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart><Pie data={areaChart} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={4} stroke="none">
                  {areaChart.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie><Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} /></PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                {areaChart.map(a => <span key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: a.fill, display: 'inline-block' }} /> {a.name}: {a.value}</span>)}
              </div>
            </>) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No area data yet</p>}
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">{t('citizen_dashboard.category_wise')}</h3></div>
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, categoryStats.length * 36)}>
                <BarChart data={categoryStats} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis type="category" dataKey="shortName" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" name="Issues" radius={[0, 4, 4, 0]}>{categoryStats.map((c, i) => <Cell key={i} fill={c.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No categories yet</p>}
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">👥 Citizens per Category</h3></div>
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, categoryStats.length * 36)}>
                <BarChart data={categoryStats} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis type="category" dataKey="shortName" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="people" name="Citizens" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No data yet</p>}
          </div>
        </div>

        {topIssues.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h3 className="card-title">🏆 Top Priorities in Your Area</h3></div>
            <div style={{ display: 'grid', gap: 12 }}>
              {topIssues.map((issue, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 'var(--radius)', background: 'var(--bg-input)', border: '1px solid var(--border-light)', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: i < 3 ? 'var(--accent)' : 'var(--text-muted)', minWidth: 40, textAlign: 'center' }}>#{issue.rank || i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{(issue.representative_text || '').slice(0, 100)}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-accent">{t(`sectors.${issue.category}`, issue.category)}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👥 {issue.unique_users}</span>
                      {issue.estimated_cost && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>💰 {fmt(issue.estimated_cost)}</span>}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: Number(issue.priority_score) >= 7 ? 'var(--success)' : Number(issue.priority_score) >= 5 ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {Number(issue.priority_score)?.toFixed(1) || '-'}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {submissionTrend.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="card-title"><TrendUp size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Submission Trend (Last 30 Days)</h3></div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={submissionTrend.map(d => ({ ...d, date: d.date?.slice(5) }))}>
                <defs><linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#trendGrad)" strokeWidth={2} name="Submissions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </>)}

      {/* SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">{t('citizen_dashboard.my_submissions')} ({submissions.length})</h3></div>
          {submissions.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>{t('citizen_dashboard.no_submissions')}</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Tracking ID</th><th>Issue</th><th>Type</th><th>Category</th><th>Status</th><th>Similar</th><th>Rank</th><th>Score</th><th>Location</th><th>Date</th></tr></thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>{sub.tracking_id}</td>
                      <td style={{ maxWidth: 200 }}>{(sub.translated_text_en || sub.raw_text || '').slice(0, 50)}...</td>
                      <td><span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{sub.input_type}</span></td>
                      <td>{sub.category ? <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{SECTOR_SHORT[sub.category] || sub.category}</span> : <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Pending</span>}</td>
                      <td><span className={`badge ${STATUS_BADGE[sub.status] || 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>{sub.status}</span></td>
                      <td style={{ fontWeight: 600, textAlign: 'center' }}>{sub.similar_count || '-'}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: sub.cluster_rank && sub.cluster_rank <= 3 ? 'var(--accent)' : 'var(--text-muted)' }}>{sub.cluster_rank ? `#${sub.cluster_rank}` : '-'}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: Number(sub.priority_score) >= 7 ? 'var(--success)' : 'var(--text-muted)' }}>{sub.priority_score ? Number(sub.priority_score).toFixed(1) : '-'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.sub_city || sub.sub_district || sub.submission_pin_code}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{sub.created_at?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* AREA ANALYTICS */}
      {activeTab === 'area' && (<>
        {localityStats.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h3 className="card-title"><MapPin size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Top Localities with Most Issues</h3></div>
            <ResponsiveContainer width="100%" height={Math.max(200, localityStats.length * 32)}>
              <BarChart data={localityStats.slice(0, 10).map(l => ({ ...l, name: l.locality || l.pin_code }))} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="issue_count" name="Issues" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {localityStats.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h3 className="card-title">📍 Locality-wise Breakdown</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table"><thead><tr><th>Locality</th><th>PIN Code</th><th>Issues</th><th>Citizens</th></tr></thead>
                <tbody>{localityStats.map((l, i) => (<tr key={i}><td style={{ fontWeight: 600 }}>{l.locality || 'Unknown'}</td><td style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{l.pin_code}</td><td style={{ fontWeight: 600 }}>{l.issue_count}</td><td>{l.people}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}
        {categoryStats.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">📊 Category Performance</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table"><thead><tr><th>Category</th><th>Issues</th><th>Citizens</th><th>Avg Score</th><th>Approved</th></tr></thead>
                <tbody>{categoryStats.map((c, i) => (<tr key={i}><td><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: c.color, marginRight: 8 }} />{c.shortName}</td><td style={{ fontWeight: 600 }}>{c.count}</td><td>{Number(c.people) || 0}</td><td style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: Number(c.avg_score) >= 7 ? 'var(--success)' : 'var(--text-muted)' }}>{c.avg_score || '-'}</td><td><span className="badge badge-success">{Number(c.approved_count) || 0}</span></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}
      </>)}
    </div>
  );
}
