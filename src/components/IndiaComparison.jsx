/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowRightLeft, ShieldAlert, Clock, ChevronRight, TrendingUp } from "lucide-react";

const COMPARISON_DATA = [
  {
    city: "Mumbai (Kalbadevi)",
    state: "Maharashtra",
    index: 94,
    delay: 14.5,
    obstruction: 88,
    verticalViolations: 2.2,
    fireLoad: "Extreme",
    annualIncidents: 112,
  },
  {
    city: "Delhi (Hauz Rani)",
    state: "Delhi NCR",
    index: 96,
    delay: 16.5,
    obstruction: 92,
    verticalViolations: 2.8,
    fireLoad: "Extreme",
    annualIncidents: 145,
  },
  {
    city: "Bengaluru (Chickpet)",
    state: "Karnataka",
    index: 88,
    delay: 12.8,
    obstruction: 84,
    verticalViolations: 1.8,
    fireLoad: "High",
    annualIncidents: 94,
  },
  {
    city: "Kolkata (Burrabazar)",
    state: "West Bengal",
    index: 91,
    delay: 13.5,
    obstruction: 89,
    verticalViolations: 1.9,
    fireLoad: "High",
    annualIncidents: 108,
  },
  {
    city: "Hyderabad (Old City)",
    state: "Telangana",
    index: 83,
    delay: 10.2,
    obstruction: 78,
    verticalViolations: 1.5,
    fireLoad: "Moderate",
    annualIncidents: 68,
  },
  {
    city: "Chennai (George Town)",
    state: "Tamil Nadu",
    index: 79,
    delay: 9.4,
    obstruction: 72,
    verticalViolations: 1.2,
    fireLoad: "Moderate",
    annualIncidents: 54,
  },
];

