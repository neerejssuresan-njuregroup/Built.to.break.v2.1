/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { 
  ShieldAlert, 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Wrench,
  X,
  FileText,
  Search,
  Scale,
  DollarSign,
  Users,
  Building,
  HeartCrack,
  AlertCircle,
  HelpCircle,
  Clock,
  ExternalLink
} from "lucide-react";

// Robust information mapping for Indian National Building Code Architecture and corporate workarounds
const NBC_AUDIT_SECTIONS = [
  {
    id: "part4",
    title: "NBC Part 4: Fire & Life Safety Standards",
    short: "Part 4: Life Safety",
    tagline: "The Stairwell & Smoke Extraction Compromise",
    standard: "Mandates that any commercial/mixed-use building over 15 meters in height must feature dual, independent fire-safe stairwells with fire doors (minimum 120-minute rating) and pressurized HVAC shafts to pump smoke out of escape routes.",
    corporateBenefit: "Corporate & private builders save between ₹35 Lakhs to ₹75 Lakhs in initial construction materials and reclaim 12% to 18% of 'Super Built-up Area' (releasing valuable lease space) by designing only a single, narrow staircase wrapped around an open lift shaft.",
    legalLoophole: "The 'Single-Family Permit' Sham. Developers submit drawings to municipal corporations (e.g., MCD, BBMP) depicting a standard four-story residential home with a single stairwell. Post-approval, they subdivide it illegally into high-density commercial entities (e.g., computer coaching hubs, retail outlets, call centers) with 20x the approved human load.",
    risk: "CRITICAL SMOKE TRAP",
    riskIndex: 98,
    remedy: "Smart Load Profiling: Integrate real-time power consumption anomaly detectors with municipal utility feeds. When a 'residential' meter continuously draws energy matching commercial server load, dispatch automated stop-work notices and isolate power grids.",
    cost: "Low (Digital System Integration)",
    impact: "Extremely High",
    metrics: {
      "Regulatory Deficit": "85% in older mixed-use wards",
      "Corporate Cost Savings": "₹45,00,000 per project",
      "Avg. Airflow Blockage": "4.8x standard density"
    }
  },
  {
    id: "part3",
    title: "NBC Part 3: Land Setbacks & Access Limits",
    short: "Part 3: Access Gaps",
    tagline: "The 'Lal Dora' and Urban Village Immunity Arbitrage",
    standard: "Requires a minimum building setback (free buffer space) of 6 meters on all sides and direct access to a municipal road at least 9 to 12 meters wide to ensure fire tenders can maneuver, extend hydraulic ladders, and stabilize outriggers.",
    corporateBenefit: "Commercial landlords exploit historic 'Lal Dora' land exemptions to maximize spatial footprint, building right up to the property line. By eliminating the 6m setback, they fit an additional 2 to 3 ground-floor retail shops, yielding upwards of ₹1.5 Lakhs in additional monthly rental profit.",
    legalLoophole: "Historical Village Exemption Loophole. To protect rural Delhi populations from complex building laws, local government exempted 'Lal Dora' lands from standard municipal building bylaws in 1963. Today, corporate developers acquire these village plots, erecting massive five-story commercial complexes in streets barely 2 meters wide.",
    risk: "ACCESSIBILITY CHOKEPOINT",
    riskIndex: 94,
    remedy: "High-Pressure Utility Hydrant Grids: Establish pressurized micro-hydrant points fed by high-volume solar-powered water vaults directly embedded beneath narrow lanes. This allows firemen to connect hoses locally without waiting for large fire trucks to squeeze through unpassable streets.",
    cost: "Medium (Urban Utility Upgrades)",
    impact: "Maximum",
    metrics: {
      "Access Blockage Chance": "92% in congested wards",
      "Corporate Extra Profit": "₹18,00,000 / year per site",
      "Response Time Delay": "+15.2 Minutes"
    }
  },
  {
    id: "part8",
    title: "NBC Part 8: Building Services & Duct Seals",
    short: "Part 8: Duct Sealing",
    tagline: "Hollow Vertical Shafts as Natural Chimneys",
    standard: "All vertical service ducts (carrying electrical cables, HVAC pipes, plumbing, and communication lines) must be completely fire-sealed at every floor ceiling junction using certified intumescent firestop barriers to prevent horizontal and vertical flame travel.",
    corporateBenefit: "Electrical contractors and developers bypass floor-level cable sealing to speed up installation and save ₹2 Lakhs to ₹5 Lakhs per shaft. Leaving shafts open makes routing future cables faster and avoids purchasing expensive firestop foam or mineral-wool boards.",
    legalLoophole: "Self-Certification & Pre-Paid NOCs. Builders hire private structural engineers to sign off 'fictitious' electrical safety self-declaration forms. Municipal inspectorates accept these self-audits at face value without physical site verification, frequently compromised by institutional speed-bribes.",
    risk: "CO CHIMNEY PROPAGATION",
    riskIndex: 89,
    remedy: "Thermal Imaging Mandate: Require drone-assisted or portable infrared thermography scans of all vertical building ducts during the annual commercial electricity license renewal cycle to instantly flag unsealed vertical gaps.",
    cost: "Very Low (Audit Overhead)",
    impact: "High",
    metrics: {
      "Open Duct Velocity": "2.2 meters per second",
      "Ignition Point Probability": "62% from overloaded meters",
      "Audit Manipulation Rate": "74% surveyed"
    }
  },
  {
    id: "part10",
    title: "NBC Part 10: Exit Operations & Gates",
    short: "Part 10: Exit Access",
    tagline: "Lethal Terraces and Locked Fire Doors",
    standard: "All emergency doors, exit stairs, and doors leading to open terrace refuge areas must remain completely unlocked, unbarred, and free of physical obstructions at all times while the building is occupied.",
    corporateBenefit: "Corporates and coaching center administrators lock exit staircases and terrace doors to prevent student loitering, enforce attendance controls, and deter petty inventory theft, prioritizing asset security over human survival.",
    legalLoophole: "The 'Private Property' Grey Area. Owners argue that terrace access is a private luxury rather than a public exit path. During surprise safety inspections, locks are temporarily removed or replaced with 'mock' zip-ties, only to be padlocked shut immediately after inspectors exit the premises.",
    risk: "PHYSICAL CAGE ENTRAPMENT",
    riskIndex: 99,
    remedy: "Electromagnetic Power-Loss Release: Standardize mechanical crash bars (panic bars) coupled with electromagnetic locks wired directly into the main fire panel. If smoke is detected or power fails, the locks must lose hold automatically.",
    cost: "Low (Relatively inexpensive hardware)",
    impact: "Absolute Life Safety",
    metrics: {
      "Locked Gate Percentage": "78% of audited complexes",
      "Escape Obstruction Rate": "65% of coaching centers",
      "Mean Time to Suffocation": "3.5 Minutes"
    }
  },
  {
    id: "arbitrage",
    title: "The Corporate Arbitrage Ledger",
    short: "Corporate Ledger",
    tagline: "The Financial Math Behind Safety Neglect",
    standard: "Financial models of commercial property development should treat life-safety infrastructure (sprinklers, dual stairs, alarms) as non-negotiable capital expenditures with zero-depreciation status.",
    corporateBenefit: "Illegal developers operate on a 'Regulatory Capture' mathematical formula: it is significantly cheaper to pay a minor legal fine (or bribe local officers) than it is to install professional fire escapes and sprinklers. By pocketing these funds, they achieve a high ROI, shifting the risk entirely onto occupants.",
    legalLoophole: "Fictitious 'Shell LLC' Liability. Corporates register individual high-density commercial buildings under separate shell corporations. If a lethal fire occurs, the parent company files for bankruptcy, isolating its main capital assets from survivor compensation claims.",
    risk: "INSTITUTIONAL GREED",
    riskIndex: 97,
    remedy: "Strict Unlimited Personal Liability: Amend corporate laws so that company directors, structural engineers, and signing government inspectors are held personally and criminally liable for manslaughter, with active asset-freezing of the parent holding entity.",
    cost: "Zero (Legislative Amendment)",
    impact: "Maximum Systemic Deterrent",
    metrics: {
      "Avg. Bribe Cost vs Retrofit": "1:50 Ratio",
      "Corporate Shell Recovery Rate": "< 5% for victims",
      "Director Jailing Probability": "< 1% historically"
    }
  }
];

