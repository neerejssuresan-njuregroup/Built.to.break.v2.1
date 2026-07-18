/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ShieldAlert, Flame, Compass, Users, MapPin, CheckCircle2 } from "lucide-react";
import { calculateUrbanRisk } from "../data";
import DelhiMap from "./DelhiMap";

const PRESETS = [
  {
    name: "Central Delhi (Daryaganj)",
    inputs: { laneWidth: 1.5, buildingFloors: 5, commercialOverload: 4.8, exitsCount: 1 },
    description: "Historic core density. Extremely narrow alleys under 2m with high vertical floor counts and severe trading load."
  },
  {
    name: "South Delhi (Hauz Khas)",
    inputs: { laneWidth: 3.5, buildingFloors: 4, commercialOverload: 3.0, exitsCount: 2 },
    description: "Mixed commercial-residential structures with moderately narrow approaches and compromised setbacks."
  },
  {
    name: "North East (Seelampur)",
    inputs: { laneWidth: 2.0, buildingFloors: 5, commercialOverload: 4.0, exitsCount: 1 },
    description: "Densely packed unauthorized developments featuring heavy congestion and severe response bottlenecks."
  },
  {
    name: "New Delhi (Compliant)",
    inputs: { laneWidth: 9.0, buildingFloors: 3, commercialOverload: 1.0, exitsCount: 4 },
    description: "Ideal master-planned model adhering fully to National Building Codes regulations and spacious access."
  }
];

