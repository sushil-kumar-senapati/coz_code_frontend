import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMpDashboard, getMpClusters, getMpDecisions, decideMpCluster, getMpClusterDetail } from '../api/client';
import { ChartBar, HourglassHigh, CheckCircle, XCircle, Wallet, TrendUp, UsersThree, Buildings, Eye, Microphone, Image as ImageIcon, TextT, Clock, MapPin, Lightning, Gauge, Ranking, UserCircle } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (n) => { if (!n) return '₹0'; n = Number(n); if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`; if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`; return `₹${n.toLocaleString('en-IN')}`; };

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

function ExpandableText({ text, maxLen = 80 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= maxLen) return <span>{text}</span>;
  return (
    <span>
      {expanded ? text : text.slice(0, maxLen)}
      <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', marginLeft: 4, padding: 0 }}>
        {expanded ? '▲ Show less' : '▼ View more'}
      </button>
    </span>
  );
}

export default function MpDashboard() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [viewCluster, setViewCluster] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewLang, setViewLang] = useState('english');
  const [activeTab, setActiveTab] = useState('overview');
  const [filterCategory, setFilterCategory] = useState('');

  const load = async () => {
    try {
      const [d, c, dec] = await Promise.all([getMpDashboard(), getMpClusters(), getMpDecisions()]);
      setDashboard(d); setClusters(c); setDecisions(dec);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDecision = (cluster, type) => { setModal({ cluster, type }); setReason(''); setAmount(type === 'approve' ? String(cluster.estimated_cost || 500000) : ''); };
  const handleViewSubmissions = async (cluster) => { setViewLoading(true); try { setViewCluster(await getMpClusterDetail(cluster.id)); } catch (e) { console.error(e); } setViewLoading(false); };
  const confirmDecision = async () => {
    if (!reason.trim() || reason.length < 10) return;
    setDeciding(true);
    try { await decideMpCluster(modal.cluster.id, { decision: modal.type === 'approve' ? 'approved' : 'rejected', reason, allocated_amount: modal.type === 'approve' ? parseFloat(amount) : null }); setModal(null); await load(); } catch (e) { console.error(e); }
    setDeciding(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>{t('common.loading')}</div>;

  const kpis = dashboard?.cluster_kpis || {};
  const budget = dashboard?.budget || {};
  const categoryStats = (dashboard?.category_stats || []).map(c => ({ ...c, color: SECTOR_COLORS[c.category] || '#6366f1', shortName: SECTOR_SHORT[c.category] || c.category }));
  const yearlyTrends = dashboard?.yearly_trends || [];
  const localityStats = dashboard?.locality_stats || [];
  const topSubmitters = dashboard?.top_submitters || [];
  const submissionTrend = dashboard?.submission_trend || [];
  const scoreDistribution = dashboard?.score_distribution || [];
  const budgetByCategory = dashboard?.budget_by_category || [];
  const inputTypeStats = dashboard?.input_type_stats || [];
  const submissionStats = dashboard?.submission_stats || {};

  const totalBudget = Number(budget.total_budget) || 50000000;
  const allocated = Number(budget.total_allocated) || 0;
  const remaining = Number(budget.remaining) || totalBudget;
  const pct = Math.round((allocated / totalBudget) * 100);

  const pendingClusters = clusters.filter(c => ['scored', 'enriched', 'categorized'].includes(c.status));
  const filteredClusters = filterCategory ? clusters.filter(c => c.mplads_category_code === filterCategory) : clusters;

  const pieData = [
    { name: 'Approved', value: Number(kpis.approved) || 0, color: 'var(--success)' },
    { name: 'Pending', value: pendingClusters.length, color: 'var(--warning)' },
    { name: 'Rejected', value: Number(kpis.rejected) || 0, color: 'var(--danger)' },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('mp_dashboard.title')}</h1>
        <p className="page-subtitle">{dashboard?.mp_name || ''} — {dashboard?.constituency || ''} Constituency</p>
      </div>

      {/* ═══ TOP KPI ROW ═══ */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {[
          { icon: <ChartBar size={22} />, value: clusters.length, label: t('mp_dashboard.total_clusters'), cls: 'accent' },
          { icon: <HourglassHigh size={22} />, value: pendingClusters.length, label: t('mp_dashboard.pending_review'), cls: 'warning' },
          { icon: <CheckCircle size={22} />, value: Number(kpis.approved) || 0, label: t('mp_dashboard.approved'), cls: 'success' },
          { icon: <XCircle size={22} />, value: Number(kpis.rejected) || 0, label: t('mp_dashboard.rejected'), cls: 'danger' },
          { icon: <UsersThree size={22} />, value: dashboard?.citizen_count || 0, label: 'Total Citizens', cls: 'accent' },
          { icon: <MapPin size={22} />, value: dashboard?.pin_count || 0, label: 'PIN Codes', cls: 'info' },
          { icon: <Wallet size={22} />, value: fmt(remaining), label: 'Budget Left', cls: 'success' },
          { icon: <Lightning size={22} />, value: Number(kpis.avg_score || 0).toFixed(1), label: 'Avg Score', cls: 'accent' },
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
        {['overview', 'priorities', 'analytics', 'decisions'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: 'calc(var(--radius) - 2px)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-display)',
              background: activeTab === tab ? 'var(--accent)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
            {tab === 'overview' ? '📊 Overview' : tab === 'priorities' ? '🏆 Priorities' : tab === 'analytics' ? '📈 Analytics' : '📋 Decisions'}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === 'overview' && (<>
        <div className="grid-3" style={{ marginBottom: 24 }}>
          {/* Budget Gauge */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}><Wallet size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('mp_dashboard.budget_utilization')}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Allocated</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{pct}%</span>
            </div>
            <div className="budget-gauge"><div className="budget-gauge-fill" style={{ width: `${pct}%` }} /></div>
            <div className="budget-labels"><span>{fmt(allocated)}</span><span>{fmt(totalBudget)}</span></div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Remaining</span><br /><strong style={{ color: 'var(--success)', fontFamily: 'var(--font-display)' }}>{fmt(remaining)}</strong></div>
              <div style={{ textAlign: 'right' }}><span style={{ color: 'var(--text-muted)' }}>FY {budget.financial_year || 'Current'}</span><br /><strong style={{ fontFamily: 'var(--font-display)' }}>{fmt(totalBudget)}</strong></div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>{t('mp_dashboard.category_distribution')}</div>
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={categoryStats.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <YAxis type="category" dataKey="shortName" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>{categoryStats.slice(0, 6).map((c, i) => <Cell key={i} fill={c.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>{t('common.no_data')}</p>}
          </div>

          {/* Approval Pie */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>{t('mp_dashboard.approval_rate')}</div>
            {pieData.length > 0 ? (<>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={50} innerRadius={30} dataKey="value" paddingAngle={3} stroke="none">
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie><Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} /></PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                {pieData.map(d => <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-secondary)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} /> {d.name}: {d.value}</span>)}
              </div>
            </>) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>{t('common.no_data')}</p>}
          </div>
        </div>

        {/* Submission Stats Row */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">📥 Submission Types</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '12px 0' }}>
              {[
                { icon: <TextT size={20} />, val: Number(submissionStats.text_count) || 0, label: 'Text', color: '#3b82f6' },
                { icon: <Microphone size={20} />, val: Number(submissionStats.audio_count) || 0, label: 'Audio', color: '#ef4444' },
                { icon: <ImageIcon size={20} />, val: Number(submissionStats.image_count) || 0, label: 'Image', color: '#22c55e' },
                { icon: <Lightning size={20} />, val: Number(submissionStats.multi_count) || 0, label: 'Multi', color: '#f97316' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ color: s.color, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem' }}>{s.val}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Distribution */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">🎯 Score Distribution</h3></div>
            {scoreDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="score_range" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>No scored clusters yet</p>}
          </div>
        </div>

        {/* Financial Year Trend */}
        {yearlyTrends.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h3 className="card-title"><TrendUp size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('mp_dashboard.financial_year_trend')}</h3></div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={yearlyTrends.map(y => ({ ...y, allocated: Number(y.allocated), spent: Number(y.spent) }))}>
                <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="financial_year" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 10000000).toFixed(0)}Cr`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} formatter={v => fmt(v)} />
                <Area type="monotone" dataKey="allocated" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} name="Allocated" />
                <Area type="monotone" dataKey="spent" stroke="#22c55e" fill="rgba(34,197,94,0.1)" strokeWidth={2} name="Spent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Submission Trend */}
        {submissionTrend.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h3 className="card-title">📈 Daily Submissions (Last 30 Days)</h3></div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={submissionTrend.map(d => ({ ...d, date: d.date?.slice(5) }))}>
                <defs><linearGradient id="subTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.3} /><stop offset="100%" stopColor="#f97316" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="count" stroke="#f97316" fill="url(#subTrend)" strokeWidth={2} name="Submissions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </>)}

      {/* ═══ PRIORITIES TAB ═══ */}
      {activeTab === 'priorities' && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <h3 className="card-title">{t('mp_dashboard.ranked_priorities')}</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {pendingClusters.length > 0 && <span className="badge badge-warning">{pendingClusters.length} pending</span>}
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                <option value="">All Categories</option>
                {Object.entries(SECTOR_SHORT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          {filteredClusters.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>{t('common.no_data')}</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Rank</th><th>Issue</th><th>Sector</th><th><UsersThree size={14} /> People</th><th>Score</th><th>Est. Cost</th><th>Location</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredClusters.map(cl => {
                    const score = cl.priority_score || cl.priority_score_10;
                    return (
                      <tr key={cl.id}>
                        <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: cl.rank && cl.rank <= 3 ? 'var(--accent)' : 'var(--text-secondary)' }}>#{cl.rank || '-'}</span></td>
                        <td style={{ maxWidth: 300 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}><ExpandableText text={cl.representative_text} maxLen={80} /></div>
                          {cl.score_explanation && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}><ExpandableText text={cl.score_explanation} maxLen={100} /></div>}
                        </td>
                        <td><span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{SECTOR_SHORT[cl.mplads_category_code] || cl.mplads_category_code}</span></td>
                        <td style={{ fontWeight: 600 }}>{cl.unique_users || 1}</td>
                        <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: score >= 7 ? 'var(--success)' : score >= 5 ? 'var(--warning)' : 'var(--text-muted)' }}>{score ? Number(score).toFixed(1) : '-'}</span></td>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem' }}>{cl.estimated_cost ? fmt(cl.estimated_cost) : '-'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cl.district}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleViewSubmissions(cl)} disabled={viewLoading}><Eye size={14} /></button>
                            {['scored', 'enriched', 'categorized'].includes(cl.status) && (<>
                              <button className="btn btn-success btn-sm" onClick={() => handleDecision(cl, 'approve')}>✓</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDecision(cl, 'reject')}>✕</button>
                            </>)}
                            {cl.status === 'closed' && <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>Closed</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ ANALYTICS TAB ═══ */}
      {activeTab === 'analytics' && (<>
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Top Localities */}
          <div className="card">
            <div className="card-header"><h3 className="card-title"><MapPin size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Top Localities</h3></div>
            {localityStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, Math.min(localityStats.length, 10) * 30)}>
                <BarChart data={localityStats.slice(0, 10).map(l => ({ ...l, name: l.locality || l.pin_code }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} width={100} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="issue_count" name="Issues" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>No locality data</p>}
          </div>

          {/* Citizens per Category */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">👥 Citizens per Category</h3></div>
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, categoryStats.length * 30)}>
                <BarChart data={categoryStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis type="category" dataKey="shortName" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="people" name="Citizens" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>No data</p>}
          </div>
        </div>

        {/* Category Performance Table */}
        {categoryStats.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h3 className="card-title">📊 Category Performance</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Category</th><th>Issues</th><th>Citizens</th><th>Avg Score</th><th>Approved</th><th>Rejected</th><th>Est. Cost</th></tr></thead>
                <tbody>
                  {categoryStats.map((c, i) => (
                    <tr key={i}>
                      <td><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: c.color, marginRight: 8 }} />{c.shortName}</td>
                      <td style={{ fontWeight: 600 }}>{c.count}</td>
                      <td>{Number(c.people) || 0}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: Number(c.avg_score) >= 7 ? 'var(--success)' : 'var(--text-muted)' }}>{c.avg_score || '-'}</td>
                      <td><span className="badge badge-success">{Number(c.approved_count) || 0}</span></td>
                      <td><span className="badge badge-danger">{Number(c.rejected_count) || 0}</span></td>
                      <td style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>{c.total_estimated_cost ? fmt(c.total_estimated_cost) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Budget by Category + Top Submitters */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {budgetByCategory.length > 0 && (
            <div className="card">
              <div className="card-header"><h3 className="card-title">💰 Budget Allocation by Category</h3></div>
              <ResponsiveContainer width="100%" height={Math.max(160, budgetByCategory.length * 30)}>
                <BarChart data={budgetByCategory.map(b => ({ ...b, shortName: SECTOR_SHORT[b.category] || b.category, allocated: Number(b.allocated) }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => fmt(v)} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                  <YAxis type="category" dataKey="shortName" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} formatter={v => fmt(v)} />
                  <Bar dataKey="allocated" name="Allocated" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {topSubmitters.length > 0 && (
            <div className="card">
              <div className="card-header"><h3 className="card-title"><UserCircle size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Most Active Citizens</h3></div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>#</th><th>Name</th><th>City</th><th>Issues</th></tr></thead>
                  <tbody>
                    {topSubmitters.slice(0, 8).map((s, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: i < 3 ? 'var(--accent)' : 'var(--text-muted)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{s.name || 'Anonymous'}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.home_city}</td>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.constituency_submissions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Locality Table */}
        {localityStats.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">📍 Locality-wise Breakdown</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Locality</th><th>PIN Code</th><th>District</th><th>Issues</th><th>Citizens</th></tr></thead>
                <tbody>{localityStats.map((l, i) => (<tr key={i}><td style={{ fontWeight: 600 }}>{l.locality || 'Unknown'}</td><td style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{l.pin_code}</td><td style={{ fontSize: '0.85rem' }}>{l.district}</td><td style={{ fontWeight: 600 }}>{l.issue_count}</td><td>{l.people}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}
      </>)}

      {/* ═══ DECISIONS TAB ═══ */}
      {activeTab === 'decisions' && decisions.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">{t('mp_dashboard.recent_decisions')} ({decisions.length})</h3></div>
          {decisions.map(d => (
            <div key={d.id} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border-light)', alignItems: 'flex-start' }}>
              <div className={`stat-icon ${d.decision === 'approved' ? 'success' : 'danger'}`} style={{ marginBottom: 0 }}>
                {d.decision === 'approved' ? <CheckCircle size={22} /> : <XCircle size={22} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}><ExpandableText text={d.representative_text} maxLen={80} /></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.reason}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  {d.mplads_category_code && <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{SECTOR_SHORT[d.mplads_category_code] || d.mplads_category_code}</span>}
                  {d.unique_users && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👥 {d.unique_users}</span>}
                </div>
                {d.allocated_amount && <div style={{ marginTop: 4, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--success)' }}>{fmt(d.allocated_amount)}</div>}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.decided_at?.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ VIEW SUBMISSIONS MODAL ═══ */}
      <AnimatePresence>
        {viewCluster && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewCluster(null)}>
            <motion.div className="modal" style={{ maxWidth: 700, maxHeight: '85vh', overflow: 'auto' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Citizen Submissions ({viewCluster.submissions?.length || 0})</h2>
              {/* Language Toggle */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: 'var(--bg-input)', padding: 3, borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
                <button onClick={() => setViewLang('english')} style={{ padding: '6px 14px', borderRadius: 'calc(var(--radius-sm) - 1px)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                  background: viewLang === 'english' ? 'var(--accent)' : 'transparent', color: viewLang === 'english' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  🇬🇧 English
                </button>
                <button onClick={() => setViewLang('native')} style={{ padding: '6px 14px', borderRadius: 'calc(var(--radius-sm) - 1px)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                  background: viewLang === 'native' ? 'var(--accent)' : 'transparent', color: viewLang === 'native' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  🇮🇳 Native Language
                </button>
                <button onClick={() => setViewLang('both')} style={{ padding: '6px 14px', borderRadius: 'calc(var(--radius-sm) - 1px)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                  background: viewLang === 'both' ? 'var(--accent)' : 'transparent', color: viewLang === 'both' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  Both
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>{viewCluster.representative_text}</p>
              {viewCluster.score && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16, padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius)' }}>
                  {[['Demand', viewCluster.score.normalized_demand], ['Severity', viewCluster.score.normalized_severity], ['Vulnerability', viewCluster.score.normalized_vulnerability], ['Infra Gap', viewCluster.score.normalized_infra_gap], ['Feasibility', viewCluster.score.normalized_feasibility], ['Recency', viewCluster.score.normalized_recency], ['Hist Bias', viewCluster.score.normalized_hist_bias]].map(([label, val]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: Number(val) >= 0.7 ? 'var(--success)' : Number(val) >= 0.4 ? 'var(--warning)' : 'var(--text-muted)' }}>{Number(val)?.toFixed(2) || '-'}</div>
                    </div>
                  ))}
                </div>
              )}
              {(viewCluster.submissions || []).map((sub, idx) => (
                <div key={idx} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 12, background: 'var(--bg-input)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div><strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{sub.tracking_id}</strong><span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {sub.user_name}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}><Clock size={14} /> {sub.created_at?.slice(0, 16).replace('T', ' ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <span className="badge badge-accent">{sub.input_type}</span>
                    <span className="badge badge-neutral">{sub.sub_city || sub.sub_district}</span>
                    <span className="badge badge-neutral">PIN: {sub.submission_pin_code}</span>
                  </div>
                  {/* Text content — controlled by language toggle */}
                  {(viewLang === 'native' || viewLang === 'both') && sub.raw_text && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: 2 }}><TextT size={12} /> Original ({sub.raw_language || 'native'}):</div>
                      <div style={{ fontSize: '0.9rem', padding: 8, background: 'var(--bg-card)', borderRadius: 6 }}>{sub.raw_text}</div>
                    </div>
                  )}
                  {(viewLang === 'native' || viewLang === 'both') && sub.original_text && sub.original_text !== sub.raw_text && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: 2 }}>📝 Extracted Text (Native):</div>
                      <div style={{ fontSize: '0.9rem', padding: 8, background: 'var(--bg-card)', borderRadius: 6 }}>{sub.original_text}</div>
                    </div>
                  )}
                  {(viewLang === 'english' || viewLang === 'both') && sub.translated_text_en && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: 2 }}>🇬🇧 English Translation:</div>
                      <div style={{ fontSize: '0.9rem', padding: 8, background: 'var(--success-bg)', borderRadius: 6, color: 'var(--text-primary)' }}>{sub.translated_text_en}</div>
                    </div>
                  )}
                  {sub.media?.map((m, mi) => (
                    <div key={mi} style={{ marginTop: 8 }}>
                      {m.media_type === 'audio' && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}><Microphone size={12} /> Audio:</div><audio controls style={{ width: '100%', borderRadius: 8 }}><source src={`http://localhost:8000${m.file_url}`} type={m.mime_type} /></audio></div>}
                      {m.media_type === 'image' && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}><ImageIcon size={12} /> Image:</div><img src={`http://localhost:8000${m.file_url}`} alt="Submission" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' }} /></div>}
                    </div>
                  ))}
                </div>
              ))}
              <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setViewCluster(null)}>Close</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ DECISION MODAL ═══ */}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">{modal.type === 'approve' ? '✅ Approve Issue' : '❌ Reject Issue'}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}><strong>#{modal.cluster.rank}:</strong> <ExpandableText text={modal.cluster.representative_text} maxLen={120} /></p>
              {modal.type === 'approve' && <div className="form-group"><label className="form-label">Allocated Amount (₹)</label><input type="number" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} /></div>}
              <div className="form-group"><label className="form-label">Reason * (min 10 characters)</label><textarea className="form-input" placeholder="Explain your decision..." value={reason} onChange={e => setReason(e.target.value)} rows={4} /></div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className={`btn ${modal.type === 'approve' ? 'btn-success' : 'btn-danger'}`} onClick={confirmDecision} disabled={deciding || reason.length < 10}>{deciding ? 'Processing...' : 'Confirm'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