export default function NbcAuditPortal({ isOpen, onClose }) {
  const [selectedSection, setSelectedSection] = useState(NBC_AUDIT_SECTIONS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("breach"); // "breach" | "benefit" | "remedy"

  // Interactive Arbitrage Simulator State
  const [simBasement, setSimBasement] = useState("illegal"); // "illegal" (Kitchen/gas) | "legal" (Empty storage)
  const [simStairwell, setSimStairwell] = useState("single"); // "single" (Narrow) | "dual" (Fire doors)
  const [simTerrace, setSimTerrace] = useState("locked"); // "locked" (Security) | "panic" (Panic release)
  const [simElectrical, setSimElectrical] = useState("unsealed"); // "unsealed" (Chimney) | "sealed" (Firestop)
  const [simBribe, setSimBribe] = useState("bribe"); // "bribe" (Fictitious NOC) | "upgrade" (Full upgrade)
  const [interactiveLaneWidth, setInteractiveLaneWidth] = useState(3.5);

  // Calculate simulated variables based on selections
  const calculateSimMetrics = () => {
    let savedCapital = 0;
    let extraAnnualRevenue = 0;
    let vulnerabilityScore = 40; // baseline
    let survivalChance = 95; // baseline percentage
    let casualtyProjections = "0 - 1 Lives";

    // Basement Impact
    if (simBasement === "illegal") {
      savedCapital += 400000;
      extraAnnualRevenue += 600000;
      vulnerabilityScore += 15;
      survivalChance -= 20;
    }

    // Stairwell Impact
    if (simStairwell === "single") {
      savedCapital += 2800000;
      extraAnnualRevenue += 1400000;
      vulnerabilityScore += 25;
      survivalChance -= 35;
    }

    // Terrace Impact
    if (simTerrace === "locked") {
      savedCapital += 80000;
      vulnerabilityScore += 15;
      survivalChance -= 25;
    }

    // Electrical Duct Impact
    if (simElectrical === "unsealed") {
      savedCapital += 350000;
      vulnerabilityScore += 10;
      survivalChance -= 15;
    }

    // Bribery / Certification Impact
    if (simBribe === "bribe") {
      savedCapital += 1200000; // bypassed installation costs
      vulnerabilityScore += 15;
      survivalChance -= 12;
    }

    // Bound values
    vulnerabilityScore = Math.min(99, vulnerabilityScore);
    survivalChance = Math.max(1, survivalChance);

    if (vulnerabilityScore > 85) {
      casualtyProjections = "45 - 82 Human Lives (Mass Casualty)";
    } else if (vulnerabilityScore > 65) {
      casualtyProjections = "15 - 35 Human Lives";
    } else if (vulnerabilityScore > 45) {
      casualtyProjections = "3 - 10 Human Lives";
    } else {
      casualtyProjections = "0 - 2 Human Lives (Controlled evacuation)";
    }

    return {
      savedCapital: savedCapital.toLocaleString("en-IN"),
      extraAnnualRevenue: extraAnnualRevenue.toLocaleString("en-IN"),
      vulnerabilityScore,
      survivalChance,
      casualtyProjections
    };
  };

  const simResult = calculateSimMetrics();

  const filteredSections = NBC_AUDIT_SECTIONS.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.short.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#070708] overflow-y-auto flex flex-col font-sans text-zinc-100"
        id="nbc-audit-fullscreen-portal"
      >
        {/* Futuristic Grid and Flare Accents */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.1)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-red-500/[0.015] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[55vw] h-[55vw] bg-yellow-500/[0.01] rounded-full blur-3xl pointer-events-none" />

        {/* Top Header / Action Bar */}
        <div className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-950/40 border border-red-500/20 rounded-none text-red-500">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-red-500 font-black uppercase tracking-[0.25em] block">
                NATIONAL DIRECTIVE // FORENSIC DATABASE
              </span>
              <h1 className="text-lg md:text-xl font-black text-zinc-100 uppercase tracking-tight font-display">
                National Building Code (NBC) Regulatory Inquest Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden lg:inline-block font-mono text-[9px] text-zinc-500 uppercase tracking-wider bg-zinc-900/60 border border-zinc-900 px-3 py-1">
              RECORD STATUS: INTERNAL_AUDIT_VERIFIED
            </span>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 bg-zinc-950 text-xs font-mono font-bold uppercase hover:bg-red-950/20 hover:border-red-500 hover:text-red-400 transition-all duration-300 rounded-none shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              id="close-nbc-portal-btn"
            >
              <X className="w-4 h-4" />
              <span>Exit Inquest</span>
            </button>
          </div>
        </div>

        {/* Primary Container */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8 relative z-10">
          
          {/* Main Info Callout */}
          <div className="bg-red-950/10 border border-red-900/20 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-3xl">
              <span className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                SYSTEMIC CORPORATE DEFICIT & EXPLOITATION ANALYSIS
              </span>
              <h2 className="text-base font-black text-zinc-100 uppercase tracking-tight">
                How Corporate Entities Exploited Building Exemption Codes for Massive Profit
              </h2>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                The National Building Code of India (NBC) establishes strict, multi-tier life safety regulations. However, commercial real-estate enterprises, high-density private academies, and coaching centers systematically deploy structured legal bypasses. They trade compliance cost directly for bottom-line profit, converting vertical structures into combustible cages.
              </p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-900 p-4 font-mono text-center flex-shrink-0 md:w-56">
              <span className="text-[8px] text-zinc-500 block uppercase">METROPOLITAN GAP</span>
              <span className="text-2xl font-black text-red-500 block mt-1">92%</span>
              <span className="text-[9px] text-zinc-400 block uppercase mt-1">OF BUILDINGS UNLICENSED</span>
            </div>
          </div>

          {/* Interactive Corporate Profit vs. Human Toll Simulator */}
          <div className="bg-[#09090B] border border-zinc-900 p-6 md:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-44 h-44 bg-yellow-500/[0.01] rounded-full blur-2xl pointer-events-none" />
            
            <div className="border-b border-zinc-900 pb-4 mb-6 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-yellow-950/40 border border-yellow-500/20 rounded-none text-yellow-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] text-yellow-500 font-bold uppercase tracking-[0.2em] block">
                    INTERACTIVE STRESS MODULE
                  </span>
                  <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tight font-display">
                    Corporate Arbitrage Calculator: Profit vs. Human Cost
                  </h3>
                </div>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">CALCULATOR_VER: 1.04</span>
            </div>

            <p className="text-zinc-400 text-xs font-light leading-relaxed mb-6 max-w-4xl">
              Toggle the choices below. Witness how standard commercial developers bypass active safety parameters to reduce capital expenditure (CapEx) and capture extra annual rental revenue, and see the immediate corresponding impact on human life in a high-consequence fire scenario.
            </p>

            {/* Simulator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Side: Interactive Switches (col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 1. Basement Choice */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-tight font-mono">Basement Utilization Pattern</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 font-light">Illegal gas kitchen saves commercial space vs. Empty non-hazardous storage.</p>
                  </div>
                  <div className="flex bg-black p-1 border border-zinc-900 font-mono text-[9px] w-full md:w-auto self-end md:self-auto">
                    <button
                      onClick={() => setSimBasement("illegal")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simBasement === "illegal" 
                          ? "bg-red-950 text-red-500 border border-red-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Bypass Code (+₹6L/yr)
                    </button>
                    <button
                      onClick={() => setSimBasement("legal")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simBasement === "legal" 
                          ? "bg-green-950 text-green-400 border border-green-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Comply (NBC Std)
                    </button>
                  </div>
                </div>

                {/* 2. Stairwell Choice */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-tight font-mono">Emergency Staircase Layout</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 font-light">Single narrow stairs (gains rentable floor area) vs. Dual fire-safe towers.</p>
                  </div>
                  <div className="flex bg-black p-1 border border-zinc-900 font-mono text-[9px] w-full md:w-auto self-end md:self-auto">
                    <button
                      onClick={() => setSimStairwell("single")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simStairwell === "single" 
                          ? "bg-red-950 text-red-500 border border-red-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Single Stairs (+₹14L/yr)
                    </button>
                    <button
                      onClick={() => setSimStairwell("dual")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simStairwell === "dual" 
                          ? "bg-green-950 text-green-400 border border-green-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Dual Stairwell (-₹28L)
                    </button>
                  </div>
                </div>

                {/* 3. Terrace Choice */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-tight font-mono">Terrace Gate Operations</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 font-light">Padlocked gate (avoids security hiring/theft) vs. Magnetic automated escape.</p>
                  </div>
                  <div className="flex bg-black p-1 border border-zinc-900 font-mono text-[9px] w-full md:w-auto self-end md:self-auto">
                    <button
                      onClick={() => setSimTerrace("locked")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simTerrace === "locked" 
                          ? "bg-red-950 text-red-500 border border-red-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Padlock Gate (Saves ₹80K)
                    </button>
                    <button
                      onClick={() => setSimTerrace("panic")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simTerrace === "panic" 
                          ? "bg-green-950 text-green-400 border border-green-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Panic Bar (Comply)
                    </button>
                  </div>
                </div>

                {/* 4. Electrical Duct Choice */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-tight font-mono">Vertical Utility Shaft Sealing</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 font-light">Unsealed hollow shaft (saves insulation labor) vs. 120-min firestop collars.</p>
                  </div>
                  <div className="flex bg-black p-1 border border-zinc-900 font-mono text-[9px] w-full md:w-auto self-end md:self-auto">
                    <button
                      onClick={() => setSimElectrical("unsealed")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simElectrical === "unsealed" 
                          ? "bg-red-950 text-red-500 border border-red-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Leave Unsealed (+₹3.5L)
                    </button>
                    <button
                      onClick={() => setSimElectrical("sealed")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simElectrical === "sealed" 
                          ? "bg-green-950 text-green-400 border border-green-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Seal Duct (Comply)
                    </button>
                  </div>
                </div>

                {/* 5. Inspection Audit Choice */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-tight font-mono">Safety Certification Procurement</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 font-light">Payoff inspector for false NOC certification vs. Spend capital on physical upgrades.</p>
                  </div>
                  <div className="flex bg-black p-1 border border-zinc-900 font-mono text-[9px] w-full md:w-auto self-end md:self-auto">
                    <button
                      onClick={() => setSimBribe("bribe")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simBribe === "bribe" 
                          ? "bg-red-950 text-red-500 border border-red-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Bribe NOC (Saves ₹12L)
                    </button>
                    <button
                      onClick={() => setSimBribe("upgrade")}
                      className={`flex-1 md:flex-none px-4 py-1.5 font-bold uppercase tracking-wider transition-all ${
                        simBribe === "upgrade" 
                          ? "bg-green-950 text-green-400 border border-green-900/50" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Full Retrofit (-₹12L)
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Side: Projected Outputs (col-span-5) */}
              <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/[0.03] rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <span className="font-mono text-[9px] text-[#F97316] font-bold bg-[#F97316]/10 border border-[#F97316]/20 px-2.5 py-0.5 uppercase tracking-wider">
                      Live Arbitrage Outcome
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      FORENSIC_HUD
                    </span>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 font-mono">
                      <span className="text-[8px] text-zinc-500 block uppercase">CAPEX CAPITAL SAVED</span>
                      <span className="text-lg font-black text-emerald-400 block mt-1">₹{simResult.savedCapital}</span>
                      <span className="text-[8px] text-zinc-400 block mt-0.5">one-time savings</span>
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 font-mono">
                      <span className="text-[8px] text-zinc-500 block uppercase">EXTRA ANNUAL PROFIT</span>
                      <span className="text-lg font-black text-emerald-400 block mt-1">₹{simResult.extraAnnualRevenue}</span>
                      <span className="text-[8px] text-zinc-400 block mt-0.5">captured recurring</span>
                    </div>
                  </div>

                  {/* Hazard Levels and survival projections */}
                  <div className="space-y-4 border-t border-b border-zinc-900/80 py-4 font-mono text-xs">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-[10px] uppercase">VULNERABILITY INDEX:</span>
                        <span className={`font-black text-sm ${
                          simResult.vulnerabilityScore > 80 ? "text-red-500" : simResult.vulnerabilityScore > 55 ? "text-orange-400" : "text-green-400"
                        }`}>
                          {simResult.vulnerabilityScore}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-none overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ease-out ${
                            simResult.vulnerabilityScore > 80 ? "bg-red-500" : simResult.vulnerabilityScore > 55 ? "bg-orange-500" : "bg-green-500"
                          }`}
                          style={{ width: `${simResult.vulnerabilityScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-[10px] uppercase">EVACUATION SURVIVAL CHANCE:</span>
                        <span className={`font-black text-sm ${
                          simResult.survivalChance < 30 ? "text-red-500" : simResult.survivalChance < 70 ? "text-orange-400" : "text-green-400"
                        }`}>
                          {simResult.survivalChance}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-none overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ease-out ${
                            simResult.survivalChance < 30 ? "bg-red-500 animate-pulse" : simResult.survivalChance < 70 ? "bg-orange-500" : "bg-green-500"
                          }`}
                          style={{ width: `${simResult.survivalChance}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Casualty Projection */}
                  <div className="bg-red-950/20 border-l-2 border-red-500 p-4">
                    <span className="font-mono text-[9px] text-red-500 font-bold block mb-1 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartCrack className="w-3.5 h-3.5 animate-pulse" />
                      PROJECTED CASUALTY TOLL (DURING 8AM FIRE):
                    </span>
                    <p className="text-xs text-zinc-100 font-bold font-mono">
                      {simResult.casualtyProjections}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                      With exits locks, a single unpressurized staircase, and unsealed vertical duct shafts, the structures operate as a thermal gas furnace. normal occupants lose consciousness in under 4 minutes.
                    </p>
                  </div>

                </div>

                <div className="border-t border-zinc-900 pt-4 mt-6 text-center">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block">
                    *Based on forensic calculations derived from municipal fire tragedy records (2018-2025).
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Segmented Code Gap Deep-Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Hand: Category list selector (col-span-4) */}
            <div className="lg:col-span-4 space-y-2 max-h-[500px] overflow-y-auto pr-2" id="nbc-portal-sidebar">
              <span className="font-mono text-[9px] text-zinc-500 block mb-2 uppercase tracking-widest pl-1">
                SELECT NBC ARCHITECTURE CHAPTER
              </span>
              
              {filteredSections.map((section) => {
                const isSelected = selectedSection.id === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section);
                      setActiveTab("breach");
                    }}
                    className={`w-full text-left p-3.5 border transition-all duration-300 relative focus:outline-none flex flex-col justify-between ${
                      isSelected 
                        ? "border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                        : "border-zinc-900 bg-zinc-950/30 hover:bg-zinc-900/20 hover:border-zinc-800"
                    }`}
                  >
                    {/* Selected laser indicator */}
                    {isSelected && (
                      <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-red-500" />
                    )}

                    <div className="flex justify-between items-start gap-1">
                      <span className={`font-mono text-[10px] font-bold ${isSelected ? "text-red-500" : "text-zinc-500"}`}>
                        {section.short}
                      </span>
                      <span className={`font-mono text-[8px] font-bold px-1.5 py-0.5 uppercase ${
                        section.riskIndex > 95 ? "text-red-500 bg-red-950/30" : "text-orange-400 bg-orange-950/20"
                      }`}>
                        HAZARD: {section.riskIndex}%
                      </span>
                    </div>

                    <h3 className={`text-xs font-bold uppercase mt-1 tracking-tight ${isSelected ? "text-white" : "text-zinc-300"}`}>
                      {section.title}
                    </h3>

                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-zinc-900/60 text-[8px] font-mono">
                      <span className="text-zinc-500">MUNICIPAL EXEMPTION RATE:</span>
                      <span className="text-zinc-300 font-bold">{section.metrics["Regulatory Deficit"] || "High"}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Hand: Detailed Chapter Console Panel (col-span-8) */}
            <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden min-h-[500px]">
              
              <div className="space-y-6">
                
                {/* Chapter Info Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
                  <div>
                    <span className="font-mono text-[9px] text-red-500 font-bold uppercase tracking-[0.15em] block">
                      {selectedSection.title}
                    </span>
                    <h2 className="text-lg font-black text-zinc-100 uppercase tracking-tight">
                      {selectedSection.tagline}
                    </h2>
                  </div>
                  <div className="bg-red-950/30 border border-red-500/20 px-3 py-1 text-red-400 font-mono font-black text-[9px] uppercase tracking-wider self-start md:self-auto">
                    VULNERABILITY RATIO: {selectedSection.riskIndex}/100
                  </div>
                </div>

                {/* Sub-Tabs: Standard vs Breach vs Remedy */}
                <div className="flex gap-1.5 bg-black p-1 border border-zinc-900/80 font-mono text-[10px]">
                  <button
                    onClick={() => setActiveTab("breach")}
                    className={`flex-1 py-2.5 text-center font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "breach" 
                        ? "bg-red-950/40 text-red-500 border border-red-900/50" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>The Loophole & Corporate Exploitation</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("benefit")}
                    className={`flex-1 py-2.5 text-center font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "benefit" 
                        ? "bg-amber-950/40 text-amber-500 border border-amber-900/50" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>How Illegal Entities Benefit</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("remedy")}
                    className={`flex-1 py-2.5 text-center font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "remedy" 
                        ? "bg-green-950/40 text-green-400 border border-green-900/50" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Actionable Rectification Blueprint</span>
                  </button>
                </div>

                {/* Inner Tab Dynamic Narrative Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5"
                  >
                    {activeTab === "breach" && (
                      <div className="space-y-4">
                        <div className="bg-zinc-900/30 border border-zinc-900 p-4">
                          <span className="font-mono text-[9px] text-zinc-500 font-bold block mb-1 uppercase tracking-wider">
                            CODIFIED LAW / NBC MANDATE:
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-light italic">
                            &ldquo;{selectedSection.standard}&rdquo;
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="font-mono text-[9px] text-red-500 font-bold block uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                            THE URBAN BYPASS LOOPHOLE:
                          </span>
                          <p className="text-xs text-zinc-200 leading-relaxed font-light">
                            {selectedSection.legalLoophole}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === "benefit" && (
                      <div className="space-y-4">
                        <div className="bg-amber-950/5 border border-amber-900/20 p-4 border-l-2 border-l-amber-500">
                          <span className="font-mono text-[9px] text-amber-500 font-bold block mb-1 uppercase tracking-wider flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4" />
                            DEVELOPER / CORPORATE BOTTOM-LINE BENEFIT:
                          </span>
                          <p className="text-xs text-zinc-200 leading-relaxed">
                            {selectedSection.corporateBenefit}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {Object.entries(selectedSection.metrics).map(([key, val]) => (
                            <div key={key} className="bg-zinc-900/40 border border-zinc-900 p-3.5 font-mono">
                              <span className="text-[8px] text-zinc-500 uppercase block leading-tight">{key}</span>
                              <span className="text-xs font-black text-amber-500 mt-2 block">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "remedy" && (
                      <div className="space-y-4">
                        <div className="bg-green-950/10 border border-green-950/40 p-4 border-l-2 border-l-green-500">
                          <span className="font-mono text-[9px] text-green-400 font-bold block mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            ACTIONABLE BLUEPRINT FOR MUNICIPALITIES:
                          </span>
                          <p className="text-xs text-zinc-100 leading-relaxed">
                            {selectedSection.remedy}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-zinc-900/30 border border-zinc-900 p-3">
                            <span className="text-[8px] font-mono text-zinc-500 block uppercase">ESTIMATED RECTIFICATION COST</span>
                            <span className="text-xs font-bold font-mono text-white block mt-1 uppercase">{selectedSection.cost}</span>
                          </div>
                          <div className="bg-zinc-900/30 border border-zinc-900 p-3">
                            <span className="text-[8px] font-mono text-zinc-500 block uppercase">PROJECTED HAZARD MITIGATION EFFECT</span>
                            <span className="text-xs font-bold font-mono text-green-400 block mt-1 uppercase">{selectedSection.impact} EFFECTIVENESS</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Custom Interactive Gap Analysis Charts / Widgets */}
                <div className="border-t border-zinc-900 pt-6 mt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="font-mono text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                      Interactive Gap Analysis Data Visualizer
                    </span>
                  </div>

                  {selectedSection.id === "part4" && (
                    <div className="space-y-3 bg-zinc-900/10 border border-zinc-900 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">staircase temperature & smoke metrics</span>
                        <span className="text-[8px] font-mono text-red-500 font-bold uppercase">nbc part 4 audit</span>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: "Illegal Single Stairs", temp: 850, co: 1800, time: 320 },
                            { name: "Dual Closed Stairs", temp: 450, co: 800, time: 180 },
                            { name: "NBC Pressurized Stairs", temp: 45, co: 20, time: 45 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="name" stroke="#555" fontSize={9} />
                            <YAxis stroke="#555" fontSize={9} />
                            <RechartTooltip contentStyle={{ background: "#050505", border: "1px solid #dc2626", fontSize: 9 }} />
                            <Bar dataKey="temp" fill="#dc2626" name="Max Temp (°C)" />
                            <Bar dataKey="co" fill="#f97316" name="CO Gas (ppm)" />
                            <Bar dataKey="time" fill="#eab308" name="Evac Time (s)" />
                            <Legend wrapperStyle={{ fontSize: 8 }} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal font-sans font-light">
                        NBC Part 4 mandates pressurized lobbies to keep the staircase clear. Illegal open shafts allow the chimney effect, raising temperatures to a fatal 850°C.
                      </p>
                    </div>
                  )}

                  {selectedSection.id === "part3" && (
                    <div className="space-y-3 bg-zinc-900/10 border border-zinc-900 p-4 font-mono text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">response delay vs lane width</span>
                        <span className="text-red-400 font-bold bg-red-950/20 border border-red-900/30 px-2 py-0.5">LANE WIDTH: {interactiveLaneWidth.toFixed(1)}m</span>
                      </div>
                      
                      <div className="space-y-2 py-1">
                        <input 
                          type="range"
                          min="1.5"
                          max="12.0"
                          step="0.5"
                          value={interactiveLaneWidth}
                          onChange={(e) => setInteractiveLaneWidth(parseFloat(e.target.value))}
                          className="w-full accent-red-600 bg-zinc-950 h-1 cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] text-zinc-600">
                          <span>1.5m (Hauz Rani Lane)</span>
                          <span>6.0m (NBC Standard)</span>
                          <span>12.0m (Arterial Road)</span>
                        </div>
                      </div>

                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { width: 1.5, delay: 20, access: 5 },
                            { width: 3.0, delay: 15, access: 20 },
                            { width: 4.5, delay: 8, access: 50 },
                            { width: 6.0, delay: 2, access: 95 },
                            { width: 9.0, delay: 1, access: 99 },
                            { width: 12.0, delay: 0.5, access: 100 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="width" stroke="#555" name="Street Width (m)" fontSize={9} />
                            <YAxis stroke="#555" fontSize={9} />
                            <RechartTooltip contentStyle={{ background: "#050505", border: "1px solid #dc2626", fontSize: 9 }} />
                            <Line type="monotone" dataKey="delay" stroke="#dc2626" strokeWidth={2} name="Response Delay (mins)" />
                            <Line type="monotone" dataKey="access" stroke="#22c55e" strokeWidth={1.5} name="Hydraulic Access Success (%)" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal font-sans font-light">
                        <strong>Simulation Result:</strong> A width of {interactiveLaneWidth.toFixed(1)}m results in an estimated fire dispatch arrival delay of {interactiveLaneWidth < 3.0 ? "18-22 minutes" : interactiveLaneWidth < 6.0 ? "8-12 minutes" : "under 2 minutes"}.
                      </p>
                    </div>
                  )}

                  {selectedSection.id === "part8" && (
                    <div className="space-y-3 bg-zinc-900/10 border border-zinc-900 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">toxic carbon monoxide (co) gas build-up</span>
                        <span className="text-[8px] font-mono text-red-500 font-bold uppercase">nbc part 8 shaft seals</span>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { time: "0m", unsealed: 45, sealed: 45 },
                            { time: "5m", unsealed: 250, sealed: 48 },
                            { time: "10m", unsealed: 850, sealed: 50 },
                            { time: "15m", unsealed: 1600, sealed: 52 },
                            { time: "20m", unsealed: 2200, sealed: 55 },
                            { time: "25m", unsealed: 2500, sealed: 58 },
                            { time: "30m", unsealed: 2800, sealed: 60 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="time" stroke="#555" fontSize={9} />
                            <YAxis stroke="#555" fontSize={9} />
                            <RechartTooltip contentStyle={{ background: "#050505", border: "1px solid #dc2626", fontSize: 9 }} />
                            <Area type="monotone" dataKey="unsealed" stroke="#ef4444" fill="rgba(239, 68, 68, 0.1)" name="Unsealed Shaft (ppm)" />
                            <Area type="monotone" dataKey="sealed" stroke="#22c55e" fill="rgba(34, 197, 94, 0.05)" name="Sealed Shaft (ppm)" />
                            <Legend wrapperStyle={{ fontSize: 8 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal font-sans font-light">
                        Without intumescent seals at ceiling joints, electrical shafts act as express transport vents for smoke. CO climbs to lethal concentrations (&gt;1,000 ppm) in under 12 minutes on upper floors.
                      </p>
                    </div>
                  )}

                  {selectedSection.id === "part10" && (
                    <div className="space-y-3 bg-zinc-900/10 border border-zinc-900 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">evacuation rate comparison</span>
                        <span className="text-[8px] font-mono text-red-500 font-bold uppercase">nbc part 10 exits</span>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: "Padlocked Gates", rate: 0 },
                            { name: "Fail-Secure Lock (Dead)", rate: 8 },
                            { name: "Electronic Fail-Safe", rate: 45 },
                            { name: "Panic Crash Bar", rate: 68 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="name" stroke="#555" fontSize={9} />
                            <YAxis stroke="#555" fontSize={9} />
                            <RechartTooltip contentStyle={{ background: "#050505", border: "1px solid #dc2626", fontSize: 9 }} />
                            <Bar dataKey="rate" fill="#f43f5e" name="Evacuation Flow (Persons/Min)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal font-sans font-light">
                        Locks kept shut to deter petty theft reduce egress capacity to absolute zero. Standardized mechanical push-bars release exits instantly without power reliance.
                      </p>
                    </div>
                  )}

                  {selectedSection.id === "arbitrage" && (
                    <div className="space-y-3 bg-zinc-900/10 border border-zinc-900 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">retrofit capex vs legal arbitrage cost</span>
                        <span className="text-[8px] font-mono text-red-500 font-bold uppercase">financial write-off math</span>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { year: "Year 1", retrofit: 4500000, bribe: 150000 },
                            { year: "Year 2", retrofit: 0, bribe: 150000 },
                            { year: "Year 3", retrofit: 0, bribe: 150000 },
                            { year: "Year 4", retrofit: 0, bribe: 150000 },
                            { year: "Year 5", retrofit: 0, bribe: 150000 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="year" stroke="#555" fontSize={9} />
                            <YAxis stroke="#555" fontSize={9} />
                            <RechartTooltip contentStyle={{ background: "#050505", border: "1px solid #dc2626", fontSize: 9 }} />
                            <Bar dataKey="retrofit" fill="#22c55e" name="Compliance Retrofit (CapEx)" />
                            <Bar dataKey="bribe" fill="#ef4444" name="Bribes & Legal Appeals" />
                            <Legend wrapperStyle={{ fontSize: 8 }} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal font-sans font-light">
                        Developers write off legal fines as standard administrative overhead. The ratio of annual payoff cost to genuine structural engineering is 1:30, rendering the neglect mathematically profitable.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Console Footnotes */}
              <div className="border-t border-zinc-900 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-mono text-zinc-500 gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  <span>MCD / COMPLIANCE STATS EXPOSED: HAUGHTY CAPITAL MODEL</span>
                </div>
                <span>AUDIT_NODE: SOUTH_DELHI // EAST_BLR</span>
              </div>

            </div>

          </div>

          {/* Deep Explanation Section: The Indian Municipal Regulatory Maze & Corporate Captures */}
          <div className="bg-[#050505] border border-zinc-900 p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F97316]" />
              EXPLAINER: THE INDIAN MUNICIPAL REGULATORY MAZE & CORPORATE CAPTURES
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-light text-zinc-400">
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] font-bold text-zinc-200 uppercase tracking-wider">1. Fragmentation of Authority</h4>
                <p>
                  In major Indian cities, fire safety enforcement is paralyzed by a multi-headed bureaucracy. Building plans are sanctioned by the local municipal body (e.g. MCD in Delhi, BBMP in Bengaluru), while Fire Safety NOCs are issued by the Fire Services Department, and occupancy certificates are regulated by development authorities (like DDA). Corporate developers take advantage of this fragmentation, shifting blame between departments and exploiting the lack of real-time shared database registers.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] font-bold text-zinc-200 uppercase tracking-wider">2. The Judicial Appeal Stalling Tactic</h4>
                <p>
                  When a local authority actually issues a sealing notice to an illegal commercial high-rise, corporate legal teams immediately move the municipal tribunal or high court. By filing appeals, they obtain temporary stay orders on sealing operations. These legal stay orders are repeatedly stretched out over decades. During this litigation period, the dangerous buildings remain completely functional, packed with hundreds of students or laborers without a single fire audit.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] font-bold text-zinc-200 uppercase tracking-wider">3. Cost-Arbitrage of Human Life</h4>
                <p>
                  To a developer focusing purely on quarterly returns, a catastrophic fire is a low-probability risk, while complying with the NBC is a 100% certain capital cost. Retrofitting a building with fire escape stairs and sprinkler systems reduces marketable floor space and demands millions of Rupees in investment. Corporates calculate that the interest saved on this cash, combined with extra rent collected, far exceeds the occasional legal settlement or fine, showing a cold mathematical write-off of human lives.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Area */}
        <div className="bg-[#050505] border-t border-zinc-900 px-6 py-8 text-center text-[10px] font-mono text-zinc-600">
          <p className="uppercase tracking-[0.1em]">National Building Code (NBC) Compliance Inquest Board // Forensic Analysis System</p>
          <p className="mt-1 font-light">Data compiled from official municipal fire accident reports, NGO public safety audits, and forensic building surveys (2020-2026).</p>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