export default function RiskSimulator() {
  // Synchronized Delhi area data list representing the 11 administrative districts
  const [areas, setAreas] = useState([
    { id: "delhi_north", name: "North Delhi", region: "NCT of Delhi", laneWidth: 5.0, buildingFloors: 3, commercialOverload: 2.0, exitsCount: 3, hazardScore: 48, hazardLevel: "Moderate" },
    { id: "delhi_north_west", name: "North West Delhi", region: "NCT of Delhi", laneWidth: 5.2, buildingFloors: 3, commercialOverload: 1.8, exitsCount: 3, hazardScore: 45, hazardLevel: "Moderate" },
    { id: "delhi_west", name: "West Delhi", region: "NCT of Delhi", laneWidth: 4.5, buildingFloors: 4, commercialOverload: 2.8, exitsCount: 2, hazardScore: 58, hazardLevel: "High" },
    { id: "delhi_south_west", name: "South West Delhi", region: "NCT of Delhi", laneWidth: 6.5, buildingFloors: 4, commercialOverload: 1.5, exitsCount: 3, hazardScore: 30, hazardLevel: "Moderate" },
    { id: "delhi_south", name: "South Delhi", region: "NCT of Delhi", laneWidth: 3.5, buildingFloors: 4, commercialOverload: 3.0, exitsCount: 2, hazardScore: 68, hazardLevel: "High" },
    { id: "delhi_south_east", name: "South East Delhi", region: "NCT of Delhi", laneWidth: 4.0, buildingFloors: 4, commercialOverload: 2.5, exitsCount: 2, hazardScore: 62, hazardLevel: "High" },
    { id: "delhi_new", name: "New Delhi", region: "NCT of Delhi", laneWidth: 9.0, buildingFloors: 3, commercialOverload: 1.0, exitsCount: 4, hazardScore: 15, hazardLevel: "Low" },
    { id: "delhi_central", name: "Central Delhi", region: "NCT of Delhi", laneWidth: 1.5, buildingFloors: 5, commercialOverload: 4.8, exitsCount: 1, hazardScore: 94, hazardLevel: "Critical" },
    { id: "delhi_north_east", name: "North East Delhi", region: "NCT of Delhi", laneWidth: 2.0, buildingFloors: 5, commercialOverload: 4.0, exitsCount: 1, hazardScore: 88, hazardLevel: "Critical" },
    { id: "delhi_shahdara", name: "Shahdara", region: "NCT of Delhi", laneWidth: 2.2, buildingFloors: 4, commercialOverload: 3.5, exitsCount: 1, hazardScore: 82, hazardLevel: "Critical" },
    { id: "delhi_east", name: "East Delhi", region: "NCT of Delhi", laneWidth: 3.0, buildingFloors: 5, commercialOverload: 3.2, exitsCount: 2, hazardScore: 76, hazardLevel: "High" },
  ]);

  const [selectedAreaId, setSelectedAreaId] = useState("delhi_central");

  const [inputs, setInputs] = useState({
    laneWidth: 1.5,
    buildingFloors: 5,
    commercialOverload: 4.8,
    exitsCount: 1
  });

  const [outputs, setOutputs] = useState({
    evacuationVelocity: 12,
    tenderAccessMinutes: 18.0,
    hazardScore: 94,
    hazardLevel: "Critical",
    hazardColor: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20",
    explanation: "Systemic collapse risk. Emergency vehicles cannot penetrate lanes. Unsanctioned floors create extreme collapse risk."
  });

  // Sync inputs when selecting a different area on the map
  const selectArea = (id) => {
    setSelectedAreaId(id);
    const area = areas.find((a) => a.id === id);
    if (area) {
      setInputs({
        laneWidth: area.laneWidth,
        buildingFloors: area.buildingFloors,
        commercialOverload: area.commercialOverload,
        exitsCount: area.exitsCount,
      });
    }
  };

  // Run calculation and update selected area scores/map states in sync
  useEffect(() => {
    const results = calculateUrbanRisk(inputs);
    setOutputs(results);

    // Update the areas list with the active live-recalculated values
    setAreas((prevAreas) =>
      prevAreas.map((area) =>
        area.id === selectedAreaId
          ? {
              ...area,
              laneWidth: inputs.laneWidth,
              buildingFloors: inputs.buildingFloors,
              commercialOverload: inputs.commercialOverload,
              exitsCount: inputs.exitsCount,
              hazardScore: results.hazardScore,
              hazardLevel: results.hazardLevel,
            }
          : area
      )
    );
  }, [inputs, selectedAreaId]);

  const handleInputChange = (key, value) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const applyPreset = (preset) => {
    setInputs(preset.inputs);
  };

  const getBorderColorForHazard = (level) => {
    if (level === "Critical" || level === "Extreme") return "border-[#EF4444]";
    if (level === "High") return "border-[#F97316]";
    return "border-[#F59E0B]";
  };

  const getTextColorForHazard = (level) => {
    if (level === "Critical" || level === "Extreme") return "text-[#EF4444]";
    if (level === "High") return "text-[#F97316]";
    return "text-[#F59E0B]";
  };

  return (
    <div className="bg-[#0A0A0A] rounded-none border border-zinc-900 p-6 md:p-8 shadow-2xl" id="risk-simulator-widget">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#F97316] font-mono text-xs uppercase tracking-[0.2em] font-bold mb-1">
            <Flame className="w-4 h-4 text-[#EF4444]" />
            <span>Interactive Spatial Simulator</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight uppercase font-display">
            Infrastructure Stress Station
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl mt-1 font-light leading-relaxed">
            Choose a Delhi neighborhood on the map or select a preset, then adjust spatial variables to observe live vulnerability mitigation.
          </p>
        </div>
        <div className={`mt-4 md:mt-0 px-4 py-2 rounded-none border ${getBorderColorForHazard(outputs.hazardLevel)} bg-zinc-950 flex items-center gap-2 font-bold`}>
          <ShieldAlert className={`w-5 h-5 ${getTextColorForHazard(outputs.hazardLevel)}`} />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider leading-none text-zinc-500 font-bold">Vulnerability Status</span>
            <span className={`text-base tracking-tight font-mono font-bold uppercase ${getTextColorForHazard(outputs.hazardLevel)}`}>
              {outputs.hazardLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Main interactive map and simulator workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Dynamic SVGA Delhi Map */}
        <div className="lg:col-span-5">
          <DelhiMap
            areas={areas}
            selectedAreaId={selectedAreaId}
            onSelectArea={selectArea}
          />
        </div>

        {/* Right Side: Inputs & Live Outcomes */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Preset Cards */}
          <div>
            <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider block mb-3 font-bold">
              [Preset Models]
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESETS.map((preset) => {
                const isSelected =
                  inputs.laneWidth === preset.inputs.laneWidth &&
                  inputs.buildingFloors === preset.inputs.buildingFloors &&
                  inputs.commercialOverload === preset.inputs.commercialOverload &&
                  inputs.exitsCount === preset.inputs.exitsCount;

                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`text-left p-3 rounded-none border transition-all ${
                      isSelected
                        ? "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]"
                        : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/40"
                    }`}
                    type="button"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold font-mono tracking-tight uppercase block truncate">{preset.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />}
                    </div>
                    <p className="text-[9px] text-zinc-500 leading-tight line-clamp-1 font-light">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sliders Area */}
            <div className="space-y-6">
              <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider block border-b border-zinc-900 pb-2 font-bold">
                [Step 1] Adjust Local Parameters
              </span>

              {/* Parameter 1: Lane Width */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5 font-bold uppercase tracking-wide">
                    <Compass className="w-4 h-4 text-zinc-500" />
                    Average Lane Width
                  </span>
                  <span className="font-mono text-[#EF4444] bg-zinc-950 px-2 py-0.5 rounded-none border border-zinc-900 text-[10px] font-bold uppercase">
                    {inputs.laneWidth}m &bull; {inputs.laneWidth < 4.5 ? "Narrow" : "Code Compliant"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.1"
                  value={inputs.laneWidth}
                  onChange={(e) => handleInputChange("laneWidth", parseFloat(e.target.value))}
                  className="w-full accent-[#EF4444] bg-zinc-950 h-1 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-600 font-mono font-bold uppercase tracking-wider">
                  <span>1.0m [Alley]</span>
                  <span>4.5m [NBC Limit]</span>
                  <span>12.0m [Boulevard]</span>
                </div>
              </div>

              {/* Parameter 2: Building Floors */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5 font-bold uppercase tracking-wide">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    Vertical Storeys
                  </span>
                  <span className="font-mono text-[#EF4444] bg-zinc-950 px-2 py-0.5 rounded-none border border-zinc-900 text-[10px] font-bold uppercase">
                    {inputs.buildingFloors} Floors &bull; {inputs.buildingFloors > 3 ? "Violation" : "Legal"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={inputs.buildingFloors}
                  onChange={(e) => handleInputChange("buildingFloors", parseInt(e.target.value))}
                  className="w-full accent-[#EF4444] bg-zinc-950 h-1 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-600 font-mono font-bold uppercase tracking-wider">
                  <span>1 Storey</span>
                  <span>3 Storeys [Cap]</span>
                  <span>8 Storeys [Critical]</span>
                </div>
              </div>

              {/* Parameter 3: Commercial Overloading */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5 font-bold uppercase tracking-wide">
                    <Users className="w-4 h-4 text-zinc-500" />
                    Fuel/Occupancy Overload
                  </span>
                  <span className="font-mono text-[#EF4444] bg-zinc-950 px-2 py-0.5 rounded-none border border-zinc-900 text-[10px] font-bold uppercase">
                    {inputs.commercialOverload}x Capacity
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={inputs.commercialOverload}
                  onChange={(e) => handleInputChange("commercialOverload", parseFloat(e.target.value))}
                  className="w-full accent-[#EF4444] bg-zinc-950 h-1 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-600 font-mono font-bold uppercase tracking-wider">
                  <span>1.0x [Optimal]</span>
                  <span>3.0x [Overload]</span>
                  <span>5.0x [Extreme Load]</span>
                </div>
              </div>

              {/* Parameter 4: Escape Exits */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5 font-bold uppercase tracking-wide">
                    <Compass className="w-4 h-4 text-zinc-500" />
                    Block Exit Points
                  </span>
                  <span className="font-mono text-[#EF4444] bg-zinc-950 px-2 py-0.5 rounded-none border border-zinc-900 text-[10px] font-bold uppercase">
                    {inputs.exitsCount} Exit{inputs.exitsCount > 1 ? "s" : ""}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={inputs.exitsCount}
                  onChange={(e) => handleInputChange("exitsCount", parseInt(e.target.value))}
                  className="w-full accent-[#EF4444] bg-zinc-950 h-1 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-600 font-mono font-bold uppercase tracking-wider">
                  <span>1 [Choke Point]</span>
                  <span>2 [Block]</span>
                  <span>4 [Grid Layout]</span>
                </div>
              </div>
            </div>

            {/* Live Outputs Metrics */}
            <div className="space-y-6">
              <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider block border-b border-zinc-900 pb-2 font-bold">
                [Step 2] Live Safety Impact
              </span>

              {/* Vulnerability Score */}
              <div className="bg-zinc-950 border border-zinc-900 p-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Vulnerability Index Score</span>
                  <span className={`text-base font-black font-mono ${getTextColorForHazard(outputs.hazardLevel)}`}>
                    {outputs.hazardScore}/100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-none overflow-hidden">
                  <div
                    className="h-full bg-[#EF4444] transition-all duration-300"
                    style={{ width: `${outputs.hazardScore}%` }}
                  />
                </div>
              </div>

              {/* Escape Velocity */}
              <div className="bg-zinc-950 border border-zinc-900 p-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Pedestrian Escape Velocity</span>
                  <span className="text-base font-black font-mono text-zinc-200">
                    {outputs.evacuationVelocity}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-none overflow-hidden">
                  <div
                    className="h-full bg-[#F97316] transition-all duration-300"
                    style={{ width: `${outputs.evacuationVelocity}%` }}
                  />
                </div>
              </div>

              {/* Response Delay Box */}
              <div className="p-4 bg-zinc-950 border border-zinc-900 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider font-bold">Fire Tender Response Delay</span>
                  <p className="text-2xl font-black text-zinc-200 tracking-tight mt-0.5 font-mono">
                    +{outputs.tenderAccessMinutes} Min
                  </p>
                </div>
                <div className={`px-2.5 py-1 text-[9px] font-mono border ${getBorderColorForHazard(outputs.hazardLevel)} ${getTextColorForHazard(outputs.hazardLevel)} font-bold uppercase`}>
                  {outputs.tenderAccessMinutes > 10 ? "Severe Delay" : outputs.tenderAccessMinutes > 5 ? "Slow Access" : "Optimal"}
                </div>
              </div>

              {/* Description explanation */}
              <p className="text-zinc-400 text-xs leading-relaxed italic font-light p-3 border-l-2 border-[#EF4444] bg-zinc-950/20">
                &ldquo;{outputs.explanation}&rdquo;
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
