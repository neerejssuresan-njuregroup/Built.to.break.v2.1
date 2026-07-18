/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  X, 
  ShieldAlert, 
  Scale, 
  Flame, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Activity,
  Zap,
  ZapOff,
  Maximize2,
  Clock,
  Eye,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ReferenceLine,
  BarChart,
  Bar
} from "recharts";

export default function ArchitecturalDiagramModal({ excerpt, onClose }) {
  if (!excerpt) return null;

  // Track specific interactive states for different diagrams
  const [laneWidth, setLaneWidth] = useState(1.5);
  const [overheadHazard, setOverheadHazard] = useState(true);
  const [layoutMode, setLayoutMode] = useState("illegal"); // "compliant" | "illegal"
  const [occupancyLoad, setOccupancyLoad] = useState(48);
  const [stairwellMaterial, setStairwellMaterial] = useState("plywood");
  const [circuitType, setCircuitType] = useState("fail-secure"); // "fail-safe" | "fail-secure"
  const [emergencyPowerCut, setEmergencyPowerCut] = useState(false);
  const [staffDelay, setStaffDelay] = useState(25);
  const [magnifierMarker, setMagnifierMarker] = useState(null);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);
  
  // State for BNS 105 culpability checklist
  const [culpabilityChecklist, setCulpabilityChecklist] = useState({
    lockedGates: true,
    singleStair: true,
    woodLining: true,
    basementKitchen: true,
  });

  // Calculate stats for Clause 4.8.2.3 material flammability
  const getMaterialStats = (mat) => {
    switch (mat) {
      case "polyurethane":
        return { name: "Polyurethane Foam", flashover: "18s", co: "2,400 ppm", speed: "11.2 m/s", hazard: "CLASS D (CRITICAL/TOXIC)" };
      case "plywood":
        return { name: "Untreated Plywood", flashover: "45s", co: "1,500 ppm", speed: "7.8 m/s", hazard: "CLASS D (HIGH CO BURN)" };
      case "acrylic":
        return { name: "Acrylic Sheets", flashover: "30s", co: "1,100 ppm", speed: "8.5 m/s", hazard: "CLASS D (ACRID DRIZZLE)" };
      case "gypsum":
        return { name: "Gypsum Board", flashover: "None", co: "120 ppm", speed: "0.8 m/s", hazard: "CLASS B (COMPLIANT)" };
      case "concrete":
        return { name: "Concrete / Slate Tiles", flashover: "None", co: "0 ppm", speed: "0.0 m/s", hazard: "CLASS A (NON-COMBUSTIBLE)" };
      default:
        return {};
    }
  };

  const activeMaterial = getMaterialStats(stairwellMaterial);

  // For timeline-co delay calculation
  const getTimelineCoData = () => {
    const data = [];
    for (let t = 0; t <= 30; t += 2) {
      // If staffCalled is at say delay, CO builds up slowly before staffCalled then shoots or builds up based on delay
      // The longer the delay, the higher the ultimate CO level at 30 minutes
      const coConcentration = Math.round(45 + Math.pow(t, 2) * (1.2 + (staffDelay * 0.1)));
      const survivalProbability = Math.max(0, Math.round(100 - (t * 2) * (1 + (staffDelay * 0.12))));
      data.push({
        time: `${t}m`,
        co: coConcentration,
        survival: survivalProbability
      });
    }
    return data;
  };

  const timelineData = getTimelineCoData();

  // Helper to render specific interactive diagram based on clause clicked
  const renderInteractiveDiagram = () => {
    const clauseId = excerpt.clause;

    // 1. Clause 4.6.1 - Fire Engine Access
    if (clauseId.includes("Clause 4.6.1")) {
      const stabilizersCanExtend = laneWidth >= 4.5;
      const ladderCleared = !overheadHazard || laneWidth >= 6.0;

      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-4 border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">ALLEY WIDTH CONTROLLER:</span>
              <span className="text-red-400 font-bold">{laneWidth.toFixed(1)} Meters</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="10"
              step="0.5"
              value={laneWidth}
              onChange={(e) => setLaneWidth(parseFloat(e.target.value))}
              className="w-full accent-red-600 bg-zinc-950 h-1 cursor-pointer"
            />
            
            <div className="flex items-center gap-4 text-xs">
              <span className="text-zinc-400">OVERHEAD WIRING HAZARD:</span>
              <button 
                onClick={() => setOverheadHazard(!overheadHazard)}
                className={`px-3 py-1 border text-[10px] uppercase font-bold transition-all ${
                  overheadHazard 
                    ? "border-red-500 bg-red-950/20 text-red-500" 
                    : "border-zinc-800 bg-zinc-950 text-zinc-500"
                }`}
              >
                {overheadHazard ? "Active Gridlock" : "Cleared Lines"}
              </button>
            </div>
          </div>

          {/* SVG Diagram Grid */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-none p-4 relative flex flex-col justify-between overflow-hidden">
            <span className="text-[8px] text-zinc-600 block mb-3">SITE_LAYOUT_ELEVATION_TOP_VIEW</span>
            
            <div className="h-44 relative flex items-center justify-center">
              {/* Left Property Line Building */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-center items-center text-[8px] text-zinc-600">
                <span>SHOPPING</span>
                <span>COMPLEX</span>
                <span className="text-[7px] text-zinc-700 mt-1">HEIGHT: 18m</span>
              </div>

              {/* Right Property Line Building */}
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-zinc-900 border-l border-zinc-800 flex flex-col justify-center items-center text-[8px] text-zinc-600">
                <span>FLOURISH</span>
                <span>B&B RESIDENCE</span>
                <span className="text-[7px] text-zinc-700 mt-1">HEIGHT: 15m</span>
              </div>

              {/* Alley Way Container */}
              <div className="absolute left-20 right-20 h-full bg-zinc-950 flex flex-col justify-between items-center px-4 relative">
                {/* Dashed center lane */}
                <div className="absolute inset-y-0 w-px border-l border-dashed border-zinc-800" />

                {/* Show lane dimension brackets */}
                <div className="absolute top-2 inset-x-2 flex items-center justify-between text-[8px] text-zinc-500 border-b border-zinc-800 pb-1">
                  <span>← Property Edge</span>
                  <span className="text-zinc-300 font-bold bg-zinc-900 px-1">{laneWidth.toFixed(1)}m Lane</span>
                  <span>Property Edge →</span>
                </div>

                {/* Overhead wire indicators */}
                {overheadHazard && (
                  <svg className="absolute inset-x-0 top-12 h-8 w-full z-10 pointer-events-none">
                    <line x1="0" y1="5" x2="100%" y2="25" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"/>
                    <line x1="0" y1="15" x2="100%" y2="5" stroke="#FACC15" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
                    <text x="30%" y="15" fill="#FACC15" fontSize="7" fontWeight="bold">LOW-HANGING TENSION POWER SPANS</text>
                  </svg>
                )}

                {/* Fire Engine visual block */}
                <motion.div 
                  layout
                  className={`w-14 h-24 absolute bottom-4 rounded-sm flex flex-col justify-between p-1 text-[8px] text-center font-bold text-white z-0 border transition-all ${
                    laneWidth < 3.5 
                      ? "bg-red-950/60 border-red-600 text-red-500 animate-pulse" 
                      : "bg-red-600 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  }`}
                  style={{ scale: Math.max(0.7, Math.min(1.1, laneWidth / 4.5)) }}
                >
                  <span className="text-[6px]">DFS PUMPER</span>
                  <div className="h-6 w-full bg-zinc-950/40 border border-white/20 flex flex-col justify-center text-[5px]">
                    {stabilizersCanExtend ? "OUTRIGGERS OK" : "NO OUTRIGGERS"}
                  </div>
                  <span className="text-[5px]">LADDER</span>
                </motion.div>

                {/* Stabilizers and warning flags */}
                {!stabilizersCanExtend && (
                  <div className="absolute bottom-12 text-[7px] bg-red-950/90 text-red-500 border border-red-800/80 px-2 py-1 text-center font-bold max-w-[120px] shadow-lg animate-pulse">
                    WIDTH TOO NARROW TO STABILIZE LADDER CHASSIS
                  </div>
                )}
              </div>
            </div>

            {/* Diagnostic Logs below SVG */}
            <div className="border-t border-zinc-900 pt-3 mt-3 grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
              <div className="bg-zinc-900/30 p-2.5">
                <span className="text-zinc-500 block text-[8px] uppercase">HYDRAULIC CRANE CAPABILITY:</span>
                <span className={stabilizersCanExtend ? "text-green-400 font-bold" : "text-red-500 font-bold"}>
                  {stabilizersCanExtend ? "FULLY STABLE (SAFE)" : "BLOCKED (CHASSIS COLLAPSE RISK)"}
                </span>
                <p className="text-[8px] text-zinc-400 mt-1 font-sans">NBC Part 3 specifies a minimum of 4.5m street width for the deployment of hydraulic stabilization jacks.</p>
              </div>
              <div className="bg-zinc-900/30 p-2.5">
                <span className="text-zinc-500 block text-[8px] uppercase">AERIAL EXPANSION SAFETY:</span>
                <span className={ladderCleared ? "text-green-400 font-bold" : "text-red-500 font-bold animate-pulse"}>
                  {ladderCleared ? "CLEARED ZONE" : "LADDER AUTO-SHORT-CIRCUIT"}
                </span>
                <p className="text-[8px] text-zinc-400 mt-1 font-sans">Overhead telecommunication cables and power lines in Hauz Rani prevent the ladder from reaching the 5th floor.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. Delhi Lal Dora Land Regulation Act (1963 Exemption)
    if (clauseId.includes("Delhi Lal Dora Land Regulation Act")) {
      const [exemptionMode, setExemptionMode] = useState("lal_dora"); // "lal_dora" | "regulated"

      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-1 border border-zinc-800 flex font-mono text-[10px]">
            <button
              onClick={() => setExemptionMode("lal_dora")}
              className={`flex-1 py-2 text-center font-bold uppercase transition-all ${
                exemptionMode === "lal_dora" 
                  ? "bg-red-950 text-red-500 border border-red-900/50" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Lal Dora Exempt Area (No setbacks)
            </button>
            <button
              onClick={() => setExemptionMode("regulated")}
              className={`flex-1 py-2 text-center font-bold uppercase transition-all ${
                exemptionMode === "regulated" 
                  ? "bg-green-950 text-green-400 border border-green-900/50" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Regulated Sector (6.0m setbacks)
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4 relative overflow-hidden">
            <span className="text-[8px] text-zinc-600 block mb-3">REGULATORY_ARBITRAGE_BOUNDS</span>
            
            <div className="grid grid-cols-3 gap-2 h-36 items-stretch relative">
              {/* Building A */}
              <div className="bg-zinc-900 border border-zinc-800 p-3 flex flex-col justify-between text-center relative">
                <span className="text-[8px] text-zinc-500">BUILDING A</span>
                <div className="my-1 text-red-500 font-bold text-xs animate-pulse">🔥 ACTIVE IGNITION</div>
                <span className="text-[7px] text-zinc-600">RETAIL STORE</span>
              </div>

              {/* Setback / Separation Zone */}
              <div className="flex flex-col justify-center items-center text-center relative border border-dashed border-zinc-900/60 bg-zinc-950 px-1">
                {exemptionMode === "lal_dora" ? (
                  <div className="w-full h-full bg-red-950/20 border-x border-red-900/40 flex flex-col justify-center items-center p-1 text-center">
                    <span className="text-red-500 text-[9px] font-bold">0.0m GAP</span>
                    <span className="text-[6px] text-red-400 mt-1 uppercase leading-snug">Horiz. Flame Leap Triggered</span>
                    {/* Flame horizontal lines jumping */}
                    <div className="w-full border-t-2 border-dashed border-red-500/50 animate-pulse my-1" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-green-950/10 flex flex-col justify-center items-center p-1 text-center">
                    <span className="text-green-500 text-[9px] font-bold">6.0m SETBACK</span>
                    <span className="text-[6px] text-green-400 mt-1 uppercase leading-snug">Convective Cooling Path</span>
                    <div className="text-green-500/60 text-[10px] mt-1">🚒 SAFE</div>
                  </div>
                )}
              </div>

              {/* Building B (The Target) */}
              <div className={`border p-3 flex flex-col justify-between text-center transition-all ${
                exemptionMode === "lal_dora" 
                  ? "border-red-900/60 bg-red-950/10 text-red-400 animate-pulse" 
                  : "border-zinc-800 bg-zinc-900 text-zinc-500"
              }`}>
                <span className="text-[8px]">BUILDING B</span>
                {exemptionMode === "lal_dora" ? (
                  <div className="text-[8px] text-red-500 font-bold">HORIZONTAL COMBUSTION SPREAD</div>
                ) : (
                  <div className="text-[8px] text-zinc-400">UNTOUCHED BY FIRE</div>
                )}
                <span className="text-[7px]">GUESTHOUSE</span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-3 border-t border-zinc-900 pt-3">
              {exemptionMode === "lal_dora" 
                ? "In Lal Dora exemptions, zero-setback rules let buildings touch. Thermal radiation instantly jumps walls, igniting adjacent structures. Hydraulic outriggers cannot open in the squeezed paths."
                : "Standard NBC setbacks (6m) act as isolation buffers, stopping structural horizontal jumping and letting emergency vehicles operate with maximum speed and clearance."}
            </p>
          </div>
        </div>
      );
    }

    // 3. Section 3.1.2.1 - Bed & Breakfast Lodging
    if (clauseId.includes("Section 3.1.2.1")) {
      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-1 border border-zinc-800 flex font-mono text-[10px]">
            <button
              onClick={() => setLayoutMode("compliant")}
              className={`flex-1 py-2 text-center font-bold uppercase transition-all ${
                layoutMode === "compliant" 
                  ? "bg-green-950 text-green-400 border border-green-900/50" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Compliant Layout (6 Rooms)
            </button>
            <button
              onClick={() => setLayoutMode("illegal")}
              className={`flex-1 py-2 text-center font-bold uppercase transition-all ${
                layoutMode === "illegal" 
                  ? "bg-red-950 text-red-500 border border-red-900/50" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Illegal Bajaj Layout (25 Rooms)
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4">
            <span className="text-[8px] text-zinc-600 block mb-3">FLOORPLAN_EGRESS_CONGESTION_FLOW</span>

            {layoutMode === "compliant" ? (
              <div className="space-y-3">
                {/* 6 room grid */}
                <div className="grid grid-cols-3 gap-2 h-24">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="border border-green-800/40 bg-green-950/10 flex flex-col justify-center items-center text-[9px] text-green-400 font-bold p-1">
                      <span>Room {i}</span>
                      <span className="text-[6px] font-sans font-light mt-0.5">Cap: 2 Adults</span>
                    </div>
                  ))}
                </div>
                <div className="bg-green-950/20 border border-green-800 p-2.5 text-[10px] text-green-400 leading-normal font-sans rounded-sm">
                  <strong>Egress Corridors: 2.0m Wide (Unobstructed)</strong>
                  <p className="mt-1 text-[9px] text-zinc-300 font-mono">Exit travel distance: 12 meters to staircase. Escape time: 22 seconds for 12 guests. Zero bottleneck pressure.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 25 subdivided rooms */}
                <div className="grid grid-cols-6 gap-1 h-24 overflow-hidden">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border border-red-800/60 bg-red-950/20 flex flex-col justify-center items-center text-[7px] text-red-400 font-bold p-0.5">
                      <span>Cell {i+1}</span>
                      <span className="text-[5px] font-sans font-light">Subdivided</span>
                    </div>
                  ))}
                </div>
                <div className="bg-red-950/20 border border-red-800 p-2.5 text-[10px] text-red-400 leading-normal font-sans rounded-sm animate-pulse">
                  <strong>Egress Corridor narrowed to 0.6m by partition walls!</strong>
                  <p className="mt-1 text-[9px] text-zinc-300 font-mono">Exit travel distance: 38 meters through narrow paths. Evacuation choked. Evacuation time: 240 seconds. Crowd collision rate: CRITICAL.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 4. DMC Act Section 347 (Illegal Change of Use)
    if (clauseId.includes("DMC Act Section 347")) {
      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-4 border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">SIMULATE ACTIVE GUESTS LOAD:</span>
              <span className="text-red-400 font-bold">{occupancyLoad} Persons</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={occupancyLoad}
              onChange={(e) => setOccupancyLoad(parseInt(e.target.value))}
              className="w-full accent-red-600 bg-zinc-950 h-1 cursor-pointer"
            />
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4">
            <span className="text-[8px] text-zinc-600 block mb-3">EGRESS_TRAFFIC_FLOW_BOTTLE_NECK</span>

            <div className="h-32 bg-zinc-900/30 border border-zinc-800 rounded-none relative flex flex-col justify-between p-3 overflow-hidden">
              {/* Egress corridor pipe */}
              <div className="h-16 w-full bg-zinc-950 border border-zinc-800 rounded-none relative flex items-center justify-between px-10">
                <span className="text-[7px] text-zinc-600 absolute left-2 uppercase">Rooms</span>
                
                {/* Dynamic crowd representation */}
                <div className="flex-1 flex gap-1 flex-wrap justify-center items-center px-4 max-h-full overflow-hidden">
                  {Array.from({ length: Math.min(60, occupancyLoad) }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        occupancyLoad > 50 
                          ? "bg-red-500 animate-ping" 
                          : occupancyLoad > 25 
                          ? "bg-orange-400" 
                          : "bg-green-400"
                      }`} 
                    />
                  ))}
                </div>

                {/* Narrow door block */}
                <div className="w-1.5 h-full bg-red-600 flex items-center justify-center relative">
                  <span className="absolute -top-4 text-[6px] text-zinc-500 font-bold">0.6m DOORWAY</span>
                </div>
                <span className="text-[7px] text-zinc-600 absolute right-2 uppercase">Exit Stairs</span>
              </div>

              {/* Readout statistics */}
              <div className="grid grid-cols-3 gap-2 mt-2 text-[9px] pt-2 border-t border-zinc-900">
                <div>
                  <span className="text-zinc-500 uppercase block text-[7px]">Flow Resistance:</span>
                  <span className={`font-bold block ${occupancyLoad > 50 ? "text-red-500" : "text-white"}`}>
                    {occupancyLoad > 50 ? "92% (CRITICAL GRIDLOCK)" : occupancyLoad > 25 ? "45% (DELAYED)" : "5% (SMOOTH)"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase block text-[7px]">Air Suffocation Rate:</span>
                  <span className="font-bold text-white block">
                    {Math.round(occupancyLoad * 1.8)}% Speedup
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase block text-[7px]">NBC Code Status:</span>
                  <span className={`font-bold block ${occupancyLoad > 15 ? "text-red-500 font-bold" : "text-green-500"}`}>
                    {occupancyLoad > 15 ? "CODE BREACHED" : "COMPLIANT LIMIT"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 5. Clause 4.8.2.3 - Prohibited Materials
    if (clauseId.includes("Clause 4.8.2.3")) {
      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-3 border border-zinc-800 space-y-2">
            <span className="text-[9px] text-zinc-500 block uppercase">Select Corridor Lining Material to Simulate Combustion:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[9px]">
              {["polyurethane", "plywood", "acrylic", "gypsum", "concrete"].map((mat) => (
                <button
                  key={mat}
                  onClick={() => setStairwellMaterial(mat)}
                  className={`px-2 py-1.5 border text-left rounded-none transition-all ${
                    stairwellMaterial === mat 
                      ? "border-red-500 bg-red-950/20 text-red-500 font-bold" 
                      : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <div className="uppercase font-bold text-[8px]">{mat}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4 relative overflow-hidden flex items-stretch h-56">
            {/* Visual simulation column representing stairwell shaft */}
            <div className="w-1/3 bg-zinc-900/60 border border-zinc-800 flex flex-col justify-end items-center relative overflow-hidden px-2">
              <span className="text-[7px] text-zinc-500 absolute top-2 uppercase">STAIRWELL SHAFT</span>
              
              {/* Flame Rise effect */}
              {stairwellMaterial !== "concrete" && stairwellMaterial !== "gypsum" && (
                <motion.div 
                  animate={{ height: ["10%", "100%", "10%"] }} 
                  transition={{ repeat: Infinity, duration: stairwellMaterial === "polyurethane" ? 0.8 : 1.6, ease: "easeInOut" }} 
                  className={`absolute bottom-0 inset-x-2 bg-gradient-to-t blur-sm z-0 ${
                    stairwellMaterial === "polyurethane" 
                      ? "from-red-600 via-orange-500 to-yellow-300 opacity-60" 
                      : stairwellMaterial === "plywood" 
                      ? "from-red-600 via-orange-900/40 to-transparent opacity-40" 
                      : "from-orange-600 via-yellow-600/30 to-transparent opacity-50"
                  }`}
                />
              )}

              {/* Smoke clouds */}
              {stairwellMaterial !== "concrete" && (
                <motion.div 
                  animate={{ y: [40, -100, 40], scale: [0.8, 1.4, 0.8] }}
                  transition={{ repeat: Infinity, duration: stairwellMaterial === "polyurethane" ? 1.5 : 3.0 }}
                  className={`absolute w-12 h-12 rounded-full blur-md z-10 ${
                    stairwellMaterial === "polyurethane" 
                      ? "bg-zinc-850/80" 
                      : stairwellMaterial === "gypsum" 
                      ? "bg-zinc-500/20" 
                      : "bg-zinc-800/50"
                  }`}
                />
              )}

              <div className="relative z-20 text-[10px] text-white font-bold bg-black/60 px-2 py-1 text-center border border-zinc-800 mt-auto mb-2 uppercase tracking-tighter">
                {activeMaterial.name}
              </div>
            </div>

            {/* Simulated indicators */}
            <div className="flex-1 pl-4 flex flex-col justify-center space-y-3.5">
              <div className="border-b border-zinc-900 pb-2">
                <span className="text-[9px] text-zinc-500 block uppercase">STAIRWELL CONVECTIVE FLASHOVER:</span>
                <span className={`text-base font-black ${stairwellMaterial === "gypsum" || stairwellMaterial === "concrete" ? "text-green-400" : "text-red-500 animate-pulse"}`}>
                  {activeMaterial.flashover}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[8px] text-zinc-500 block uppercase">FLAME RISE SPEED:</span>
                  <span className="text-xs font-bold text-white block">{activeMaterial.speed}</span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-500 block uppercase">CARBON MONOXIDE (CO):</span>
                  <span className="text-xs font-bold text-red-500 block">{activeMaterial.co}</span>
                </div>
              </div>
              <div className="bg-zinc-900/40 p-2 border border-zinc-900 text-[10px] leading-relaxed">
                <span className="text-[8px] text-zinc-500 block uppercase font-bold">HAZARD CLASSIFICATION:</span>
                <strong className={stairwellMaterial === "gypsum" || stairwellMaterial === "concrete" ? "text-green-400" : "text-red-500"}>
                  {activeMaterial.hazard}
                </strong>
                <p className="text-[8px] text-zinc-400 mt-1 font-sans">
                  {stairwellMaterial === "polyurethane" && "Polyurethane lining acts as solid gasoline, releasing thick cyanic smoke that chokes people in seconds."}
                  {stairwellMaterial === "plywood" && "Illegal plywood linings speed up fire travel up vertical staircase wells, causing full floor ignition."}
                  {stairwellMaterial === "gypsum" && "Compliant Class B fireproofing. Restricts propagation and blocks convective heat spread."}
                  {stairwellMaterial === "concrete" && "Class A standard non-combustible lining as mandated by India National Building Code."}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 6. NBC Part 4, Clause 3.4.15.2 - Magnetic Lock Failsafes
    if (clauseId.includes("Magnetic Lock Failsafes")) {
      const doorReleased = circuitType === "fail-safe" && emergencyPowerCut;

      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-4 border border-zinc-800 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[9px] text-zinc-500 block uppercase mb-1">SELECT CIRCUIT INTEGRATION:</span>
                <div className="flex bg-black p-1 border border-zinc-900 text-[9px]">
                  <button 
                    onClick={() => setCircuitType("fail-safe")}
                    className={`flex-1 py-1.5 uppercase font-bold transition-all ${
                      circuitType === "fail-safe" 
                        ? "bg-green-950 text-green-400 border border-green-900/50" 
                        : "text-zinc-500"
                    }`}
                  >
                    Fail-Safe (Compliant)
                  </button>
                  <button 
                    onClick={() => setCircuitType("fail-secure")}
                    className={`flex-1 py-1.5 uppercase font-bold transition-all ${
                      circuitType === "fail-secure" 
                        ? "bg-red-950 text-red-500 border border-red-900/50" 
                        : "text-zinc-500"
                    }`}
                  >
                    Fail-Secure (Illegal)
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-zinc-500 block uppercase mb-1">EMERGENCY BUILDING POWER CUT:</span>
                <button
                  onClick={() => setEmergencyPowerCut(!emergencyPowerCut)}
                  className={`w-full py-2.5 border uppercase font-bold text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    emergencyPowerCut 
                      ? "border-red-500 bg-red-950/20 text-red-500 animate-pulse" 
                      : "border-green-800 bg-green-950/10 text-green-400"
                  }`}
                >
                  {emergencyPowerCut ? <ZapOff className="w-3.5 h-3.5"/> : <Zap className="w-3.5 h-3.5"/>}
                  <span>{emergencyPowerCut ? "MAINS CUT ACTIVE" : "MAINS SECURE (ON)"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4">
            <span className="text-[8px] text-zinc-600 block mb-3">ELECTRO_MAGNETIC_LOCK_RELAY_BOARD</span>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Circuit wiring graphic */}
              <div className="md:col-span-8 border border-zinc-900 bg-zinc-900/20 p-4 relative h-36 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[8px] text-zinc-500">
                  <span>INPUT: 240V AC MAIN</span>
                  <span className={emergencyPowerCut ? "text-red-500" : "text-green-500"}>
                    {emergencyPowerCut ? "GRID CUT" : "ACTIVE VOLTAGE"}
                  </span>
                </div>

                {/* Circuit lines */}
                <div className="my-auto relative flex items-center justify-between px-6">
                  {/* Transformer box */}
                  <div className="border border-zinc-800 p-2 bg-zinc-950 text-[7px] text-center z-10">
                    <span className="text-zinc-600 uppercase block">Rectifier</span>
                    <strong className="text-white">12V DC</strong>
                  </div>

                  {/* Relay Switch */}
                  <div className="border border-zinc-800 p-2 bg-zinc-950 text-[7px] text-center z-10 relative">
                    <span className="text-zinc-600 uppercase block">Relay Switch</span>
                    <strong className={circuitType === "fail-safe" ? "text-green-400" : "text-red-400"}>
                      {circuitType === "fail-safe" ? "NC (FAIL-SAFE)" : "NO (FAIL-SECURE)"}
                    </strong>
                    {/* Visual wire break indicator */}
                    <div className={`absolute -right-4 top-1/2 w-4 h-0.5 ${
                      emergencyPowerCut 
                        ? (circuitType === "fail-safe" ? "bg-zinc-800 border-dashed" : "bg-red-500") 
                        : "bg-green-500"
                    }`} />
                  </div>

                  {/* Maglock Coil */}
                  <div className="border border-zinc-800 p-2 bg-zinc-950 text-[7px] text-center z-10">
                    <span className="text-zinc-600 uppercase block">Electromagnet</span>
                    <strong className={doorReleased ? "text-zinc-500" : "text-red-500 animate-pulse"}>
                      {doorReleased ? "OFF (UNLOCKED)" : "CLAMPED (300KG)"}
                    </strong>
                  </div>
                </div>

                <div className="text-[7px] text-zinc-600 uppercase text-center font-bold tracking-widest border-t border-zinc-900/60 pt-2">
                  ELECTRICAL FAILSAFE ALIGNMENT ROUTING
                </div>
              </div>

              {/* Status Display */}
              <div className="md:col-span-4 bg-zinc-900/30 border border-zinc-900 p-3 h-36 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] text-zinc-500 uppercase block">EMERGENCY EXIT DOOR STATUS:</span>
                  <div className={`text-sm font-black mt-1 uppercase ${doorReleased ? "text-green-400" : "text-red-500 animate-pulse"}`}>
                    {doorReleased ? "EXITS RELEASED" : "EXIT DEAD-LOCKED"}
                  </div>
                </div>
                
                <div className="text-[9px] text-zinc-400 leading-snug border-t border-zinc-900/60 pt-2">
                  {doorReleased 
                    ? "FAIL-SAFE CIRCUIT INTEGRITY ACTIVE. Cutting power automatically drops magnetic fields, unlocking exits."
                    : "ILLEGAL WIRING TRAP. Power failure keeps electromagnet locked. Trapped guests cannot force the doors open."}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 7. Section 4.14.1 - Emergency Dispatch Obligations
    if (clauseId.includes("Section 4.14.1")) {
      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-4 border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">STAFF RESPOND DELAY:</span>
              <span className="text-red-400 font-bold">{staffDelay} Minutes</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="2"
              value={staffDelay}
              onChange={(e) => setStaffDelay(parseInt(e.target.value))}
              className="w-full accent-red-600 bg-zinc-950 h-1 cursor-pointer"
            />
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4">
            <span className="text-[8px] text-zinc-600 block mb-3">OXYGEN_AND_TOXIC_CO_CURVES_30_MINS</span>
            
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="time" stroke="#555" fontSize={9} />
                  <YAxis stroke="#555" fontSize={9} />
                  <RechartTooltip contentStyle={{ background: "#050505", border: "1px solid #c2410c", fontSize: 9 }} />
                  <ReferenceLine x={`${staffDelay}m`} stroke="#dc2626" strokeWidth={2} label={{ value: "Dispatch Call", fill: "#dc2626", fontSize: 8, position: "top" }} />
                  <Line type="monotone" dataKey="co" stroke="#ea580c" strokeWidth={2.5} name="Carbon Monoxide (ppm)" />
                  <Line type="monotone" dataKey="survival" stroke="#16a34a" strokeWidth={1.5} name="Survival Chance (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-zinc-900/40 p-3 border border-zinc-900 text-[10px] leading-relaxed mt-2.5">
              <span className="text-zinc-400 block font-bold mb-1">MUNICIPAL FORENSICS READOUT:</span>
              {staffDelay === 0 && "INSTANT TELEMETRY: Immediate automated direct line alert to Delhi Fire Services (DFS). Trucks dispatched within 180 seconds. Survival rate: > 95%."}
              {staffDelay > 0 && staffDelay <= 6 && "MINOR RETRET ALERT: Small delayed attempt with private extinguisher. DFS dispatched. Response teams arrive before flashover."}
              {staffDelay > 6 && staffDelay <= 15 && "CRITICAL STALL: Private cover-up attempt. Stairwell paneling ignites. CO concentrations climb above 400 PPM."}
              {staffDelay > 15 && `EXTREME COLLUSION DELAY (${staffDelay}m): Total guesthouse gridlock. Toxic gases reach lethal concentration. Occupants asleep undergo cerebral asphyxiation.`}
            </div>
          </div>
        </div>
      );
    }

    // 8. Bharatiya Nyaya Sanhita (BNS) Sec. 105
    if (clauseId.includes("BNS Sec. 105")) {
      const activeCulpCount = Object.values(culpabilityChecklist).filter(Boolean).length;
      const getCulpVerdict = (count) => {
        if (count === 4) return { name: "BNS SECTION 105: CULPABLE HOMICIDE NOT AMOUNTING TO MURDER", jail: "Mandatory 10-Year Imprisonment with Unlimited Personal Fines", desc: "Corporate developer operated with complete knowledge that structural blockages and material bypasses would cause certain death during a standard thermal event." };
        if (count >= 2) return { name: "BNS SECTION 106: CAUSING DEATH BY NEGLIGENCE", jail: "Up to 5 Years Jail with Structural De-licensing", desc: "Severe administrative lapses. High-hazard materials paired with locked terrace pathways without active smoke sensors." };
        return { name: "BNS SECTION 287: NEGLIGENT CONDUCT WITH MACHINERY", jail: "Up to 6 Months Detention and Municipal Sanctions", desc: "Standard municipal safety violations. Subject to minor structural correction citations." };
      };

      const verdict = getCulpVerdict(activeCulpCount);

      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-4 border border-zinc-800 space-y-3">
            <span className="text-[9px] text-zinc-500 block uppercase">Check Forensic Evidence Folders to Build Prosecution Case:</span>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {[
                { id: "lockedGates", label: "Padlocked Terrace Escape Gates" },
                { id: "singleStair", label: "Single 1.0m Stairwell Layout" },
                { id: "woodLining", label: "Combustible Staircase Lining" },
                { id: "basementKitchen", label: "Illegal Basement Commercial Kitchen" }
              ].map((item) => (
                <label 
                  key={item.id} 
                  className={`flex items-center gap-2 p-2 border cursor-pointer select-none transition-all ${
                    culpabilityChecklist[item.id] 
                      ? "border-red-500 bg-red-950/20 text-red-400 font-bold" 
                      : "border-zinc-800 bg-zinc-950 text-zinc-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={culpabilityChecklist[item.id]}
                    onChange={(e) => setCulpabilityChecklist({ ...culpabilityChecklist, [item.id]: e.target.checked })}
                    className="accent-red-600 h-3.5 w-3.5 rounded-none cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4 space-y-3">
            <div className="flex justify-between items-center text-[8px] text-zinc-600 border-b border-zinc-900 pb-2">
              <span>CASE_LAW_DOSSIER // INQUEST_PORTAL</span>
              <span>FORENSIC VERDICT CONFIDENCE: {activeCulpCount * 25}%</span>
            </div>

            <div className="bg-red-950/20 border-l-2 border-red-500 p-4 space-y-1.5">
              <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider block">CHARGE DECISION REGISTER:</span>
              <h4 className="text-xs font-black text-white">{verdict.name}</h4>
              <p className="text-[10px] text-zinc-300 leading-normal font-sans font-light">{verdict.desc}</p>
              
              <div className="text-[9px] text-orange-400 font-bold pt-2 border-t border-zinc-900/60 mt-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>LIABILITY PROJECTION: {verdict.jail}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 9. Clause 5.2.1 - Professional Verification
    if (clauseId.includes("Clause 5.2.1")) {
      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-3 border border-zinc-800 text-[10px] leading-relaxed">
            <span className="text-zinc-500 block uppercase font-bold text-[8px] mb-1">STAMP SELECTION FOR HIGH-MAGNIFICATION FORENSIC SCAN:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "seal", label: "A1. Municipal Seal Authenticity Scan" },
                { id: "reg", label: "A2. Architect Register CA-1922 Scan" }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setMagnifierMarker(btn.id)}
                  className={`text-left p-2 border text-[9px] font-bold transition-all ${
                    magnifierMarker === btn.id 
                      ? "border-yellow-500 bg-yellow-950/20 text-yellow-500" 
                      : "border-zinc-800 bg-zinc-950 text-zinc-500"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4 relative overflow-hidden h-44 flex flex-col justify-between">
            <span className="text-[8px] text-zinc-600 block">BLUEPRINT_REGISTRATION_VERIFIER</span>

            {magnifierMarker ? (
              <div className="bg-zinc-900/30 border border-zinc-800 p-3 relative z-10 flex-1 flex flex-col justify-center text-[10px] leading-relaxed">
                {magnifierMarker === "seal" && (
                  <div>
                    <strong className="text-yellow-500 uppercase block mb-1">A1. MCD EMBOSSING VERIFICATION:</strong>
                    <p className="text-zinc-300 font-sans font-light">The MCD approval seal was scanned using deep spectral analysis. Forensic indicators prove the stamp is a pixelated clone imported from an unrelated residential plot sanction, dated 2021.</p>
                  </div>
                )}
                {magnifierMarker === "reg" && (
                  <div>
                    <strong className="text-yellow-500 uppercase block mb-1">A2. ARCHITECT COUNCIL REGISTER ID:</strong>
                    <p className="text-zinc-300 font-sans font-light">The certifying ID "CA/2014/1922" belongs to a retired draftsman in Chandigarh. He certified in his deposition that he never visited Malviya Nagar or drafted building schematics for Bajaj, proving complete document identity theft.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center italic text-zinc-600 text-[10px] font-sans">
                Click any of the stamp scanning items above to run the verification process.
              </div>
            )}
          </div>
        </div>
      );
    }

    // 10. BNS Sec. 248 - Forgery of Safety Certificates
    if (clauseId.includes("BNS Sec. 248")) {
      return (
        <div className="space-y-4 font-mono">
          <div className="bg-zinc-900/40 p-3 border border-zinc-800 text-[10px] leading-relaxed">
            <span className="text-zinc-500 block uppercase font-bold text-[8px] mb-1">SELECT ANOMALY AREA TO SPOT FORGERY DISCREPANCIES:</span>
            <div className="grid grid-cols-3 gap-1.5 text-[9px]">
              {[
                { id: "width", label: "Declared Street Width" },
                { id: "tank", label: "Rooftop Water Tank" },
                { id: "stair", label: "Emergency Exit Path" }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedDiscrepancy(btn.id)}
                  className={`p-1.5 border text-center transition-all ${
                    selectedDiscrepancy === btn.id 
                      ? "border-red-500 bg-red-950/20 text-red-500 font-bold" 
                      : "border-zinc-800 bg-zinc-950 text-zinc-500"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4">
            <span className="text-[8px] text-zinc-600 block mb-3">SPLIT_FORENSIC_DOCUMENT_MATCHING</span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-green-950 bg-green-950/5 p-3 space-y-1 text-[9px] text-green-400">
                <span className="font-bold block text-[8px]">LEGITIMATE DFS FIRE NOC:</span>
                <p>• Access street width must measure &gt; 6.0 meters.</p>
                <p>• Rooftop reservoir storage capacity: &gt; 10,000 Liters.</p>
                <p>• Clear 2.0m unobstructed stairwells with 120-min doors.</p>
              </div>

              <div className="border border-red-950 bg-red-950/10 p-3 space-y-1 text-[9px] text-red-400">
                <span className="font-bold block text-[8px] uppercase">BAJAJ SUBMITTED NOC (FORGED):</span>
                {selectedDiscrepancy === "width" && (
                  <p className="animate-pulse">❌ Declared alley width: 9.0 meters (Actual surveyed alley: barely 1.5 meters, making fire truck access impossible).</p>
                )}
                {selectedDiscrepancy === "tank" && (
                  <p className="animate-pulse">❌ Declared roof reservoir: 10,000L (Actual tank: a 500L plastic domestic drum, completely empty at the fire event).</p>
                )}
                {selectedDiscrepancy === "stair" && (
                  <p className="animate-pulse">❌ Declared dual 1.5m escape routes (Actual layout: one narrow 1.0m stairs wrapped in open electric duct chimneys).</p>
                )}
                {!selectedDiscrepancy && (
                  <p className="text-zinc-600 italic">Select an anomaly area above to compare declared values against physical guesthouse audits.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[#08080a] border border-[#EF4444]/40 text-zinc-200 shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-900 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-950/40 border border-red-500/30 text-red-500">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[8px] text-red-500 font-bold uppercase tracking-[0.25em] block">
                NATIONAL BUILDING CODE // ARCHITECTURAL FORENSICS
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight font-display">
                Interactive Blueprint Analysis: {excerpt.clause}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white rounded-none cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content split screen */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left panel: Description and rule details */}
          <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-zinc-900 space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-red-500 font-bold uppercase tracking-wider block">STATUTORY MANDATE CLAUSE:</span>
              <h4 className="text-xs font-bold text-white uppercase font-mono">{excerpt.clause}</h4>
            </div>
            
            <div className="text-xs text-zinc-400 leading-relaxed font-sans font-light bg-zinc-900/20 p-4 border border-zinc-900/60">
              {excerpt.text}
            </div>

            <div className="border-t border-zinc-900 pt-4 space-y-2.5">
              <span className="text-[8px] font-mono text-zinc-500 block uppercase">SYSTEMIC CONSEQUENCES IN TRAGEDY:</span>
              <p className="text-[11px] text-zinc-300 leading-relaxed font-light">
                This exact statutory code represents the thin line between structural safety and instant mass casualty. When developers bypass this code, they actively plan for fatal traps.
              </p>
            </div>

            <div className="border-t border-zinc-900 pt-4 text-[10px] font-mono text-red-500 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>STRICT MUNICIPAL AUDIT RECOVERY</span>
            </div>
          </div>

          {/* Right panel: Full interactive simulation */}
          <div className="lg:col-span-8 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">
                  Live Forensic Simulator Workspace
                </span>
              </div>
              
              {renderInteractiveDiagram()}
            </div>

            <div className="border-t border-zinc-900 pt-4 text-[9px] font-mono text-zinc-600 flex justify-between items-center">
              <span>SIMULATION CONSOLE v2.08 // SECURE_SOCKET</span>
              <span>ESTIMATED PENALTY: HIGH-GRADE CRIMES</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
