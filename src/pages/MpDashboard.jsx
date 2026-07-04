import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMpDashboard, getMpClusters, getMpDecisions, decideMpCluster, getMpClusterDetail } from '../api/client';
import { ChartBar, HourglassHigh, CheckCircle, XCircle, Wallet, TrendUp, UsersThree, Buildings, Warning, Eye, Microphone, Image as ImageIcon, TextT, Clock } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (n) => {
  if (!n) return '₹0';
  n = Number(n);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const SECTOR_COLORS = {
  ROADS_PATHWAYS_BRIDGES: '#f97316', EDUCATION: '#3b82f6', HEALTH: '#ef4444',
  DRINKING_WATER: '#06b6d4', SANITATION: '#22c55e', ELECTRICITY: '#eab308',
  SPORTS: '#8b5cf6', COMMUNITY_INFRASTRUCTURE: '#ec4899', IRRIGATION: '#6366f1',
  RAILWAYS: '#f43f5e', DISASTER_RELIEF: '#a855f7',
};

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

  const load = async () => {
    try {
      const [dashData, clustData, decData] = await Promise.all([
        getMpDashboard(), getMpClusters(), getMpDecisions(),
      ]);
      setDashboard(dashData);
      setClusters(clustData);
      setDecisions(decData);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDecision = (cluster, type) => {
    setModal({ cluster, type });
    setReason('');
    setAmount(type === 'approve' ? String(cluster.estimated_cost || 500000) : '');
  };

  const handleViewSubmissions = async (cluster) => {
    setViewLoading(true);
    try {
      const detail = await getMpClusterDetail(cluster.id);
      setViewCluster(detail);
    } catch (e) { console.error(e); }
    setViewLoading(false);
  };

  const confirmDecision = async () => {
    if (!reason.trim() || reason.length < 10) return;
    setDeciding(true);
    try {
      await decideMpCluster(modal.cluster.id, {
        decision: modal.type === 'approve' ? 'approved' : 'rejected',
        reason,
        allocated_amount: modal.type === 'approve' ? parseFloat(amount) : null,
        financial_year: '2026-27',
      });
      setModal(null);
      await load();
    } catch (e) { console.error(e); }
    setDeciding(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>{t('common.loading')}</div>;

  const kpis = dashboard?.cluster_kpis || {};
  const budget = dashboard?.budget || {};
  const categoryStats = (dashboard?.category_stats || []).map(c => ({ ...c, color: SECTOR_COLORS[c.category] || '#6366f1' }));
  const yearlyTrends = dashboard?.yearly_trends || [];

  const totalBudget = Number(budget.total_budget) || 50000000;
  const allocated = Number(budget.total_allocated) || 0;
  const remaining = Number(budget.remaining) || totalBudget;
  const pct = Math.round((allocated / totalBudget) * 100);

  const pendingClusters = clusters.filter(c => ['scored', 'enriched', 'categorized'].includes(c.status));
  const decidedClusters = clusters.filter(c => c.status === 'closed');

  const pieData = [
    { name: t('mp_dashboard.approved'), value: Number(kpis.approved) || decidedClusters.filter(c => decisions.some(d => d.cluster_id === c.id && d.decision === 'approved')).length || 0, color: 'var(--success)' },
    { name: t('mp_dashboard.pending_review'), value: pendingClusters.length, color: 'var(--warning)' },
    { name: t('mp_dashboard.rejected'), value: Number(kpis.rejected) || 0, color: 'var(--danger)' },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('mp_dashboard.title')}</h1>
        <p className="page-subtitle">{t('mp_dashboard.welcome')} — {dashboard?.constituency || 'Bhubaneswar'}</p>
      </div>

      {/* Top KPIs */}
      <div className="stats-grid">
        {[
          { icon: <ChartBar size={22} />, value: clusters.length, label: t('mp_dashboard.total_clusters'), cls: 'accent' },
          { icon: <HourglassHigh size={22} />, value: pendingClusters.length, label: t('mp_dashboard.pending_review'), cls: 'warning' },
          { icon: <CheckCircle size={22} />, value: Number(kpis.approved) || 0, label: t('mp_dashboard.approved'), cls: 'success' },
          { icon: <XCircle size={22} />, value: Number(kpis.rejected) || 0, label: t('mp_dashboard.rejected'), cls: 'danger' },
        ].map((s, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Budget + Approval */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}><Wallet size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('mp_dashboard.budget_utilization')}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('mp_dashboard.budget_allocated')}</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{pct}%</span>
          </div>
          <div className="budget-gauge"><div className="budget-gauge-fill" style={{ width: `${pct}%` }} /></div>
          <div className="budget-labels"><span>{fmt(allocated)}</span><span>{fmt(totalBudget)}</span></div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>{t('mp_dashboard.budget_remaining')}</span><br /><strong style={{ color: 'var(--success)', fontFamily: 'var(--font-display)' }}>{fmt(remaining)}</strong></div>
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
                <YAxis type="category" dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} width={90} tickFormatter={(v) => t(`sectors.${v}`, v)} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>{categoryStats.slice(0, 6).map((c, i) => <Cell key={i} fill={c.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>{t('common.no_data')}</p>}
        </div>

        {/* Approval Pie */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>{t('mp_dashboard.approval_rate')}</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={50} innerRadius={30} dataKey="value" paddingAngle={3} stroke="none">
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                {pieData.map((d) => (
                  <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} /> {d.name}: {d.value}
                  </span>
                ))}
              </div>
            </>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>{t('common.no_data')}</p>}
        </div>
      </div>

      {/* Financial Year Trend */}
      {yearlyTrends.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3 className="card-title"><TrendUp size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('mp_dashboard.financial_year_trend')}</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={yearlyTrends.map(y => ({ ...y, allocated: Number(y.allocated), spent: Number(y.spent) }))}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="financial_year" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v / 10000000).toFixed(0)}Cr`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} formatter={(v) => fmt(v)} />
              <Area type="monotone" dataKey="allocated" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} name="Allocated" />
              <Area type="monotone" dataKey="spent" stroke="#22c55e" fill="rgba(34,197,94,0.1)" strokeWidth={2} name="Spent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Ranked Priorities Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">{t('mp_dashboard.ranked_priorities')}</h3>
          {pendingClusters.length > 0 && <span className="badge badge-warning">{pendingClusters.length} {t('mp_dashboard.pending_review')}</span>}
        </div>
        {clusters.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>{t('common.no_data')}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('mp_dashboard.rank')}</th>
                  <th>{t('mp_dashboard.issue')}</th>
                  <th>{t('mp_dashboard.sector')}</th>
                  <th><UsersThree size={14} /> {t('mp_dashboard.people_count')}</th>
                  <th>{t('mp_dashboard.score')}</th>
                  <th>Est. Cost</th>
                  <th>{t('mp_dashboard.action')}</th>
                </tr>
              </thead>
              <tbody>
                {clusters.map((cl) => {
                  const rank = cl.rank;
                  const score = cl.priority_score || cl.priority_score_10;
                  return (
                    <tr key={cl.id}>
                      <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: rank && rank <= 3 ? 'var(--accent)' : 'var(--text-secondary)' }}>#{rank || '-'}</span></td>
                      <td style={{ maxWidth: 280 }}><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{(cl.representative_text || '').slice(0, 80)}...</div>
                        {cl.score_explanation && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{cl.score_explanation.slice(0, 120)}...</div>}
                      </td>
                      <td><span className="badge badge-accent">{t(`sectors.${cl.mplads_category_code}`, cl.mplads_category_code)}</span></td>
                      <td style={{ fontWeight: 600 }}>{cl.unique_users || 1}</td>
                      <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: score >= 7 ? 'var(--success)' : score >= 5 ? 'var(--warning)' : 'var(--text-muted)' }}>{score ? Number(score).toFixed(1) : '-'}</span></td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{cl.estimated_cost ? fmt(cl.estimated_cost) : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleViewSubmissions(cl)} disabled={viewLoading}>
                            <Eye size={14} /> View
                          </button>
                          {['scored', 'enriched', 'categorized'].includes(cl.status) && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleDecision(cl, 'approve')}>{t('mp_dashboard.approve')}</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDecision(cl, 'reject')}>{t('mp_dashboard.reject')}</button>
                            </>
                          )}
                          {cl.status === 'closed' && (
                            <span className="badge badge-neutral">{cl.status}</span>
                          )}
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

      {/* Recent Decisions */}
      {decisions.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">{t('mp_dashboard.recent_decisions')}</h3></div>
          {decisions.map((d) => (
            <div key={d.id} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border-light)', alignItems: 'flex-start' }}>
              <div className={`stat-icon ${d.decision === 'approved' ? 'success' : 'danger'}`} style={{ marginBottom: 0 }}>
                {d.decision === 'approved' ? <CheckCircle size={22} /> : <XCircle size={22} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.representative_text?.slice(0, 80)}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.reason}</div>
                {d.allocated_amount && <div style={{ marginTop: 4, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--success)' }}>{fmt(d.allocated_amount)}</div>}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.decided_at?.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      )}

      {/* View Submissions Modal */}
      <AnimatePresence>
        {viewCluster && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewCluster(null)}>
            <motion.div className="modal" style={{ maxWidth: 700, maxHeight: '85vh', overflow: 'auto' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Citizen Submissions ({viewCluster.submissions?.length || 0})</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>{viewCluster.representative_text}</p>

              {(viewCluster.submissions || []).map((sub, idx) => (
                <div key={idx} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 12, background: 'var(--bg-input)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{sub.tracking_id}</strong>
                      <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {sub.user_name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} /> {sub.created_at?.slice(0, 16).replace('T', ' ')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <span className="badge badge-accent">{sub.input_type}</span>
                    <span className="badge badge-neutral">{sub.sub_city || sub.sub_district}</span>
                    <span className="badge badge-neutral">PIN: {sub.submission_pin_code}</span>
                  </div>

                  {/* Original text */}
                  {sub.raw_text && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}><TextT size={12} /> Original Text ({sub.raw_language || 'en'}):</div>
                      <div style={{ fontSize: '0.9rem', padding: 8, background: 'var(--bg-card)', borderRadius: 6 }}>{sub.raw_text}</div>
                    </div>
                  )}

                  {/* Translated text */}
                  {sub.translated_text_en && sub.translated_text_en !== sub.raw_text && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: 2 }}>Translated (English):</div>
                      <div style={{ fontSize: '0.9rem', padding: 8, background: 'var(--success-bg)', borderRadius: 6, color: 'var(--text-primary)' }}>{sub.translated_text_en}</div>
                    </div>
                  )}

                  {/* Media files */}
                  {sub.media && sub.media.length > 0 && sub.media.map((m, mi) => (
                    <div key={mi} style={{ marginTop: 8 }}>
                      {m.media_type === 'audio' && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}><Microphone size={12} /> Audio Recording:</div>
                          <audio controls style={{ width: '100%', borderRadius: 8 }}>
                            <source src={`http://localhost:8000${m.file_url}`} type={m.mime_type} />
                          </audio>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.file_name} ({m.file_size_bytes ? (m.file_size_bytes / 1024).toFixed(0) + ' KB' : ''})</div>
                        </div>
                      )}
                      {m.media_type === 'image' && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}><ImageIcon size={12} /> Uploaded Image:</div>
                          <img src={`http://localhost:8000${m.file_url}`} alt="Submission" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.file_name}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setViewCluster(null)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decision Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">{modal.type === 'approve' ? t('mp_dashboard.approve_title') : t('mp_dashboard.reject_title')}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}><strong>#{modal.cluster.rank}:</strong> {modal.cluster.representative_text?.slice(0, 120)}</p>
              {modal.type === 'approve' && (
                <div className="form-group">
                  <label className="form-label">{t('mp_dashboard.amount_placeholder')}</label>
                  <input type="number" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Reason * (min 10 characters)</label>
                <textarea className="form-input" placeholder={t('mp_dashboard.reason_placeholder')} value={reason} onChange={(e) => setReason(e.target.value)} rows={4} />
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setModal(null)}>{t('mp_dashboard.cancel')}</button>
                <button className={`btn ${modal.type === 'approve' ? 'btn-success' : 'btn-danger'}`} onClick={confirmDecision} disabled={deciding || reason.length < 10}>
                  {deciding ? t('common.loading') : t('mp_dashboard.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
