/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Compass, Layers, Maximize2, ShieldAlert } from "lucide-react";

export default function DelhiMap({ areas, selectedAreaId, onSelectArea }) {
  const [viewMode, setViewMode] = useState("3d");

  // Helper to get color code based on requirements hazard score for fire-based theme
  const getFireColor = (score) => {
    if (score >= 80) return "#EF4444"; // Red (Critical)
    if (score >= 55) return "#F97316"; // Orange (High)
    if (score >= 30) return "#F59E0B"; // Amber (Moderate)
    return "#FACC15"; // Warm Yellow (Low)
  };

  const getDistrictCode = (id) => {
    switch (id) {
      case "delhi_north": return "DL-N";
      case "delhi_north_west": return "DL-NW";
      case "delhi_west": return "DL-W";
      case "delhi_south_west": return "DL-SW";
      case "delhi_south": return "DL-S";
      case "delhi_south_east": return "DL-SE";
      case "delhi_new": return "DL-ND";
      case "delhi_central": return "DL-C";
      case "delhi_north_east": return "DL-NE";
      case "delhi_shahdara": return "DL-SH";
      case "delhi_east": return "DL-E";
      default: return id.substring(0, 5).toUpperCase();
    }
  };

  // Precise geographical boundary coordinates of Delhi NCT scaled to 400x400
  const delhi2DBoundary = [
    { x: 190, y: 35 },
    { x: 235, y: 45 },
    { x: 265, y: 65 },
    { x: 285, y: 90 },
    { x: 295, y: 130 },
    { x: 315, y: 165 },
    { x: 330, y: 200 },
    { x: 305, y: 245 },
    { x: 285, y: 290 },
    { x: 255, y: 325 },
    { x: 215, y: 355 },
    { x: 175, y: 365 },
    { x: 135, y: 345 },
    { x: 95, y: 305 },
    { x: 75, y: 245 },
    { x: 65, y: 185 },
    { x: 75, y: 125 },
    { x: 105, y: 85 },
    { x: 145, y: 55 },
  ];

  const yamuna2DPath = [
    { x: 255, y: 65 },
    { x: 265, y: 110 },
    { x: 260, y: 155 },
    { x: 270, y: 195 },
    { x: 285, y: 235 },
    { x: 305, y: 285 },
    { x: 315, y: 320 },
  ];

  // 2D polygons for official administrative districts of Delhi (geographically accurate contiguous shapes)
  const neighborhoodData = [
    {
      id: "delhi_north",
      name: "North Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 190, y: 35 },
        { x: 235, y: 45 },
        { x: 265, y: 65 },
        { x: 285, y: 90 },
        { x: 255, y: 110 },
        { x: 240, y: 155 },
        { x: 185, y: 135 },
        { x: 175, y: 95 }
      ],
      center: { x: 225, y: 95 }
    },
    {
      id: "delhi_north_west",
      name: "North West Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 190, y: 35 },
        { x: 175, y: 95 },
        { x: 185, y: 135 },
        { x: 150, y: 180 },
        { x: 95, y: 155 },
        { x: 75, y: 125 },
        { x: 105, y: 85 },
        { x: 145, y: 55 }
      ],
      center: { x: 135, y: 110 }
    },
    {
      id: "delhi_west",
      name: "West Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 150, y: 180 },
        { x: 185, y: 185 },
        { x: 165, y: 220 },
        { x: 115, y: 225 },
        { x: 75, y: 245 },
        { x: 65, y: 185 },
        { x: 95, y: 155 }
      ],
      center: { x: 115, y: 195 }
    },
    {
      id: "delhi_south_west",
      name: "South West Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 115, y: 225 },
        { x: 165, y: 220 },
        { x: 195, y: 265 },
        { x: 165, y: 310 },
        { x: 135, y: 345 },
        { x: 95, y: 305 },
        { x: 75, y: 245 }
      ],
      center: { x: 120, y: 285 }
    },
    {
      id: "delhi_south",
      name: "South Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 165, y: 310 },
        { x: 195, y: 265 },
        { x: 235, y: 275 },
        { x: 245, y: 335 },
        { x: 215, y: 355 },
        { x: 175, y: 365 },
        { x: 135, y: 345 }
      ],
      center: { x: 190, y: 325 }
    },
    {
      id: "delhi_south_east",
      name: "South East Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 235, y: 275 },
        { x: 195, y: 265 },
        { x: 215, y: 240 },
        { x: 260, y: 225 },
        { x: 285, y: 290 },
        { x: 255, y: 325 },
        { x: 245, y: 335 }
      ],
      center: { x: 245, y: 285 }
    },
    {
      id: "delhi_new",
      name: "New Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 165, y: 220 },
        { x: 185, y: 185 },
        { x: 215, y: 180 },
        { x: 230, y: 210 },
        { x: 215, y: 240 },
        { x: 195, y: 265 }
      ],
      center: { x: 195, y: 215 }
    },
    {
      id: "delhi_central",
      name: "Central Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 185, y: 135 },
        { x: 240, y: 155 },
        { x: 255, y: 110 },
        { x: 265, y: 155 },
        { x: 230, y: 210 },
        { x: 215, y: 180 },
        { x: 185, y: 185 }
      ],
      center: { x: 215, y: 165 }
    },
    {
      id: "delhi_north_east",
      name: "North East Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 255, y: 110 },
        { x: 285, y: 90 },
        { x: 295, y: 130 },
        { x: 315, y: 165 },
        { x: 285, y: 160 },
        { x: 265, y: 155 }
      ],
      center: { x: 285, y: 125 }
    },
    {
      id: "delhi_shahdara",
      name: "Shahdara",
      region: "NCT of Delhi",
      points: [
        { x: 285, y: 160 },
        { x: 315, y: 165 },
        { x: 330, y: 200 },
        { x: 295, y: 195 },
        { x: 270, y: 195 },
        { x: 265, y: 155 }
      ],
      center: { x: 295, y: 175 }
    },
    {
      id: "delhi_east",
      name: "East Delhi",
      region: "NCT of Delhi",
      points: [
        { x: 270, y: 195 },
        { x: 295, y: 195 },
        { x: 330, y: 200 },
        { x: 305, y: 245 },
        { x: 260, y: 225 }
      ],
      center: { x: 290, y: 215 }
    }
  ];

  // Mathematically precise isometric 3D projection function
  const project3D = (x, y, z = 0) => {
    const angle = Math.PI / 6; // 30 degrees tilt
    const cx = 200;
    const cy = 200;

    const dx = x - 200;
    const dy = y - 200;

    // Projected isometric coordinates
    const px = cx + (dx - dy) * Math.cos(angle);
    const py = cy - 30 + (dx + dy) * Math.sin(angle) - z; // subtract Z to project upwards

    return { x: px, y: py };
  };

  // Build the boundary path for Delhi NCT based on the view mode
  const getBoundaryPointsString = () => {
    if (viewMode === "2d") {
      return delhi2DBoundary.map(p => `${p.x},${p.y}`).join(" ");
    } else {
      return delhi2DBoundary.map(p => {
        const proj = project3D(p.x, p.y, 0);
        return `${proj.x},${proj.y}`;
      }).join(" ");
    }
  };

  // Build Yamuna River path based on view mode
  const getYamunaDPath = () => {
    const points = yamuna2DPath.map(p => {
      return viewMode === "2d" ? p : project3D(p.x, p.y, 0);
    });
    return `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(" ");
  };

  return (
    <div className="w-full flex flex-col bg-[#050505] border border-red-950/40 p-6 rounded-none relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.05)]" id="delhi-risk-map-container">
      {/* Background fire flare flicker effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#EF4444]/15 via-transparent to-[#EF4444]/0 pointer-events-none animate-fire-flicker" />
      
      {/* Flashing Hazard tape in the background */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#EF4444,#EF4444_10px,#000_10px,#000_20px)] opacity-60" />

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 z-10">
        <div>
          <span className="text-[10px] font-mono text-[#EF4444] uppercase tracking-[0.25em] font-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            [ACTIVE MUNICIPAL BREAKDOWN SYSTEM]
          </span>
          <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight font-display mt-0.5 animate-text-glitch">
            Delhi Burn Atlas
          </h3>
          <p className="text-zinc-500 text-[11px] mt-1 max-w-sm font-light">
            Vulnerability modeled as vertical hazard-density columns. Critical pockets are highlighted in flashing thermal red.
          </p>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex bg-zinc-950 p-1 border border-red-950/30 self-start sm:self-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <button
            onClick={() => setViewMode("2d")}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all ${
              viewMode === "2d"
                ? "bg-[#EF4444] text-white shadow-[0_0_10px_#EF4444]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            type="button"
          >
            2D Heat Grid
          </button>
          <button
            onClick={() => setViewMode("3d")}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all ${
              viewMode === "3d"
                ? "bg-[#EF4444] text-white shadow-[0_0_10px_#EF4444]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            type="button"
          >
            3D Stress Columns
          </button>
        </div>
      </div>

      {/* Map SVG Canvas Area */}
      <div className="relative w-full flex justify-center items-center bg-zinc-950 border border-red-950/30 h-[380px] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]" id="delhi-svg-canvas">
        {/* Architectural scientific grid lines with dim fire tint */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f0a0a_1px,transparent_1px),linear-gradient(to_bottom,#1f0a0a_1px,transparent_1px)] bg-[size:16px_16px] opacity-75 pointer-events-none" />

        {/* Severe hazard blinking indicator */}
        <div className="absolute top-3 right-3 bg-red-950/30 border border-red-600/30 px-2.5 py-1 text-[9px] font-mono text-red-500 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          OVERLOAD EXTREME (95/100 CC)
        </div>

        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full max-w-[380px] select-none cursor-crosshair relative z-10"
        >
          {/* Compass Rose with warning aesthetic */}
          <g transform="translate(50, 340)" className="opacity-30" stroke="#EF4444" strokeWidth="0.75" fill="none">
            <circle cx="0" cy="0" r="15" className="stroke-red-900/40" />
            <line x1="-20" y1="0" x2="20" y2="0" className="stroke-red-900/60" />
            <line x1="0" y1="-20" x2="0" y2="20" className="stroke-red-900/60" />
            <text x="-4" y="-23" className="text-[9px] font-mono fill-red-500 stroke-none font-bold">N</text>
          </g>

          {/* Delhi NCT Administrative Boundary Sheet */}
          <g className="transition-all duration-500">
            {/* Outline fill */}
            <polygon
              points={getBoundaryPointsString()}
              fill="#080505"
              stroke="#EF4444"
              strokeOpacity="0.15"
              strokeWidth="2"
              className="transition-all duration-500"
            />
            {/* Secondary concentric outline for 3D depth ring if in 3D */}
            {viewMode === "3d" && (
              <polygon
                points={delhi2DBoundary.map(p => {
                  const proj = project3D(p.x, p.y, -6);
                  return `${proj.x},${proj.y}`;
                }).join(" ")}
                fill="none"
                stroke="#1f0a0a"
                strokeWidth="1.5"
                className="opacity-40"
              />
            )}
          </g>

          {/* Yamuna River (styled as a thermal drainage thread) */}
          <path
            d={getYamunaDPath()}
            fill="none"
            stroke="#EF4444"
            strokeWidth={viewMode === "3d" ? "3" : "2"}
            strokeOpacity="0.3"
            className="transition-all duration-500"
          />

          {/* District Blocks / Neighborhoods */}
          {neighborhoodData.map((neigh) => {
            const areaState = areas.find((a) => a.id === neigh.id) || {
              hazardScore: 50,
              hazardLevel: "Moderate"
            };
            const isSelected = selectedAreaId === neigh.id;
            const scoreColor = getFireColor(areaState.hazardScore);

            // 3D parameters: Height scales with current vulnerability score (max height 80px)
            const height = viewMode === "3d" ? (areaState.hazardScore * 0.7) + 12 : 0;

            // Coordinate calculations for projection
            const b = neigh.points.map(p => viewMode === "3d" ? project3D(p.x, p.y, 0) : p);
            const t = neigh.points.map(p => viewMode === "3d" ? project3D(p.x, p.y, height) : p);

            // Projected center for tags
            const labelPos = viewMode === "3d" ? project3D(neigh.center.x, neigh.center.y, height) : neigh.center;

            return (
              <g
                key={neigh.id}
                onClick={() => onSelectArea(neigh.id)}
                className="group cursor-pointer"
              >
                {viewMode === "2d" ? (
                  /* --- 2D Flat Mode --- */
                  <polygon
                    points={b.map(p => `${p.x},${p.y}`).join(" ")}
                    fill={`${scoreColor}${isSelected ? "77" : "33"}`}
                    stroke={isSelected ? "#FFFFFF" : scoreColor}
                    strokeWidth={isSelected ? 2 : 1.2}
                    className="transition-all duration-300 hover:fill-opacity-50"
                    style={isSelected ? { filter: `drop-shadow(0 0 10px ${scoreColor})` } : {}}
                  />
                ) : (
                  /* --- 3D Isometric Mode --- */
                  <g className="transition-all duration-300">
                    {/* Shadow / Footprint under block */}
                    <polygon
                      points={b.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="#000000"
                      fillOpacity="0.8"
                    />

                    {/* Side Extrusion Faces for each edge */}
                    {b.map((bp, i) => {
                      const nextIdx = (i + 1) % b.length;
                      const tp = t[i];
                      const nextBp = b[nextIdx];
                      const nextTp = t[nextIdx];
                      
                      // Calculate dynamic 3D shading based on slope angle
                      const dx = nextBp.x - bp.x;
                      const dy = nextBp.y - bp.y;
                      const angle = Math.abs(Math.atan2(dy, dx));
                      const shadeOpacity = 0.15 + (angle / Math.PI) * 0.35; // beautifully shaded between 0.15 and 0.50

                      return (
                        <g key={i}>
                          <polygon
                            points={`${bp.x},${bp.y} ${tp.x},${tp.y} ${nextTp.x},${nextTp.y} ${nextBp.x},${nextBp.y}`}
                            fill={scoreColor}
                            fillOpacity={isSelected ? 0.9 : 0.65}
                            className="transition-colors duration-300"
                          />
                          <polygon
                            points={`${bp.x},${bp.y} ${tp.x},${tp.y} ${nextTp.x},${nextTp.y} ${nextBp.x},${nextBp.y}`}
                            fill="#000000"
                            fillOpacity={shadeOpacity}
                          />
                        </g>
                      );
                    })}

                    {/* Top Face of Block */}
                    <polygon
                      points={t.map(p => `${p.x},${p.y}`).join(" ")}
                      fill={scoreColor}
                      stroke={isSelected ? "#FFFFFF" : `${scoreColor}CC`}
                      strokeWidth={isSelected ? 2 : 0.75}
                      className="transition-all duration-300"
                      style={isSelected ? { filter: `brightness(1.2) drop-shadow(0 0 12px ${scoreColor})` } : {}}
                    />
                  </g>
                )}

                {/* Center marker dot */}
                <circle
                  cx={labelPos.x}
                  cy={labelPos.y}
                  r="3.5"
                  fill={isSelected ? "#FFF" : scoreColor}
                  stroke="#0A0A0A"
                  strokeWidth="1"
                  className="transition-all duration-300"
                />

                {/* Floating neighborhood code tag with neon drop shadow */}
                <text
                  x={labelPos.x}
                  y={labelPos.y - 10}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-zinc-200 select-none pointer-events-none font-black uppercase tracking-wider"
                  style={{ textShadow: `0px 0px 4px ${scoreColor}, 1px 1px 2px #000` }}
                >
                  {getDistrictCode(neigh.id)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Area HUD Overlay */}
        {selectedAreaId && (() => {
          const selectedArea = areas.find((a) => a.id === selectedAreaId);
          if (!selectedArea) return null;
          const config = neighborhoodData.find((n) => n.id === selectedAreaId);
          return (
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 bg-zinc-950/95 border border-red-950 p-2.5 sm:p-3.5 flex justify-between items-center z-20 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <div>
                <span className="text-[9px] font-mono text-[#EF4444] font-black uppercase tracking-widest block">
                  SYSTEM BREAKDOWN: {config?.region || "Delhi Block"}
                </span>
                <h4 className="text-xs font-black text-zinc-100 uppercase mt-0.5">
                  {selectedArea.name}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">FAILURE RISK</span>
                <span 
                  className="text-xs font-black font-mono tracking-tight"
                  style={{ color: getFireColor(selectedArea.hazardScore) }}
                >
                  {selectedArea.hazardScore}/100 ({selectedArea.hazardLevel.toUpperCase()})
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Scale guide */}
      <div className="mt-4 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-[#EF4444]/60" />
          Grid: Sector Calibration Compliant
        </span>
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#F97316]/60" />
          Flicker Map Mode: Thermal Intensity Active
        </span>
      </div>
    </div>
  );
}
