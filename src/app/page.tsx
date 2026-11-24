'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import PerspectiveCard from '@/components/PerspectiveCard';
import CustomDropdown from '@/components/CustomDropdown';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ArrowUpDown,
  Eye,
  ExternalLink,
  ChevronRight,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  Layers,
  Flame,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function CommandCenterPage() {
  const { t, lang } = useApp();
  const [analytics, setAnalytics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedReport(null);
      setIsClosing(false);
    }, 200);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, reportsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch(`/api/reports?search=${encodeURIComponent(searchTerm)}&status=${selectedStatus}&priority=${selectedPriority}`),
      ]);
      const analyticsData = await analyticsRes.json();
      const reportsData = await reportsRes.json();
      setAnalytics(analyticsData);
      setReports(reportsData.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('aidgrid_auth_active')) {
      window.location.href = '/login';
      return;
    }
    fetchData();
  }, [searchTerm, selectedStatus, selectedPriority]);

  const PRIORITY_COLORS: Record<string, string> = {
    CRITICAL: '#f43f5e',
    HIGH: '#f97316',
    MEDIUM: '#00d1ff',
    LOW: '#10b981',
  };

  const STATUS_BADGE_CLASSES: Record<string, string> = {
    SUBMITTED: 'bg-slate-800/60 text-slate-300 border-slate-700/60',
    VALIDATING: 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60',
    TRIAGED: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60',
    ASSIGNED: 'bg-blue-950/60 text-blue-300 border-blue-700/60',
    ACKNOWLEDGED: 'bg-sky-950/60 text-sky-300 border-sky-700/60',
    IN_PROGRESS: 'bg-sky-950/60 text-sky-300 border-sky-700/60',
    NEEDS_INFORMATION: 'bg-purple-950/60 text-purple-300 border-purple-700/60',
    RESOLVED: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60',
    CITIZEN_REVIEW: 'bg-teal-950/60 text-teal-300 border-teal-700/60',
    CLOSED: 'bg-slate-900/60 text-slate-400 border-slate-800/60',
    REOPENED: 'bg-rose-950/60 text-rose-300 border-rose-700/60',
    ESCALATED: 'bg-rose-900/70 text-rose-200 border-rose-600/70 font-bold animate-pulse',
    REJECTED: 'bg-gray-900/60 text-gray-500 border-gray-800/60',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Liquid Glass Pane) */}
      <div className="glass-pane glass-rim p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src="/images/aidgrid-emblem.png"
              alt="AIDGRID"
              className="h-4 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(0,209,255,0.4)]"
            />
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm">
              {t.nav.overview}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Enterprise Civic Operations Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Dhaka Civic Operations Command Center
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse hidden sm:inline" />
          </h1>
          <p className="text-slate-300/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Real-time multi-department monitoring, A02 priority intelligence, and accountable resolution pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl jellyfish-interactive bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/citizen"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-jellyfish font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20"
          >
            <span>+ Report Issue</span>
          </Link>
        </div>
      </div>

      {/* 3D Perspective Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reports */}
        <PerspectiveCard className="p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t.dashboard.totalReports}
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {analytics?.summary?.total ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 pt-2 border-t border-white/5">
            <span className="text-cyan-400 font-bold">{analytics?.summary?.activeIssues ?? 0}</span> active in pipeline
          </div>
        </PerspectiveCard>

        {/* Card 2: Critical & High Priority */}
        <PerspectiveCard className="p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
              {t.dashboard.criticalHigh}
            </span>
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30">
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 tracking-tight">
            {analytics?.summary?.criticalHigh ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 pt-2 border-t border-white/5">
            Urgent public safety hazards
          </div>
        </PerspectiveCard>

        {/* Card 3: In Progress & Field Dispatch */}
        <PerspectiveCard className="p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              {t.dashboard.inProgress}
            </span>
            <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30">
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-sky-400 tracking-tight">
            {analytics?.summary?.inProgress ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 pt-2 border-t border-white/5">
            Field technicians on site
          </div>
        </PerspectiveCard>

        {/* Card 4: SLA Compliance Rate */}
        <PerspectiveCard className="p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              {t.dashboard.slaCompliance}
            </span>
            <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/30">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-400 tracking-tight">
            {analytics?.summary?.slaCompliance ?? '100'}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 pt-2 border-t border-white/5">
            <span className="text-rose-400 font-bold">{analytics?.summary?.overdueSla ?? 0}</span> breached deadline
          </div>
        </PerspectiveCard>
      </div>

      {/* Analytics Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Category Distribution */}
        <div className="lg:col-span-2 glass-pane glass-rim p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Reports by Issue Category
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  REAL-TIME
                </span>
              </h2>
              <p className="text-xs text-slate-400">Distribution across municipal pilot sectors</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {analytics?.categoryDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis hide={true} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        const count = Number(payload[0].value) || 0;
                        const total = analytics?.categoryDistribution?.reduce((acc: number, c: any) => acc + (Number(c.count) || 0), 0) || 1;
                        const rate = ((count / total) * 100).toFixed(1);

                        return (
                          <div className="glass-pane glass-rim p-3.5 rounded-2xl shadow-2xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-xl text-left pointer-events-none z-50">
                            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-1">
                              Sector / Category
                            </div>
                            <div className="text-xs font-bold text-white mb-2 max-w-[210px] leading-snug">
                              {item.name}
                            </div>
                            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-white/10 text-xs">
                              <span className="text-slate-400">Total Volume:</span>
                              <span className="font-mono font-bold text-cyan-300">{count} issues</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-xs mt-1">
                              <span className="text-slate-400">Sector Rate:</span>
                              <span className="font-mono font-bold text-emerald-400">{rate}% of total</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="url(#cyanTealGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="cyanTealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d1ff" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading analytics data...
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Priority Breakdown Pie */}
        <div className="glass-pane glass-rim p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              A02 Priority Tiers
            </h2>
            <p className="text-xs text-slate-400">Calculated by Explainable Engine</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center my-2">
            {analytics?.priorityBreakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Critical', value: analytics.priorityBreakdown.critical, color: '#f43f5e' },
                      { name: 'High', value: analytics.priorityBreakdown.high, color: '#f97316' },
                      { name: 'Medium', value: analytics.priorityBreakdown.medium, color: '#00d1ff' },
                      { name: 'Low', value: analytics.priorityBreakdown.low, color: '#10b981' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { color: '#f43f5e' },
                      { color: '#f97316' },
                      { color: '#00d1ff' },
                      { color: '#10b981' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="glass-pane glass-rim px-3.5 py-2 rounded-xl shadow-2xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-xl text-left pointer-events-none z-50">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Priority Level
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.payload?.color || '#00d1ff' }} />
                              <span className="text-xs font-black text-white">{item.name}:</span>
                              <span className="text-xs font-mono font-bold text-cyan-300">{item.value} issues</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
              <span className="text-slate-300 font-medium">Critical ({analytics?.priorityBreakdown?.critical ?? 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span>
              <span className="text-slate-300 font-medium">High ({analytics?.priorityBreakdown?.high ?? 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
              <span className="text-slate-300 font-medium">Medium ({analytics?.priorityBreakdown?.medium ?? 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              <span className="text-slate-300 font-medium">Low ({analytics?.priorityBreakdown?.low ?? 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Reports Table Section (Liquid Glass Table Pane) */}
      <div className="glass-pane glass-rim rounded-3xl overflow-hidden shadow-2xl">
        {/* Table Filter Controls */}
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.dashboard.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="w-44">
              <CustomDropdown
                options={[
                  { value: '', label: `${t.dashboard.quickFilter} (All)` },
                  { value: 'SUBMITTED', label: 'SUBMITTED' },
                  { value: 'TRIAGED', label: 'TRIAGED' },
                  { value: 'ASSIGNED', label: 'ASSIGNED' },
                  { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
                  { value: 'CITIZEN_REVIEW', label: 'CITIZEN_REVIEW' },
                  { value: 'RESOLVED', label: 'RESOLVED' },
                  { value: 'CLOSED', label: 'CLOSED' },
                  { value: 'ESCALATED', label: 'ESCALATED' },
                  { value: 'REOPENED', label: 'REOPENED' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
              />
            </div>

            {/* Priority Filter */}
            <div className="w-48">
              <CustomDropdown
                options={[
                  { value: '', label: t.dashboard.allPriorities },
                  { value: 'CRITICAL', label: 'Critical (80-100)' },
                  { value: 'HIGH', label: 'High (60-79)' },
                  { value: 'MEDIUM', label: 'Medium (35-59)' },
                  { value: 'LOW', label: 'Low (0-34)' },
                ]}
                value={selectedPriority}
                onChange={setSelectedPriority}
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 text-slate-400 font-black uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Ref Number</th>
                <th className="py-3.5 px-4">Issue Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Zone & Coordinates</th>
                <th className="py-3.5 px-4">A02 Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Team</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No reports match the current filter criteria.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-white/[0.04] transition-all group cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {report.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                        {report.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {report.address}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-semibold">
                        {lang === 'bn' ? report.category?.nameBn || report.category?.name : report.category?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[130px]">{report.serviceZone?.name || 'Dhaka Zone'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm"
                          style={{
                            backgroundColor: `${PRIORITY_COLORS[report.priority]}18`,
                            color: PRIORITY_COLORS[report.priority],
                            borderColor: `${PRIORITY_COLORS[report.priority]}40`,
                            borderWidth: 1,
                          }}
                        >
                          {report.priority} ({report.priorityScore?.toFixed(0)})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                          STATUS_BADGE_CLASSES[report.status] || 'bg-white/5 text-slate-300'
                        }`}
                      >
                        {t.status[report.status as keyof typeof t.status] || report.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                      {report.assignments?.[0]?.team?.name ? (
                        <span className="text-teal-300 font-semibold truncate block max-w-[140px]">
                          {report.assignments[0].team.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 transition-colors"
                        title="View Report Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Drawer (Liquid Frosted Glass Sheet) */}
      {selectedReport && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`glass-pane-chrome glass-rim rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-left relative border border-cyan-500/30 ${
              isClosing ? 'modal-pop-out' : 'modal-pop-in'
            }`}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 shadow-sm">
                {selectedReport.referenceNumber}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  STATUS_BADGE_CLASSES[selectedReport.status] || ''
                }`}
              >
                {selectedReport.status}
              </span>
            </div>

            <h2 className="text-xl font-black text-white mb-2">
              {selectedReport.title}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {selectedReport.description}
            </p>

            {/* Evidence Photo */}
            {selectedReport.resolutionEvidenceUrl && (
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-400 block mb-1">
                  Resolution Evidence Photographic Proof:
                </span>
                <img
                  src={selectedReport.resolutionEvidenceUrl}
                  alt="Resolution Evidence"
                  className="rounded-2xl border border-white/10 h-44 w-full object-cover shadow-lg"
                />
              </div>
            )}

            {/* A02 Decision Breakdown Box */}
            <div className="glass-pane p-4 rounded-2xl mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> A02 Decision Breakdown
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  Score: {selectedReport.priorityScore?.toFixed(1)}/100 [{selectedReport.priority}]
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 pt-2 border-t border-white/10">
                <div>Safety: <span className="text-white font-bold">{selectedReport.safetyScore}</span></div>
                <div>Severity: <span className="text-white font-bold">{selectedReport.severityScore}</span></div>
                <div>People: <span className="text-white font-bold">{selectedReport.peopleScore}</span></div>
                <div>Location: <span className="text-white font-bold">{selectedReport.locationScore}</span></div>
                <div>SLA Pressure: <span className="text-white font-bold">{selectedReport.slaScore}</span></div>
                <div>Corroborations: <span className="text-teal-400 font-bold">{selectedReport.corroborationCount}</span></div>
              </div>
            </div>

            {/* Location & Department */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-black/20 p-3.5 rounded-2xl border border-white/10 mb-4">
              <div>
                <span className="text-slate-400 block text-[10px]">Department:</span>
                <span className="font-bold text-slate-200">{selectedReport.department?.name || 'Roads & Public Infra'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Zone:</span>
                <span className="font-bold text-slate-200">{selectedReport.serviceZone?.name || 'Dhaka Zone'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Address:</span>
                <span className="text-slate-200">{selectedReport.address} ({selectedReport.latitude?.toFixed(4)}, {selectedReport.longitude?.toFixed(4)})</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Link
                href="/workflow"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors border border-white/10"
              >
                Inspect Workflow Pipeline
              </Link>
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-navy-950 text-xs font-black transition-all hover:scale-105"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