export default function IndiaComparison() {
  const [activeCity1, setActiveCity1] = useState("Delhi (Hauz Rani)");
  const [activeCity2, setActiveCity2] = useState("Mumbai (Kalbadevi)");

  const city1 = COMPARISON_DATA.find((c) => c.city === activeCity1) || COMPARISON_DATA[1];
  const city2 = COMPARISON_DATA.find((c) => c.city === activeCity2) || COMPARISON_DATA[0];

  const getFireColor = (score) => {
    if (score >= 90) return "text-[#EF4444]";
    if (score >= 80) return "text-[#F97316]";
    return "text-[#F59E0B]";
  };

  const getFireBg = (score) => {
    if (score >= 90) return "bg-[#EF4444]";
    if (score >= 80) return "bg-[#F97316]";
    return "bg-[#F59E0B]";
  };

  return (
    <div className="bg-[#0A0A0A] border border-zinc-900 p-6 md:p-8" id="india-comparison-panel">
      <div className="flex items-center gap-2 text-[#F97316] font-mono text-xs uppercase tracking-[0.2em] font-bold mb-2">
        <ArrowRightLeft className="w-4 h-4" />
        <span>National Benchmark Dashboard</span>
      </div>
      <h2 className="text-2xl font-black text-zinc-100 tracking-tight uppercase font-display mb-2">
        Cross-Metropolitan Risk Comparison
      </h2>
      <p className="text-zinc-400 text-xs md:text-sm max-w-2xl mb-8 font-light leading-relaxed">
        Compare urban stress indexes, infrastructure bottlenecks, and estimated emergency delay ratios across India&apos;s densest commercial clusters.
      </p>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Compare Region A (Base)</label>
          <select
            value={activeCity1}
            onChange={(e) => setActiveCity1(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 p-3 text-xs uppercase font-mono font-bold tracking-wider rounded-none outline-none focus:border-[#F97316]"
          >
            {COMPARISON_DATA.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.state.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Compare Region B (Target)</label>
          <select
            value={activeCity2}
            onChange={(e) => setActiveCity2(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 p-3 text-xs uppercase font-mono font-bold tracking-wider rounded-none outline-none focus:border-[#F97316]"
          >
            {COMPARISON_DATA.filter((c) => c.city !== activeCity1).map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.state.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Duel HUD Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Region A detail */}
        <div className="border border-zinc-900 p-5 bg-zinc-950/20 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute top-0 right-0 p-4 font-mono font-black text-6xl text-zinc-900/40 select-none">
            A
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
              {city1.state}
            </span>
            <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight font-display mb-4">
              {city1.city}
            </h3>

            <div className="space-y-5">
              {/* Index */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Fire Vulnerability Index</span>
                  <span className={`text-base font-black font-mono ${getFireColor(city1.index)}`}>{city1.index}/100</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-none overflow-hidden">
                  <div className={`h-full ${getFireBg(city1.index)}`} style={{ width: `${city1.index}%` }} />
                </div>
              </div>

              {/* Grid of stats */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/40 border border-zinc-900 p-3">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Emergency Ingress Delay</span>
                  <span className="text-sm font-black font-mono text-zinc-200 block mt-0.5">+{city1.delay} Min</span>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-900 p-3">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Narrow Streets %</span>
                  <span className="text-sm font-black font-mono text-zinc-200 block mt-0.5">{city1.obstruction}%</span>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-900 p-3">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Vertical Code Violations</span>
                  <span className="text-sm font-black font-mono text-zinc-200 block mt-0.5">+{city1.verticalViolations} Floors</span>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-900 p-3">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Fuel Fire Load Density</span>
                  <span className="text-sm font-black font-mono text-[#EF4444] block mt-0.5 uppercase">{city1.fireLoad}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-900/60 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>EST. HIGH-DENSITY INCIDENTS / YEAR</span>
            <span className="font-bold text-zinc-300">{city1.annualIncidents} Cases</span>
          </div>
        </div>

        {/* Region B detail */}
        <div className="border border-zinc-900 p-5 bg-zinc-950/20 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute top-0 right-0 p-4 font-mono font-black text-6xl text-zinc-900/40 select-none">
            B
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
              {city2.state}
            </span>
            <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight font-display mb-4">
              {city2.city}
            </h3>

            <div className="space-y-5">
              {/* Index */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Fire Vulnerability Index</span>
                  <span className={`text-base font-black font-mono ${getFireColor(city2.index)}`}>{city2.index}/100</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-none overflow-hidden">
                  <div className={`h-full ${getFireBg(city2.index)}`} style={{ width: `${city2.index}%` }} />
                </div>
              </div>

              {/* Grid of stats */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/40 border border-zinc-900 p-3">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Emergency Ingress Delay</span>
                  <span className="text-sm font-black font-mono text-zinc-200 block mt-0.5">+{city2.delay} Min</span>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-900 p-3">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Narrow Streets %</span>
                  <span className="text-sm font-black font-mono text-zinc-200 block mt-0.5">{city2.obstruction}%</span>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-900 p-3">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Vertical Code Violations</span>
                  <span className="text-sm font-black font-mono text-zinc-200 block mt-0.5">+{city2.verticalViolations} Floors</span>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-900 p-3">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Fuel Fire Load Density</span>
                  <span className="text-sm font-black font-mono text-[#EF4444] block mt-0.5 uppercase">{city2.fireLoad}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-900/60 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>EST. HIGH-DENSITY INCIDENTS / YEAR</span>
            <span className="font-bold text-zinc-300">{city2.annualIncidents} Cases</span>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="mt-8 border border-zinc-900 overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-400 font-mono">
          <thead className="bg-zinc-950 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-900">
            <tr>
              <th className="p-4">CLUSTER LOCATION</th>
              <th className="p-4">RISK SCORE</th>
              <th className="p-4">TENDER DELAY</th>
              <th className="p-4">NARROW STREETS</th>
              <th className="p-4">BLDG VIOLATIONS</th>
              <th className="p-4">ANNUAL ESTIMATED CASES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {COMPARISON_DATA.map((row) => (
              <tr key={row.city} className="hover:bg-zinc-950/40 transition-colors">
                <td className="p-4 font-black uppercase text-zinc-100">{row.city}</td>
                <td className="p-4">
                  <span className={`font-bold ${getFireColor(row.index)}`}>{row.index}/100</span>
                </td>
                <td className="p-4 text-zinc-300">+{row.delay} Min</td>
                <td className="p-4 text-zinc-300">{row.obstruction}%</td>
                <td className="p-4 text-zinc-300">+{row.verticalViolations} Floors</td>
                <td className="p-4 font-bold text-zinc-300">{row.annualIncidents} / yr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
