'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart3, TrendingUp, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 p-6 rounded-2xl border border-navy-800 shadow-xl text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Public Service Analytics & SLA Compliance
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Quantitative accountability metrics and department workload distribution.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl text-left">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Reports</span>
          <div className="text-2xl font-black text-white mt-1">{data?.summary?.total ?? 0}</div>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl text-left">
          <span className="text-xs text-slate-400 uppercase font-semibold">Resolution Rate</span>
          <div className="text-2xl font-black text-teal-400 mt-1">{data?.summary?.resolutionRate ?? 0}%</div>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl text-left">
          <span className="text-xs text-slate-400 uppercase font-semibold">Median Duration</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">18.5 hrs</div>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl text-left">
          <span className="text-xs text-slate-400 uppercase font-semibold">SLA Compliance</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{data?.summary?.slaCompliance ?? 100}%</div>
        </div>
      </div>

      {/* Department Workload Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-lg text-left">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Department Capacity & Active Workload Utilization
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-navy-950 text-slate-400 uppercase font-bold border-b border-navy-800">
              <tr>
                <th className="py-2.5 px-3">Department Name</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Total Incidents</th>
                <th className="py-2.5 px-3">Active Workload / Capacity</th>
                <th className="py-2.5 px-3">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {data?.departmentPerformance?.map((dept: any) => (
                <tr key={dept.code} className="hover:bg-navy-850">
                  <td className="py-3 px-3 font-semibold text-slate-200">{dept.name}</td>
                  <td className="py-3 px-3 font-mono text-cyan-400">{dept.code}</td>
                  <td className="py-3 px-3 text-slate-300">{dept.reports}</td>
                  <td className="py-3 px-3 text-slate-300 font-bold">{dept.workload} / {dept.capacity}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">
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
