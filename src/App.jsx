/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Flame, 
  MapPin, 
  ShieldAlert, 
  Layers, 
  Clock, 
  BarChart3, 
  Sliders, 
  ArrowRight, 
  Maximize2, 
  Smartphone, 
  Palette, 
  GitCompare,
  ChevronRight,
  Info,
  X,
  Globe,
  Volume2,
  VolumeX,
  Play,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { STEPS } from "./data";
import InteractiveCharts from "./components/InteractiveCharts";
import RiskSimulator from "./components/RiskSimulator";
import IndiaComparison from "./components/IndiaComparison";
import NbcAuditPanel from "./components/NbcAuditPanel";
import EmberOverlay from "./components/EmberOverlay";
import DocumentaryInside from "./components/DocumentaryInside";
import { audioEngine } from "./lib/AudioEngine";

import { 
  INDIAN_STATES_AND_UTS, 
  ALL_INDIAN_STATES_LIST 
} from "./indianStatesData";

const ALL_INDIA_DATA = {
  name: "All India Urban Baseline Average",
  score: 68,
  hazardLevel: "HIGH VULNERABILITY BASELINE",
  color: "#F97316",
  detail: "Aggregated national fire safety compliance records across urban centers indicate over 65% of commercial-residential hybrid zones suffer from severe egress constraints, high fire loads, and lane widths below the standard 4.5 meters required for emergency tender access."
};


