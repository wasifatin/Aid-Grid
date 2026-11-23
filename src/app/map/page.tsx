'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { MapPin, Filter, Layers, AlertCircle, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { PILOT_ZONES } from '@/lib/constants';
import CustomDropdown from '@/components/CustomDropdown';

export default function LiveMapPage() {
  const { t, lang } = useApp();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<any>(PILOT_ZONES[0]);
  const [activeReport, setActiveReport] = useState<any>(null);

  useEffect(() => {
    fetch('/api/reports?limit=100')
      .then((res) => res.json())
      .then((data) => setReports(data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 perspective-container">
      {/* Top Banner */}
      <div className="glass-pane glass-rim p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/40 shadow-sm">
              GIS Spatial Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Dhaka Pilot Area Spatial Projection
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Live Civic Infrastructure GIS Map
            <Sparkles className="w-5 h-5 text-teal-300 hidden sm:inline" />
          </h1>
          <p className="text-slate-300/80 text-xs sm:text-sm mt-1">
            Interactive geographical visualization of municipal hazards, active teams, and pilot service zones.
          </p>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2 min-w-[280px]">
          <CustomDropdown
            options={PILOT_ZONES.map((z) => ({
              value: z.code,
              label: lang === 'bn' ? z.nameBn : z.name,
              sublabel: `${z.code} • Pilot Zone`,
            }))}
            value={selectedZone.code}
            onChange={(val) => {
              const z = PILOT_ZONES.find((x) => x.code === val);
              if (z) setSelectedZone(z);
            }}
            icon={<MapPin className="w-3.5 h-3.5 text-cyan-400" />}
          />
        </div>
      </div>

      {/* Main Map & Incident Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Left Column: Interactive Map Simulation */}
        <div className="lg:col-span-8 glass-pane glass-rim rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
          {/* Map Controls Header */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 glass-capsule px-4 py-2 text-xs text-slate-200 shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">{selectedZone.name}</span>
            <span className="text-slate-400">({selectedZone.centerLat}, {selectedZone.centerLng})</span>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 glass-capsule px-4 py-2 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span> Critical
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50 ml-2"></span> High
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 ml-2"></span> Medium
          </div>

          {/* Graphical Map Canvas */}
          <div className="flex-1 w-full relative bg-[#070b16] flex items-center justify-center p-8 overflow-hidden select-none">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(#00d1ff 1px, transparent 1px), radial-gradient(#1c2541 1px, #070b16 1px)`,
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px',
              }}
            />

            {/* Service Zone Radius Overlay Circle */}
            <div className="absolute w-[440px] h-[440px] rounded-full border border-cyan-400/25 bg-cyan-500/5 animate-pulse flex items-center justify-center shadow-inner">
              <span className="text-[10px] font-mono font-bold text-cyan-400/50 uppercase tracking-widest">
                {selectedZone.code} • 5.0 KM JURISDICTION
              </span>
            </div>

            {/* Interactive Incident Pins on Map */}
            {reports.map((rep, idx) => {
              const offsetLat = ((rep.latitude - selectedZone.centerLat) * 800) + (idx % 5 - 2) * 55;
              const offsetLng = ((rep.longitude - selectedZone.centerLng) * 800) + (idx % 4 - 2) * 65;
              const isSelected = activeReport?.id === rep.id;

              const pinColor =
                rep.priority === 'CRITICAL'
                  ? 'bg-rose-500 text-white shadow-rose-500/50'
                  : rep.priority === 'HIGH'
                  ? 'bg-orange-500 text-white shadow-orange-500/50'
                  : 'bg-cyan-400 text-navy-950 shadow-cyan-400/50';

              return (
                <div
                  key={rep.id}
                  style={{
                    transform: `translate(${offsetLng}px, ${offsetLat}px)`,
                  }}
                  onClick={() => setActiveReport(rep)}
                  className={`absolute cursor-pointer transition-all duration-300 hover:scale-125 z-10 ${
                    isSelected ? 'scale-125 ring-4 ring-white z-30' : ''
                  }`}
                  title={`${rep.referenceNumber}: ${rep.title}`}
                >
                  <div className={`w-8 h-8 rounded-full ${pinColor} flex items-center justify-center font-black text-[11px] shadow-lg border border-white/20`}>
                    !
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Clicked Pin Details */}
        <div className="lg:col-span-4 glass-pane glass-rim p-5 rounded-3xl shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                {activeReport ? 'Selected Incident Pin' : 'Zone Incident Queue'}
              </h3>
              {activeReport && (
                <button
                  onClick={() => setActiveReport(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {activeReport ? (
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40">
                    {activeReport.referenceNumber}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    {activeReport.priority} ({activeReport.priorityScore?.toFixed(0)})
                  </span>
                </div>

                <h4 className="text-base font-black text-white">
                  {activeReport.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeReport.description}
                </p>

                <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{activeReport.address}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1.5 border-t border-white/10">
                    <span>Coordinates:</span>
                    <span className="font-mono text-slate-200">
                      {activeReport.latitude?.toFixed(4)}, {activeReport.longitude?.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 mb-2">
                  Click any marker on the map to inspect live dispatch coordinates, SLA, and field status.
                </p>
                {reports.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setActiveReport(r)}
                    className="p-3.5 rounded-2xl bg-black/30 border border-white/5 hover:border-white/15 cursor-pointer text-left transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {r.referenceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">{r.status}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 line-clamp-1">
                      {r.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-slate-500 text-center font-medium">
            OpenStreetMap GeoJSON spatial projection
          </div>
        </div>
      </div>
    </div>
  );
}
