'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { MapPin, Filter, Layers, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { PILOT_ZONES } from '@/lib/constants';

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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 p-6 rounded-2xl border border-navy-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              GIS Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Dhaka Pilot Area Spatial Distribution
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Live Civic Infrastructure GIS Map
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Interactive geographical visualization of municipal hazards, active teams, and pilot service zones.
          </p>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedZone.code}
            onChange={(e) => {
              const z = PILOT_ZONES.find((x) => x.code === e.target.value);
              if (z) setSelectedZone(z);
            }}
            className="px-3.5 py-2 rounded-xl bg-navy-800 border border-navy-700 text-xs font-semibold text-slate-200"
          >
            {PILOT_ZONES.map((z) => (
              <option key={z.code} value={z.code}>
                {lang === 'bn' ? z.nameBn : z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map & Incident Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Left Column: Interactive Map Simulation & Pins */}
        <div className="lg:col-span-8 bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden relative shadow-xl flex flex-col">
          {/* Map Controls Header */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-navy-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-navy-700 text-xs text-slate-200 shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">{selectedZone.name}</span>
            <span className="text-slate-400">({selectedZone.centerLat}, {selectedZone.centerLng})</span>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-navy-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-navy-700 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ml-2"></span> High
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 ml-2"></span> Medium
          </div>

          {/* Graphical Map Canvas (Leaflet Map Tiles Simulator with Realistic Interactive Pin Grid) */}
          <div className="flex-1 w-full relative bg-[#0b132b] flex items-center justify-center p-8 overflow-hidden select-none">
            {/* Grid background representing city street grid */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(#00d1ff 1px, transparent 1px), radial-gradient(#1c2541 1px, #0b132b 1px)`,
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px',
              }}
            />

            {/* Service Zone Radius Overlay Circle */}
            <div className="absolute w-96 h-96 rounded-full border border-cyan-500/20 bg-cyan-500/5 animate-pulse flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold text-cyan-400/40 uppercase tracking-widest">
                {selectedZone.code} • 5.0 KM JURISDICTION
              </span>
            </div>

            {/* Interactive Incident Pins on Map */}
            {reports.map((rep, idx) => {
              // Distribute pseudo-pins around center
              const offsetLat = ((rep.latitude - selectedZone.centerLat) * 800) + (idx % 5 - 2) * 55;
              const offsetLng = ((rep.longitude - selectedZone.centerLng) * 800) + (idx % 4 - 2) * 65;
              const isSelected = activeReport?.id === rep.id;

              const pinColor =
                rep.priority === 'CRITICAL'
                  ? 'bg-rose-500 text-rose-100 ring-rose-400'
                  : rep.priority === 'HIGH'
                  ? 'bg-orange-500 text-orange-100 ring-orange-400'
                  : 'bg-cyan-500 text-cyan-950 ring-cyan-300';

              return (
                <div
                  key={rep.id}
                  style={{
                    transform: `translate(${offsetLng}px, ${offsetLat}px)`,
                  }}
                  onClick={() => setActiveReport(rep)}
                  className={`absolute cursor-pointer transition-all hover:scale-125 z-10 ${
                    isSelected ? 'scale-125 ring-4 ring-white z-30' : ''
                  }`}
                  title={`${rep.referenceNumber}: ${rep.title}`}
                >
                  <div className={`w-7 h-7 rounded-full ${pinColor} flex items-center justify-center font-bold text-[10px] shadow-lg shadow-black/50 ring-2`}>
                    !
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Clicked Pin Details / Active Zone Incident Feed */}
        <div className="lg:col-span-4 bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-navy-800 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
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
                  <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                    {activeReport.referenceNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    {activeReport.priority} ({activeReport.priorityScore?.toFixed(0)})
                  </span>
                </div>

                <h4 className="text-base font-bold text-white">
                  {activeReport.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeReport.description}
                </p>

                <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{activeReport.address}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-navy-800">
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
                    className="p-3 rounded-xl bg-navy-950 border border-navy-800 hover:border-navy-700 cursor-pointer text-left transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {r.referenceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{r.status}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {r.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-navy-800 text-[11px] text-slate-500 text-center">
            OpenStreetMap standard compatible GeoJSON pilot projection
          </div>
        </div>
      </div>
    </div>
  );
}
