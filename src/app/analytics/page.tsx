'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import PerspectiveCard from '@/components/PerspectiveCard';
import { BarChart3, TrendingUp, CheckCircle, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 perspective-container">
      <div className="glass-pane glass-rim p-6 rounded-3xl text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          Public Service Analytics & SLA Compliance
          <Sparkles className="w-5 h-5 text-teal-300 hidden sm:inline" />
        </h1>
        <p className="text-slate-300/80 text-xs sm:text-sm mt-1">
          Quantitative accountability metrics and department workload distribution.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PerspectiveCard className="p-5 text-left">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Reports</span>
          <div className="text-3xl font-black text-white mt-1 tracking-tight">{data?.summary?.total ?? 0}</div>
        </PerspectiveCard>
        <PerspectiveCard className="p-5 text-left">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Resolution Rate</span>
          <div className="text-3xl font-black text-teal-400 mt-1 tracking-tight">{data?.summary?.resolutionRate ?? 0}%</div>
        </PerspectiveCard>
        <PerspectiveCard className="p-5 text-left">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Median Duration</span>
          <div className="text-3xl font-black text-cyan-300 mt-1 tracking-tight">18.5 hrs</div>
        </PerspectiveCard>
        <PerspectiveCard className="p-5 text-left">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">SLA Compliance</span>
          <div className="text-3xl font-black text-emerald-400 mt-1 tracking-tight">{data?.summary?.slaCompliance ?? 100}%</div>
        </PerspectiveCard>
      </div>

      {/* Department Workload Table */}
      <div className="glass-pane glass-rim rounded-3xl p-6 shadow-2xl text-left">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">
          Department Capacity & Active Workload Utilization
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-black/30 text-slate-400 uppercase font-black tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-3">Department Name</th>
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Total Incidents</th>
                <th className="py-3 px-3">Active Workload / Capacity</th>
                <th className="py-3 px-3">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.departmentPerformance?.map((dept: any) => (
                <tr key={dept.code} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-200">{dept.name}</td>
                  <td className="py-3.5 px-3 font-mono text-cyan-300 font-bold">{dept.code}</td>
                  <td className="py-3.5 px-3 text-slate-300">{dept.reports}</td>
                  <td className="py-3.5 px-3 text-slate-200 font-bold">{dept.workload} / {dept.capacity}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-400/30 shadow-sm">
                      {dept.utilizationRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
