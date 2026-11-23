'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
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
    fetchData();
  }, [searchTerm, selectedStatus, selectedPriority]);

  const PRIORITY_COLORS: Record<string, string> = {
    CRITICAL: '#f43f5e',
    HIGH: '#f97316',
    MEDIUM: '#06b6d4',
    LOW: '#10b981',
  };

  const STATUS_BADGE_CLASSES: Record<string, string> = {
    SUBMITTED: 'bg-slate-800 text-slate-300 border-slate-700',
    VALIDATING: 'bg-indigo-950/60 text-indigo-300 border-indigo-800',
    TRIAGED: 'bg-cyan-950/60 text-cyan-300 border-cyan-800',
    ASSIGNED: 'bg-blue-950/60 text-blue-300 border-blue-800',
    ACKNOWLEDGED: 'bg-sky-950/60 text-sky-300 border-sky-800',
    IN_PROGRESS: 'bg-amber-950/60 text-amber-300 border-amber-800',
    NEEDS_INFORMATION: 'bg-purple-950/60 text-purple-300 border-purple-800',
    RESOLVED: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
    CITIZEN_REVIEW: 'bg-teal-950/60 text-teal-300 border-teal-800',
    CLOSED: 'bg-slate-900 text-slate-400 border-slate-800',
    REOPENED: 'bg-rose-950/60 text-rose-300 border-rose-800',
    ESCALATED: 'bg-rose-900/80 text-rose-200 border-rose-700 font-bold animate-pulse',
    REJECTED: 'bg-gray-900 text-gray-500 border-gray-800',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 p-6 rounded-2xl border border-navy-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {t.nav.overview}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Enterprise Civic Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dhaka Civic Operations Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time multi-department monitoring, A02 priority intelligence, and accountable resolution pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/citizen"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-navy-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <span>+ Report Issue</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid (Derived from real DB) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reports */}
        <div className="bg-navy-900 border border-navy-800/80 rounded-xl p-4 shadow-sm hover:border-navy-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.totalReports}</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.summary?.total ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-cyan-400 font-bold">{analytics?.summary?.activeIssues ?? 0}</span> active in pipeline
          </div>
        </div>

        {/* Card 2: Critical & High Priority */}
        <div className="bg-navy-900 border border-navy-800/80 rounded-xl p-4 shadow-sm hover:border-navy-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.criticalHigh}</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {analytics?.summary?.criticalHigh ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Urgent public safety hazards
          </div>
        </div>

        {/* Card 3: In Progress & Field Dispatch */}
        <div className="bg-navy-900 border border-navy-800/80 rounded-xl p-4 shadow-sm hover:border-navy-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.inProgress}</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {analytics?.summary?.inProgress ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Field technicians on site
          </div>
        </div>

        {/* Card 4: SLA Compliance Rate */}
        <div className="bg-navy-900 border border-navy-800/80 rounded-xl p-4 shadow-sm hover:border-navy-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.slaCompliance}</span>
            <ShieldAlert className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">
            {analytics?.summary?.slaCompliance ?? '100'}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-rose-400 font-bold">{analytics?.summary?.overdueSla ?? 0}</span> breached SLA
          </div>
        </div>
      </div>

      {/* Analytics Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Category Distribution */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Reports by Issue Category
              </h2>
              <p className="text-xs text-slate-400">Distribution across municipal pilot sectors</p>
            </div>
            <span className="text-xs font-medium text-slate-400">Real-time DB</span>
          </div>

          <div className="h-64 w-full">
            {analytics?.categoryDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b132b', borderColor: '#1c2541', borderRadius: '0.5rem', fontSize: '12px' }}
                    itemStyle={{ color: '#00d1ff' }}
                  />
                  <Bar dataKey="count" fill="#00b4d8" radius={[4, 4, 0, 0]} />
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
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              A02 Priority Tiers
            </h2>
            <p className="text-xs text-slate-400">Calculated by Explainable Engine</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {analytics?.priorityBreakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Critical', value: analytics.priorityBreakdown.critical, color: '#f43f5e' },
                      { name: 'High', value: analytics.priorityBreakdown.high, color: '#f97316' },
                      { name: 'Medium', value: analytics.priorityBreakdown.medium, color: '#06b6d4' },
                      { name: 'Low', value: analytics.priorityBreakdown.low, color: '#10b981' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {[
                      { color: '#f43f5e' },
                      { color: '#f97316' },
                      { color: '#06b6d4' },
                      { color: '#10b981' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b132b', borderColor: '#1c2541', borderRadius: '0.5rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-navy-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Critical ({analytics?.priorityBreakdown?.critical ?? 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-slate-300">High ({analytics?.priorityBreakdown?.high ?? 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <span className="text-slate-300">Medium ({analytics?.priorityBreakdown?.medium ?? 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Low ({analytics?.priorityBreakdown?.low ?? 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Reports Table Section */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-lg">
        {/* Table Filter Controls */}
        <div className="p-4 border-b border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-navy-950/40">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.dashboard.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-navy-900 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-navy-900 border border-navy-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">{t.dashboard.quickFilter} (All)</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="TRIAGED">TRIAGED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CITIZEN_REVIEW">CITIZEN_REVIEW</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="ESCALATED">ESCALATED</option>
              <option value="REOPENED">REOPENED</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-navy-900 border border-navy-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">{t.dashboard.allPriorities}</option>
              <option value="CRITICAL">Critical (80-100)</option>
              <option value="HIGH">High (60-79)</option>
              <option value="MEDIUM">Medium (35-59)</option>
              <option value="LOW">Low (0-34)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 text-slate-400 font-bold uppercase tracking-wider border-b border-navy-800">
              <tr>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Issue Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Zone & Coordinates</th>
                <th className="py-3 px-4">A02 Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No reports match the current filter criteria.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-navy-850/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {report.referenceNumber}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                        {report.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {report.address}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-slate-300 text-[11px] font-medium">
                        {lang === 'bn' ? report.category?.nameBn || report.category?.name : report.category?.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[130px]">{report.serviceZone?.name || 'Dhaka Zone'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${PRIORITY_COLORS[report.priority]}15`,
                            color: PRIORITY_COLORS[report.priority],
                            borderColor: `${PRIORITY_COLORS[report.priority]}35`,
                            borderWidth: 1,
                          }}
                        >
                          {report.priority} ({report.priorityScore?.toFixed(0)})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                          STATUS_BADGE_CLASSES[report.status] || 'bg-navy-800 text-slate-300'
                        }`}
                      >
                        {t.status[report.status as keyof typeof t.status] || report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {report.assignments?.[0]?.team?.name ? (
                        <span className="text-teal-400 font-medium truncate block max-w-[140px]">
                          {report.assignments[0].team.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                        className="p-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-cyan-400 transition-colors"
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

      {/* Report Details Drawer / Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-left relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                {selectedReport.referenceNumber}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
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

            {/* Evidence Photo if present */}
            {selectedReport.resolutionEvidenceUrl && (
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-400 block mb-1">
                  Resolution Evidence Photographic Proof:
                </span>
                <img
                  src={selectedReport.resolutionEvidenceUrl}
                  alt="Resolution Evidence"
                  className="rounded-xl border border-navy-700 h-44 w-full object-cover"
                />
              </div>
            )}

            {/* A02 Decision Intelligence Breakdown Box */}
            <div className="bg-navy-950 rounded-xl p-4 border border-navy-800 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> A02 Decision Breakdown
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  Score: {selectedReport.priorityScore?.toFixed(1)}/100 [{selectedReport.priority}]
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 pt-2 border-t border-navy-800">
                <div>Safety: <span className="text-white font-bold">{selectedReport.safetyScore}</span></div>
                <div>Severity: <span className="text-white font-bold">{selectedReport.severityScore}</span></div>
                <div>People: <span className="text-white font-bold">{selectedReport.peopleScore}</span></div>
                <div>Location: <span className="text-white font-bold">{selectedReport.locationScore}</span></div>
                <div>SLA Pressure: <span className="text-white font-bold">{selectedReport.slaScore}</span></div>
                <div>Corroborations: <span className="text-teal-400 font-bold">{selectedReport.corroborationCount}</span></div>
              </div>
            </div>

            {/* Location & Department */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-navy-950/60 p-3 rounded-xl border border-navy-800/80 mb-4">
              <div>
                <span className="text-slate-400 block">Department:</span>
                <span className="font-semibold text-slate-200">{selectedReport.department?.name || 'Roads & Public Infra'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Zone:</span>
                <span className="font-semibold text-slate-200">{selectedReport.serviceZone?.name || 'Dhaka Zone'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Address:</span>
                <span className="text-slate-200">{selectedReport.address} ({selectedReport.latitude?.toFixed(4)}, {selectedReport.longitude?.toFixed(4)})</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy-800">
              <Link
                href="/workflow"
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Inspect Workflow Pipeline
              </Link>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 text-xs font-bold transition-colors"
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