export default function App() {
  const [activeStep, setActiveStep] = useState("1");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showLocationAlert, setShowLocationAlert] = useState(true);
  const [locationLevel, setLocationLevel] = useState("district");
  const [selectedState, setSelectedState] = useState("delhi");
  const [selectedDistrict, setSelectedDistrict] = useState("delhi_south");
  const [scanning, setScanning] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderTime, setPreloaderTime] = useState(3);
  const [showDocumentary, setShowDocumentary] = useState(false);
  const [isEnteringDocumentary, setIsEnteringDocumentary] = useState(false);
  const [showNbcPortal, setShowNbcPortal] = useState(false);

  const enterDocumentary = () => {
    setIsEnteringDocumentary(true);
    // Escalate the sound tension
    audioEngine.start();
    audioEngine.setTensionLevel(1.0);
    setIsAudioPlaying(true);
    
    // Play the transition sequence, then show the documentary fullscreen screen
    setTimeout(() => {
      setShowDocumentary(true);
      setIsEnteringDocumentary(false);
    }, 950);
  };

  // Resolve active location record
  let activeLocationRecord;
  if (locationLevel === "all_india") {
    activeLocationRecord = ALL_INDIA_DATA;
  } else if (locationLevel === "state") {
    const stateRecord = INDIAN_STATES_AND_UTS[selectedState];
    activeLocationRecord = {
      name: stateRecord?.name || selectedState,
      score: stateRecord?.averageScore || 50,
      hazardLevel: stateRecord?.hazardLevel || "HIGH VULNERABILITY",
      color: stateRecord?.color || "#EF4444",
      detail: stateRecord?.detail || ""
    };
  } else {
    const districts = INDIAN_STATES_AND_UTS[selectedState]?.districts || {};
    activeLocationRecord = districts[selectedDistrict] || Object.values(districts)[0] || ALL_INDIA_DATA;
  }

  const targetScore = scanning ? 0 : (activeLocationRecord?.score || 50);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [shimmerTrigger, setShimmerTrigger] = useState(0);

  const stableChartAreaRef = useRef(null);
  const [stableChartDims, setStableChartDims] = useState(null);

  useEffect(() => {
    if (!stableChartAreaRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setStableChartDims({
        width: Math.max(280, width),
        height: Math.max(260, height || 320)
      });
    });
    observer.observe(stableChartAreaRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setShimmerTrigger(prev => prev + 1);
  }, [locationLevel, selectedState, selectedDistrict]);

  useEffect(() => {
    let startTimestamp = null;
    const startScore = animatedScore;
    const duration = 600; // ms

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(startScore + (targetScore - startScore) * easeProgress);
      
      setAnimatedScore(currentScore);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetScore]);

  // Preloader Countdown Effect
  useEffect(() => {
    if (!showPreloader) return;
    const interval = setInterval(() => {
      setPreloaderTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            setShowPreloader(false);
          }, 600); // brief delay to see 'LIVE' status
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showPreloader]);

  // Critical Narrowing triggers during step 2 or 3 of our core analytical metrics
  const isCriticalNarrowingActive = activeStep === "2" || activeStep === "3";

  // Sync tension audio with active state
  useEffect(() => {
    if (isAudioPlaying) {
      audioEngine.setTensionLevel(isCriticalNarrowingActive ? 1.0 : 0.2);
    }
  }, [isCriticalNarrowingActive, isAudioPlaying]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  // Stop scanning after a short high-tech mock delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setScanning(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  // Track progress of page scroll for a top progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for Scrollytelling step tracking
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -40% 0px", // Focus on middle-upper portion of viewport
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("data-step-id");
          if (id) {
            setActiveStep(id);
          }
        }
      });
    }, observerOptions);

    const steps = document.querySelectorAll("[data-step-id]");
    steps.forEach((step) => observer.observe(step));

    return () => {
      steps.forEach((step) => observer.unobserve(step));
    };
  }, []);

  const activeStepData = STEPS.find((s) => s.id === activeStep) || STEPS[0];

  return (
    <div className="bg-[#0A0A0A] text-zinc-100 min-h-screen font-sans antialiased selection:bg-[#EF4444]/30 selection:text-red-200" id="app-root-container">
      {/* Immersive High-Tech Risk Assessment Preloader */}
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#070708] flex flex-col items-center justify-center font-mono select-none overflow-hidden"
            id="preloader-overlay"
          >
            {/* High tech grid background with scanning lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.15)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="relative text-center max-w-xl px-6 flex flex-col items-center z-10"
            >
              {/* Spinning alert diamond logo */}
              <div className="mb-6 p-4 rounded-xl border border-red-950/40 bg-red-950/10 relative">
                <div className="absolute -inset-1 rounded-xl bg-[#EF4444]/10 blur-sm animate-pulse" />
                <Flame className="w-10 h-10 text-[#EF4444] relative animate-pulse" />
              </div>

              <h1 className="text-xs uppercase tracking-[0.4em] font-black text-zinc-100 mb-1">
                STRUCTURAL_BREACH_CHECK
              </h1>
              <p className="text-[9px] text-zinc-500 max-w-md uppercase tracking-widest mb-8">
                Delhi Metropolitan Fire Risk Vulnerability Audit
              </p>

              {/* Dynamic Circular Countdown Progress Timer */}
              <div className="relative w-32 h-32 flex items-center justify-center border border-zinc-900 rounded-full mb-8 bg-black/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                <svg className="absolute -rotate-90 w-full h-full p-2">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-zinc-950 fill-none"
                    strokeWidth="2"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-[#EF4444] fill-none"
                    strokeWidth="2"
                    strokeDasharray="289"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: 289 }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </svg>
                <div className="text-center z-10">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={preloaderTime}
                      initial={{ opacity: 0, scale: 0.8, y: 2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.2, y: -2 }}
                      transition={{ duration: 0.2 }}
                      className="text-3xl font-black text-[#EF4444] block tracking-tighter"
                    >
                      {preloaderTime > 0 ? `0${preloaderTime}` : "LIVE"}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-[0.2em] block mt-1">SYS_LOAD</span>
                </div>
              </div>

              {/* Ticking log metrics representing realistic diagnostic sequences */}
              <div className="w-64 text-left border border-zinc-900/60 bg-zinc-950/80 p-4 rounded text-[9px] text-zinc-400 space-y-1.5 font-mono shadow-inner">
                <div className="flex justify-between items-center text-zinc-600 text-[8px]">
                  <span>CONN: INGRESS_ROUTE</span>
                  <span>SEQ: 982-A</span>
                </div>
                <div className="h-px bg-zinc-900" />
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate">SECURED SPATIAL DATABASES</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${preloaderTime <= 2 ? 'bg-emerald-500' : 'bg-zinc-800 animate-pulse'}`} />
                  <span className={preloaderTime <= 2 ? "text-zinc-300 truncate" : "text-zinc-600 truncate"}>MAPS GAP BREACH COORDINATES</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${preloaderTime <= 1 ? 'bg-emerald-500' : 'bg-zinc-800 animate-pulse'}`} />
                  <span className={preloaderTime <= 1 ? "text-zinc-300 truncate" : "text-zinc-600 truncate"}>SIMULATION ASSETS READY</span>
                </div>
              </div>

              {/* Direct Skip Button */}
              <button
                onClick={() => setShowPreloader(false)}
                className="mt-6 text-[8px] uppercase text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 tracking-widest border border-zinc-900 bg-black/20 px-3 py-1.5 rounded-md transition-all active:scale-95 duration-200"
              >
                SKIP_SYSTEM_TEST_MODE ➔
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-zinc-900 z-50" id="top-scroll-progress-bg">
        <div 
          className="h-full bg-gradient-to-r from-[#EF4444] to-[#F97316] transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
          id="top-scroll-progress-fill"
        />
      </div>

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-zinc-900 px-6 py-4" id="app-main-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-xs font-black tracking-[0.3em] uppercase font-mono text-zinc-100">
              BUILT_TO_BREAK
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-[10px] font-bold tracking-[0.1em] text-[#F97316] bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20">
              DELHI_RISK_STUDY_v2.0
            </span>
            <button
              onClick={() => {
                if (isAudioPlaying) {
                  audioEngine.stop();
                  setIsAudioPlaying(false);
                } else {
                  audioEngine.start();
                  audioEngine.setTensionLevel(isCriticalNarrowingActive ? 1.0 : 0.2);
                  setIsAudioPlaying(true);
                }
              }}
              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                isAudioPlaying 
                  ? "bg-red-950/40 border-[#EF4444] text-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
              id="audio-tension-toggle"
              title={isAudioPlaying ? "Mute Tension Audio" : "Play Tension Audio"}
            >
              {isAudioPlaying ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Title Slide Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden px-4 bg-[#0A0A0A]" id="section-hero">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://raw.githubusercontent.com/bits-group30/design-project/main/273648919_70ad9adcf1_c.jpg" 
            alt="Delhi Urban Infrastructure Grid" 
            className="w-full h-full object-cover filter brightness-[0.25] contrast-[1.15] scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-[#0A0A0A]/20 to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center justify-center space-y-6 px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 text-[11px] font-bold font-mono tracking-[0.3em] text-zinc-500 uppercase"
          >
            <span>Design Audit / Scrollytelling</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-6xl sm:text-7xl md:text-9xl lg:text-[110px] xl:text-[124px] font-black tracking-[-0.06em] leading-[0.82] text-zinc-100 uppercase font-display"
          >
            BUILT<br />TO<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EF4444] via-[#F97316] to-[#FACC15]">BREAK</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-xl text-sm md:text-base text-zinc-400 font-light leading-relaxed mt-4"
          >
            Analyzing Urban Infrastructure Capacity & Risk in India when Metropolitan Expansion overrides Municipal Limits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col items-center gap-2 pt-6 pointer-events-none"
          >
            <span className="text-[11px] uppercase tracking-[0.4em] font-black font-mono text-[#EF4444] drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">
              ↓ SCROLL TO DETECT BREACHES ↓
            </span>
            <div className="w-1.5 h-10 rounded-full bg-red-950/40 border border-red-900/60 relative overflow-hidden flex justify-center">
              <motion.div 
                animate={{ y: [0, 24, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                className="w-1.5 h-3 bg-[#EF4444] rounded-full shadow-[0_0_8px_#EF4444]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Study Section (Malviya Nagar Fire Accident) */}
      <section className="relative w-full min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6 py-24 border-t border-zinc-900" id="section-case-study">
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src="https://raw.githubusercontent.com/bits-group30/design-project/main/bg2.jpeg" 
            alt="Sparks background" 
            className="w-full h-full object-cover filter brightness-[0.5]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-900 p-8 md:p-10 rounded-none shadow-2xl backdrop-blur-md flex flex-col justify-center h-full min-h-[480px]">
            <span className="text-[11px] font-bold tracking-[0.3em] text-[#EF4444] uppercase font-mono mb-2">The Catalyst Model</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-100 uppercase mb-4 leading-none font-display">
              Malviya Nagar Fire Accident
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-light mb-8">
              The catalytic event that proved high-density incidents are predictable data failures. A massive blaze ripped through Hauz Rani, exposing a 100% loss in evacuation velocity due to illegal packing.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-[#F97316] font-mono text-xs font-bold mt-1">[01]</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 font-mono">Narrow Lanes</h4>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">Physical blockage of fire tenders due to tight street layouts.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#F97316] font-mono text-xs font-bold mt-1">[02]</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 font-mono">Compliance Gaps</h4>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">Commercial units operating at 4x their sanctioned capacity, overloading local infrastructure.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 flex justify-center items-center h-full">
            <div className="w-full h-full max-h-[500px] p-1 bg-zinc-900 border border-zinc-800 shadow-[0_4px_32px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <motion.div 
                className="w-full h-[320px] md:h-[450px] overflow-hidden bg-zinc-950 border border-zinc-800/80 relative"
                animate={{ 
                  x: isEnteringDocumentary ? [0, -12, 12, -15, 15, -8, 8, -4, 4, 0] : 0,
                  y: isEnteringDocumentary ? [0, 8, -8, 12, -12, 6, -6, 2, -2, 0] : 0,
                  scale: isEnteringDocumentary ? 7.5 : 1,
                  filter: isEnteringDocumentary ? "brightness(3) saturate(2)" : "brightness(0.70) saturate(1)"
                }}
                transition={{ 
                  duration: 0.95, 
                  ease: "easeInOut" 
                }}
              >
                <img 
                  src="https://raw.githubusercontent.com/bits-group30/design-project/main/delhi-fire-accident.jpg" 
                  alt="Malviya Nagar active fire rescue operation scene" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Immersive Play Overlay Button */}
                {!isEnteringDocumentary && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 hover:bg-black/15 transition-all duration-300 z-10">
                    <button
                      onClick={enterDocumentary}
                      className="group flex flex-col items-center justify-center focus:outline-none cursor-pointer"
                    >
                      {/* Play Icon Circle */}
                      <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-red-950/45 border-2 border-red-500/85 group-hover:bg-[#EF4444] group-hover:border-red-400 text-red-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_45px_rgba(239,68,68,0.85)]" id="play-documentary-action-btn">
                        {/* Dynamic outer flame pulse ring */}
                        <div className="absolute -inset-3 rounded-full border border-red-500/30 animate-fire-pulse pointer-events-none group-hover:border-red-500/60" />
                        <Play className="w-8 h-8 fill-current ml-1 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      
                      <span className="mt-4 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-red-500 group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] transition-all">
                        ENTER THE BLAZE // PLAY DOCUMENTARY
                      </span>
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Crimson Fullscreen Flash Transition Overlay */}
              {isEnteringDocumentary && (
                <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-500 z-20 animate-pulse mix-blend-color-dodge opacity-80" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sliding Parallax Warning Tapes (Unexpected Scrolling/Sliding Effect) */}
      <div className="relative w-full overflow-hidden bg-zinc-950 border-y border-zinc-900 py-3.5 flex flex-col gap-2.5 rotate-[0.5deg] scale-[1.02] my-8" id="sliding-hazard-tapes">
        <div 
          className="flex whitespace-nowrap font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#EF4444] opacity-80"
          style={{ transform: `translateX(${-scrollProgress * 5}px)` }}
        >
          {Array(25).fill("▲ CRITICAL STREET NARROWING POCKETS ▲ EVACUATION DEGRADED ▲ COMPLIANCE EXCEEDED ▲ ").join("")}
        </div>
        <div 
          className="flex whitespace-nowrap font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 opacity-60"
          style={{ transform: `translateX(${(scrollProgress - 50) * 5}px)` }}
        >
          {Array(25).fill("▼ HARDWARE LIMIT SHATTERED ▼ REGULATION DEFIANCE ▼ STRUCTURAL OVERPACKING ▼ ").join("")}
        </div>
      </div>

      {/* Main Scrollytelling Section */}
      <section className="relative w-full bg-[#050505] border-t border-red-950/20" id="section-scrollytelling">
        {/* Background video (muted audio) for charts and narrative explanations */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <video
            src="https://assets.mixkit.co/videos/preview/mixkit-fire-burning-in-the-dark-4017-large.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-10 filter brightness-[0.5] contrast-[1.2]"
          />
          <div className="absolute inset-0 bg-[#050505]/70 mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-32 pt-24 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-black font-mono text-red-500 uppercase tracking-[0.3em]">[BASELINE OVERLOAD RATINGS]</span>
            <h2 className="text-3xl md:text-5xl font-black text-zinc-100 mt-2 uppercase tracking-tight font-display animate-text-glitch">Core Analytical Metrics</h2>
            <p className="text-zinc-500 text-xs md:text-sm mt-2 max-w-xl mx-auto leading-relaxed font-light">
              Scroll through the segments below. The visual engine shifts layouts, representing the spatial fragmentation and high-density chaos of fire propagation pathways.
            </p>
          </div>

          <div className="lg:flex lg:gap-12 relative">
            {/* Left Column: Narrative Cards (Observer-monitored with maze-like random rotation & offsets) */}
            <div className="w-full lg:w-1/2 space-y-16 lg:space-y-[75vh] mb-[20vh] lg:mb-[40vh] relative z-10">
              {STEPS.map((step) => {
                const isActive = step.id === activeStep;
                
                // Maze-like dynamic calculation based on card index to trigger unexpected offsets & rotate skews
                const stepIdx = parseInt(step.id);
                const isEven = stepIdx % 2 === 0;
                const skewOffset = isEven ? -2 : 2;
                const rotateOffset = isEven ? -1 : 1;
                const xOffset = isEven ? -10 : 10;
                const yOffset = isEven ? 6 : -6;

                return (
                  <motion.div 
                    key={step.id} 
                    data-step-id={step.id}
                    initial={{ x: xOffset, y: yOffset, opacity: 0.15, rotate: rotateOffset, skewX: skewOffset }}
                    animate={{ 
                      x: isActive ? 0 : xOffset,
                      y: isActive ? 0 : yOffset,
                      rotate: isActive ? 0 : rotateOffset,
                      skewX: isActive ? 0 : skewOffset,
                      scale: isActive ? 1.04 : 0.96,
                      opacity: isActive ? 1 : 0.25,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 13 }}
                    className={`p-6 md:p-8 rounded-none border transition-all duration-500 relative overflow-hidden ${
                      isActive 
                        ? "bg-black border-[#EF4444]/40 shadow-[0_0_35px_rgba(239,68,68,0.12)] ring-1 ring-red-500/20" 
                        : "bg-zinc-950/20 border-zinc-900/30"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EF4444]" />
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-mono text-xs font-bold text-[#EF4444] bg-zinc-950 px-3 py-1.5 rounded-none border border-red-950/30">[0{step.id}]</span>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase tracking-[0.2em]">{step.category}</span>
                        <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tight mt-0.5">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-light">
                      {step.desc}
                    </p>

                    {/* Step 2 Inline Regulatory Trigger */}
                    {step.id === "2" && (
                      <button
                        onClick={() => setShowNbcPortal(true)}
                        className="mt-4 w-full flex items-center justify-between px-4 py-2.5 border border-red-950/60 bg-red-950/20 text-[10px] font-mono text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all rounded-none cursor-pointer"
                        id="scrolly-nbc-trigger-btn"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          LAUNCH REGULATORY EXPLOITATION BOARD ➔
                        </span>
                        <span className="text-[9px] font-bold tracking-wider">NBC CODES</span>
                      </button>
                    )}

                    {/* Inline Chart ONLY shown on mobile screens */}
                    <div className="block lg:hidden mt-6 pt-4 border-t border-zinc-900 h-[340px]">
                      <InteractiveCharts activeStep={step.id} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: Sticky Chart Panel (Only visible on Desktop lg+) with unexpected slides and shifts on step changes */}
            <div className="hidden lg:block w-full lg:w-1/2 lg:sticky lg:top-[10vh] lg:h-[82vh] lg:min-h-[640px] lg:max-h-[800px] bg-black border border-red-950/30 rounded-none p-6 shadow-2xl self-start mt-8 lg:mt-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-red-950/5 to-transparent pointer-events-none z-10" />
              
              {/* Background video inside the sticky chart panel */}
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
                <video
                  src="https://assets.mixkit.co/videos/preview/mixkit-fire-burning-in-the-dark-4017-large.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-15 filter brightness-[0.6] contrast-[1.1]"
                />
              </div>

              <div className="w-full h-full flex flex-col justify-between relative z-10">
                {/* Heading details inside sticky block */}
                <div className="border-b border-zinc-900 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#EF4444] bg-zinc-950 px-2.5 py-1 rounded-none border border-red-950/30">[0{activeStepData.id}]</span>
                    <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-[0.2em]">Active Stress Analyzer</span>
                  </div>
                  <h3 className="text-base font-black text-zinc-100 uppercase mt-2 tracking-tight">
                    {activeStepData.title}
                  </h3>
                  <p className="text-zinc-400 text-xs font-light leading-relaxed mt-1">
                    {activeStepData.desc}
                  </p>
                </div>

                {/* Main chart rendering area - Shifts and skews randomly on update representing maze transitions */}
                <div ref={stableChartAreaRef} className="flex-grow w-full relative overflow-hidden flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ 
                        opacity: 0, 
                        scale: 0.9, 
                        rotate: parseInt(activeStep) % 2 === 0 ? 4 : -4, 
                        x: parseInt(activeStep) % 2 === 0 ? 40 : -40,
                        y: parseInt(activeStep) % 2 === 0 ? -20 : 20 
                      }}
                      animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.9, 
                        rotate: parseInt(activeStep) % 2 === 0 ? -4 : 4, 
                        x: parseInt(activeStep) % 2 === 0 ? -40 : 40,
                        y: parseInt(activeStep) % 2 === 0 ? 20 : -20 
                      }}
                      transition={{ type: "spring", stiffness: 95, damping: 13 }}
                      className="absolute inset-0"
                    >
                      <InteractiveCharts 
                        activeStep={activeStep} 
                        stableWidth={stableChartDims?.width} 
                        stableHeight={stableChartDims?.height} 
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Risk Simulator Section */}
      <section className="relative w-full bg-[#0A0A0A] border-t border-zinc-900 py-24 px-6" id="section-simulator">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold font-mono text-[#F97316] uppercase tracking-[0.3em]">Actionable Planning Tool</span>
            <h2 className="text-3xl md:text-5xl font-black text-zinc-100 mt-2 uppercase tracking-tight font-display">Test Urban Stress Variables</h2>
            <p className="text-zinc-400 text-xs md:text-sm mt-2 max-w-xl mx-auto leading-relaxed">
              Simulate standard fire safety regulations versus current illegal extensions. Move the sliders to test how street narrowing and load packing impact emergency response.
            </p>
          </div>

          <RiskSimulator />
        </div>
      </section>

      {/* National Benchmark Comparisons Section */}
      <section className="relative w-full bg-[#050505] border-t border-red-950/30 py-24 px-6" id="section-comparisons">
        <div className="max-w-7xl mx-auto space-y-16 font-sans">
          <IndiaComparison />
          
          {/* Regulatory Inquest Callout Banner (Trigger) */}
          <div className="bg-[#09090B] border border-zinc-900 p-8 md:p-10 relative overflow-hidden shadow-2xl">
            {/* Warning Hazard border patterns */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,#EF4444,#EF4444_15px,transparent_15px,transparent_30px)] opacity-40" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-mono text-xs font-black uppercase tracking-[0.25em] text-red-500">
                    regulatory gap analysis tracker
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-zinc-100 uppercase tracking-tight font-display">
                  National Building Code (NBC) Loophole Audit Portal
                </h3>
                <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed max-w-3xl">
                  Deep dive into the complex regulatory loopholes and "Lal Dora" land exemptions utilized by corporate entities and illegal builders to maximize profits at the expense of human lives. Launch the full interactive board to simulate corporate math, explore specific safety failures, and view mandated rectification options.
                </p>
              </div>
              <div className="lg:col-span-4 flex justify-end">
                <button
                  onClick={() => setShowNbcPortal(true)}
                  className="w-full lg:w-auto px-6 py-4 bg-red-950/40 hover:bg-[#EF4444] border border-red-600/60 text-red-400 hover:text-white font-mono text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_25px_rgba(239,68,68,0.15)] hover:shadow-[0_0_45px_rgba(239,68,68,0.5)] active:scale-95 group flex items-center justify-center gap-2.5 rounded-none cursor-pointer"
                  id="trigger-nbc-portal-action-btn"
                >
                  <span>LAUNCH REGULATORY AUDIT BOARD</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Local Vulnerability diagnostic section (moved from popup alert) */}
      <section className="relative w-full bg-[#050505] border-t border-red-950/40 py-24 px-6 overflow-hidden" id="section-local-vulnerability">
        {/* Ambient warning lights and fire flare overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#EF4444]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[repeating-linear-gradient(90deg,#EF4444,#EF4444_20px,transparent_20px,transparent_40px)] opacity-30" />

        <div className="max-w-4xl mx-auto bg-black border border-red-950/60 p-8 md:p-12 shadow-[0_0_80px_rgba(239,68,68,0.08)] relative">
          <div className="absolute top-4 right-4 bg-red-950/30 border border-red-600/30 px-3 py-1 text-[9px] font-mono text-red-500 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            LIVE AUDIT MODULE
          </div>

          <div className="flex items-center gap-2.5 mb-4">
            <ShieldAlert className="w-5 h-5 text-[#EF4444] animate-bounce" />
            <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[#EF4444]">
              MUNICIPAL_HAZARD_ADVISORY
            </span>
          </div>

          <h3 className="text-3xl md:text-4xl font-black text-zinc-100 uppercase tracking-tight font-display mb-2">
            Local Vulnerability Diagnostic
          </h3>
          <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed mb-8 max-w-2xl">
            This analytical interface assesses real structural safety, evacuation lag-times, and fire department access scores across any selected region in India. Configure your location parameters below.
          </p>

          {/* Diagnostic Console Grid */}
          {scanning ? (
            <div className="flex flex-col items-center justify-center py-16 bg-zinc-950/60 border border-zinc-900/80 space-y-4" id="scanning-hud">
              <div className="relative w-16 h-16 rounded-full border-2 border-[#EF4444]/20 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#EF4444]"
                />
                <Globe className="w-6 h-6 text-[#EF4444]/50" />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase tracking-[0.25em] block">
                  Detecting Municipal Coordinates...
                </span>
                <span className="text-zinc-600 text-[9px] font-mono uppercase block mt-1 tracking-wider">
                  Resolving global fire load database ID
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8" id="resolved-hud">
                {/* Configuration controls */}
                <div className="md:col-span-5 space-y-6">
                  {/* Scope Selector */}
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-black">
                      1. SELECT DIAGNOSTIC SCOPE
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 border border-zinc-900">
                      {["all_india", "state", "district"].map((level) => (
                        <button
                          key={level}
                          onClick={() => setLocationLevel(level)}
                          className={`py-2 text-[9px] font-mono uppercase tracking-wider font-black transition-all ${
                            locationLevel === level
                              ? "bg-[#EF4444] text-white"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                          type="button"
                        >
                          {level === "all_india" ? "India" : level === "state" ? "State" : "City"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Selectors */}
                  {locationLevel !== "all_india" && (
                    <div className="bg-zinc-950/60 border border-zinc-900 p-4 space-y-4">
                      {/* State selector */}
                      <div>
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5 font-bold">
                          Select State
                        </label>
                        <div className="relative">
                          <select 
                            value={selectedState}
                            onChange={(e) => {
                              const stateKey = e.target.value;
                              setSelectedState(stateKey);
                              const districts = INDIAN_STATES_AND_UTS[stateKey]?.districts || {};
                              const availableKeys = Object.keys(districts);
                              if (availableKeys.length > 0) {
                                setSelectedDistrict(availableKeys[0]);
                              }
                            }}
                            className="w-full bg-black border border-zinc-900 text-zinc-200 font-mono text-xs p-2.5 rounded-none outline-none focus:border-[#EF4444] transition-colors appearance-none cursor-pointer uppercase font-bold"
                          >
                            {ALL_INDIAN_STATES_LIST.map((state) => (
                              <option key={state.id} value={state.id}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                        </div>
                      </div>

                      {/* District Selector */}
                      {locationLevel === "district" && (
                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5 font-bold">
                            Select Major City / Locality
                          </label>
                          <div className="relative">
                            <select 
                              value={selectedDistrict}
                              onChange={(e) => setSelectedDistrict(e.target.value)}
                              className="w-full bg-black border border-zinc-900 text-zinc-200 font-mono text-xs p-2.5 rounded-none outline-none focus:border-[#EF4444] transition-colors appearance-none cursor-pointer uppercase font-bold"
                            >
                              {Object.entries(INDIAN_STATES_AND_UTS[selectedState]?.districts || {}).map(([key, record]) => (
                                <option key={key} value={key}>
                                  {record.name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-500">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Analytical output diagnostic display */}
                <motion.div 
                  key={shimmerTrigger}
                  initial={{ 
                    boxShadow: "0 0 0px rgba(0, 0, 0, 0)",
                    borderColor: "#18181b" 
                  }}
                  animate={{ 
                    boxShadow: [
                      "0 0 0px rgba(0, 0, 0, 0)",
                      `0 0 25px ${(activeLocationRecord?.color || "#EF4444")}35`,
                      "0 0 0px rgba(0, 0, 0, 0)"
                    ],
                    borderColor: [
                      "#18181b",
                      activeLocationRecord?.color || "#EF4444",
                      "#18181b"
                    ]
                  }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                  className="md:col-span-7 bg-zinc-950/50 border p-6 flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  {/* Subtle Shimmer Overlay Sweep */}
                  <motion.div
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 w-2/3 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent z-10"
                    style={{ mixBlendMode: "overlay" }}
                  />

                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">VULNERABILITY LEVEL</span>
                        <h4 className="text-lg font-black uppercase tracking-tight mt-0.5" style={{ color: activeLocationRecord?.color || "#EF4444" }}>
                          {activeLocationRecord?.hazardLevel}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">INDEX VALUE</span>
                        <span className="text-3xl font-black font-mono tracking-tighter" style={{ color: activeLocationRecord?.color || "#EF4444" }}>
                          {animatedScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Progress Rating Indicator */}
                    <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-none overflow-hidden mt-4">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${animatedScore}%` }}
                        transition={{ type: "spring", stiffness: 80 }}
                        className="h-full bg-gradient-to-r"
                        style={{ 
                          backgroundColor: activeLocationRecord?.color || "#EF4444",
                          backgroundImage: `linear-gradient(to right, ${(activeLocationRecord?.color || "#EF4444")}60, ${activeLocationRecord?.color || "#EF4444"})` 
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-1">MUNICIPAL DEGRADATION INSIGHTS</span>
                    <p className="text-zinc-300 text-xs md:text-[13px] leading-relaxed font-light">
                      {activeLocationRecord?.detail}
                    </p>
                  </div>

                  <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest border-t border-zinc-900/80 pt-4 flex items-center justify-between">
                    <span>SECTOR STATUS: UNREGULATED DECAY ACTIVE</span>
                    <span>CALIBRATED: 2026</span>
                  </div>
                </motion.div>
              </div>
          )}
        </div>
      </section>

      {/* Investigative Story Outline Section */}
      <section className="relative w-full bg-[#050505] border-t border-zinc-900/60 py-24 px-6 overflow-hidden" id="section-story-outline">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-mono text-[#EF4444] uppercase tracking-[0.25em] font-black block mb-2">
              [SYSTEM INVESTIGATION DOSSIER]
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-zinc-100 uppercase tracking-tight font-display">
              Municipal Audit Story Outline
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm mt-3 max-w-xl mx-auto leading-relaxed font-light">
              The four-part investigative arc detailing the structural collapse, regulatory defiance, and spatial solutions inside Delhi's high-vulnerability pockets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-zinc-900 bg-[#080808] p-6 relative overflow-hidden group hover:border-[#EF4444]/30 transition-all duration-300">
              <span className="absolute top-4 right-4 text-xs font-mono font-bold text-zinc-800">ACT I</span>
              <div className="w-1.5 h-12 bg-amber-500/80 absolute left-0 top-6" />
              <div className="pl-4">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider font-bold">1. The Macro Pressure</span>
                <h3 className="text-base font-black text-zinc-200 uppercase mt-1">Unchecked Saturation</h3>
                <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-light">
                  Delhi's immense population and economic boom force commercial footprint growth deep into old quarters. Residential footprints are converted into high-load garment, electrical, and hazard-prone warehouses operating beyond grid limits.
                </p>
              </div>
            </div>

            <div className="border border-zinc-900 bg-[#080808] p-6 relative overflow-hidden group hover:border-[#EF4444]/30 transition-all duration-300">
              <span className="absolute top-4 right-4 text-xs font-mono font-bold text-zinc-800">ACT II</span>
              <div className="w-1.5 h-12 bg-[#F97316]/80 absolute left-0 top-6" />
              <div className="pl-4">
                <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-wider font-bold">2. The Regulatory Divide</span>
                <h3 className="text-base font-black text-zinc-200 uppercase mt-1">Defiant Verticality</h3>
                <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-light">
                  To maximize rental yields, property owners build unauthorized floors (reaching 5–6 stories on single-family foundations). Setbacks are built out completely, and narrow corridors collapse down to 1.5-meter bottlenecks.
                </p>
              </div>
            </div>

            <div className="border border-zinc-900 bg-[#080808] p-6 relative overflow-hidden group hover:border-[#EF4444]/30 transition-all duration-300">
              <span className="absolute top-4 right-4 text-xs font-mono font-bold text-zinc-800">ACT III</span>
              <div className="w-1.5 h-12 bg-[#EF4444]/80 absolute left-0 top-6" />
              <div className="pl-4">
                <span className="text-[10px] font-mono text-[#EF4444] uppercase tracking-wider font-bold">3. The Transit Collapse</span>
                <h3 className="text-base font-black text-zinc-200 uppercase mt-1">Lost Golden Hour</h3>
                <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-light">
                  During high-density structural fire outbreaks, physical bottlenecks make entry impossible for standard fire trucks. Responders must park far away and manually drag heavy hoses, delaying critical rescue operations by upwards of 15 minutes.
                </p>
              </div>
            </div>

            <div className="border border-zinc-900 bg-[#080808] p-6 relative overflow-hidden group hover:border-[#EF4444]/30 transition-all duration-300">
              <span className="absolute top-4 right-4 text-xs font-mono font-bold text-zinc-800">ACT IV</span>
              <div className="w-1.5 h-12 bg-red-600 absolute left-0 top-6" />
              <div className="pl-4">
                <span className="text-[10px] font-mono text-red-500 uppercase tracking-wider font-bold">4. The Spatial Solution</span>
                <h3 className="text-base font-black text-zinc-200 uppercase mt-1">Intervention & Safety</h3>
                <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-light">
                  The design audit proposes physical mitigation guidelines: micro fire hydrant setups, pocket refuge terraces, rigid vertical zoning caps, and structural setbacks designed to ensure critical rescue access pathways remain viable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Styled Footer */}
      <footer className="bg-black border-t border-red-950/30 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="brand font-black italic text-2xl tracking-tighter text-zinc-100 animate-text-glitch">
            BUILT_TO_BREAK_v2.0
          </div>
          <div className="flex gap-3 text-zinc-600 font-mono text-[10px] uppercase tracking-widest font-black">
            STORY SYSTEM DESIGNED BY SYSTEMS AUDIT
          </div>
        </div>
      </footer>

      {/* High-performance canvas-based Ember Overlay */}
      <EmberOverlay active={isCriticalNarrowingActive} />

      {/* Fullscreen Interactive Documentary Screen inside the burning building */}
      <AnimatePresence>
        {showDocumentary && (
          <DocumentaryInside 
            onClose={() => setShowDocumentary(false)} 
            audioEngine={audioEngine}
          />
        )}
      </AnimatePresence>

      {/* Fullscreen Interactive National Building Code (NBC) Loophole Audit Portal */}
      <AnimatePresence>
        {showNbcPortal && (
          <NbcAuditPanel 
            isOpen={showNbcPortal}
            onClose={() => setShowNbcPortal(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
