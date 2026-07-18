/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Flame, 
  Clock, 
  ShieldAlert, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  MapPin, 
  AlertTriangle,
  Play,
  Volume2,
  BookOpen,
  UserX,
  FileText,
  Building
} from "lucide-react";

export default function DocumentaryInside({ onClose, audioEngine }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeTimelineItem, setActiveTimelineItem] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Dynamic fire ember particle simulation on canvas representing "inside the building on fire"
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let particles = [];
    let flames = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Create glowing embers
    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 50,
        size: Math.random() * 4 + 1,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1.5,
        alpha: 1,
        life: Math.random() * 120 + 80,
        maxLife: Math.random() * 120 + 80,
        color: Math.random() > 0.4 ? "#EF4444" : Math.random() > 0.3 ? "#F97316" : "#FACC15"
      };
    };

    // Create flames on the sides of the screen
    const createFlame = (xPosition, side) => {
      return {
        x: xPosition,
        y: canvas.height + 20,
        r: Math.random() * 35 + 15,
        vy: -Math.random() * 4 - 2,
        vx: side === "left" ? Math.random() * 1.2 : -Math.random() * 1.2,
        life: Math.random() * 40 + 20,
        color: Math.random() > 0.5 ? "rgba(239, 68, 68, 0.15)" : Math.random() > 0.3 ? "rgba(249, 115, 22, 0.15)" : "rgba(250, 204, 21, 0.08)"
      };
    };

    // Initialize particles
    for (let i = 0; i < 40; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bottom glowing smoke fog
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 250);
      gradient.addColorStop(0, "rgba(30, 10, 5, 0.4)");
      gradient.addColorStop(0.5, "rgba(15, 3, 1, 0.2)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Generate side flames
      if (Math.random() < 0.35) {
        // Left side flames
        flames.push(createFlame(Math.random() * 120, "left"));
      }
      if (Math.random() < 0.35) {
        // Right side flames
        flames.push(createFlame(canvas.width - Math.random() * 120, "right"));
      }

      // Draw and update flames (warm ambient heat glow)
      flames = flames.filter(f => {
        f.y += f.vy;
        f.x += f.vx;
        f.r *= 0.96;
        f.life--;

        if (f.r > 1 && f.life > 0) {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = f.color;
          ctx.filter = "blur(12px)";
          ctx.fill();
          ctx.filter = "none";
          return true;
        }
        return false;
      });

      // Draw and update embers
      if (particles.length < 90 && Math.random() < 0.4) {
        particles.push(createParticle());
      }

      particles = particles.filter(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.life--;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life > 0 && p.x >= 0 && p.x <= canvas.width) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
          ctx.globalAlpha = 1.0;
          return true;
        }
        return false;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Monitor scroll in container
  const handleScroll = (e) => {
    const target = e.target;
    setScrollPosition(target.scrollTop);
  };

  // Timeline events of the Flourish Stay B&B Fire Tragedy
  const TIMELINE = [
    {
      time: "08:20 AM",
      badge: "AUTO-IGNITION",
      title: "Unattended Fryer Erupts",
      description: "In the dark, cramped basement kitchen of Flourish Stay B&B, an commercial oil fryer is left unattended as the cook, Keshav Negi, steps away for a tea break. The boiling oil reaches its auto-ignition threshold, erupting into toxic chemical flames and quickly catching stacks of cardboard packaging.",
      metrics: "Temp: 320°C+ | Basement Storage: Extreme Load"
    },
    {
      time: "08:20 - 08:45 AM",
      badge: "FATAL SILENCE",
      title: "Private Containment Effort",
      description: "Guesthouse staff attempts to suppress the roaring fire privately instead of calling emergency lines. To protect the 'image' of the guesthouse, no alarms are triggered. Dozens of guests across 5 floors remain completely asleep, unaware of the rising toxic gases.",
      metrics: "Elapsed Time: 25 Mins | Active Alarms: 0"
    },
    {
      time: "08:45 AM",
      badge: "CRITICAL PANIC",
      title: "Frantic Final Calls",
      description: "Realizing the fire is out of control and the central exit is completely blocked by smoke, trapped guests wake up into absolute pitch-black darkness. Guests begin placing desperate, frantic final calls to their loved ones as carbon monoxide levels spike.",
      metrics: "Central Stairwell: 800°C Chimney | Visibility: Zero"
    },
    {
      time: "08:48 AM",
      badge: "POLICE CONTACT",
      title: "Emergency Line Triggered",
      description: "The first official emergency call is placed to the Delhi Police, 28 minutes after the initial fryer ignition. While guests are sealed in, the manager flees through the front door and a helper jumps to an adjacent terrace.",
      metrics: "Delay: 28 Mins | Grid Status: ACTIVE PANIC"
    },
    {
      time: "08:50 AM",
      badge: "DFS DISPATCH",
      title: "Fire Services Dispatched",
      description: "The Delhi Fire Service (DFS) dispatches active tenders. They race toward Hauz Rani, only to hit the 'Geography of Gridlock'—narrow, 1.5-meter alleys where truck side mirrors literally scrape the residential concrete.",
      metrics: "Response Units: 12 Tenders | Access Width: 1.5m"
    }
  ];

  // Inquest compliance failure indicators (The Six-Room Illusion)
  const INQUEST_METRICS = [
    {
      label: "THE SIX-ROOM ILLUSION",
      value: "25+ Rooms",
      subText: "Registered under a Bed & Breakfast scheme legally capping rooms at 6. Owner Lavkesh Bajaj illegally partitioned the footprint into 25+ cells.",
      status: "CRITICAL LAW EVASION"
    },
    {
      label: "YIELD MAXIMIZATION OVERLOAD",
      value: "400%+",
      subText: "By cramming dozens of people into a layout approved for six, the developers completely neutralized every emergency safety buffer.",
      status: "GREED IMPACT"
    },
    {
      label: "LAL DORA EXEMPTION LOOPHOLE",
      value: "0 NOCs",
      subText: "Operators weaponized the Lal Dora rural classification to bypass mandatory Fire No Objection Certificates and modern safety infrastructure.",
      status: "REGULATORY DEFICIT"
    },
    {
      label: "GEOGRAPHY OF GRIDLOCK",
      value: "1.5 Meters",
      subText: "Narrow alleys prevented fire tenders from reaching the core. Firefighters carried heavy hose grids and rescue equipment by hand.",
      status: "STRUCTURAL BOTTLENECK"
    }
  ];

  // Anatomical Flaws of the Trap
  const STRUCTURAL_FLAWS = [
    {
      title: "Wooden Chimney Staircase",
      desc: "The single, central staircase was lined with highly flammable wooden paneling and plastic decorations. It acted as a conduit for the 'Chimney Effect,' funneling toxic smoke and fire from the basement upward through all five floors.",
      icon: Flame,
      color: "from-red-950/40 to-red-900/10 border-red-900/60"
    },
    {
      title: "Shutter-Blocked Basement Oven",
      desc: "The basement, illegally used for residential guest rooms, had its exits shutter-blocked in direct violation of municipal zoning laws, turning the lowest level into a windowless, oxygen-starving thermal oven.",
      icon: Building,
      color: "from-orange-950/40 to-orange-900/10 border-orange-900/60"
    },
    {
      title: "Dead Electronic Exit Buttons",
      desc: "The sudden power failure cut electricity to the electronic exit buttons near the main doors. Trapped guests were left in complete, suffocating darkness, clawing desperately at toughened glass facades that refused to break.",
      icon: ShieldAlert,
      color: "from-amber-950/40 to-amber-900/10 border-amber-900/60"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col font-sans text-zinc-100"
      id="documentary-fullscreen-portal"
    >
      {/* Background canvas for real-time burning effect */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Grid overlay for high-tech aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-[#050505] pointer-events-none z-0" />

      {/* Header Controls */}
      <header className="relative z-20 flex justify-between items-center px-6 py-4 bg-black/60 backdrop-blur-md border-b border-[#EF4444]/20">
        <button
          onClick={() => {
            if (audioEngine) audioEngine.setTensionLevel(0.2);
            onClose();
          }}
          className="flex items-center gap-2.5 text-xs font-mono font-bold uppercase tracking-widest text-[#EF4444] border border-[#EF4444]/40 bg-red-950/20 hover:bg-[#EF4444] hover:text-white px-4 py-2 rounded-none transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          EXIT DOCUMENTARY INQUEST
        </button>

        <div className="flex items-center gap-3 font-mono text-[10px] tracking-widest text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span>LOCATION_FEED: FLOURISH_STAY_BB_FORENSICS</span>
        </div>
      </header>

      {/* Scrollable Main Area */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="relative z-10 flex-1 overflow-y-auto scroll-smooth pb-32"
        id="documentary-scrollable-container"
      >
        {/* UPPER PORTION: The Immersive 3D/Multi-dimensional Video Screen */}
        <div className="w-full min-h-[92vh] flex flex-col items-center justify-center pt-8 px-4 relative">
          
          {/* Diagnostic title badges around the 3D projection */}
          <div className="text-center mb-6 max-w-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[9px] uppercase tracking-widest mb-3"
            >
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>CASE LOG_06.03 // THE SIX-ROOM ILLUSION</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 via-zinc-200 to-red-400 font-display">
              The Six-Room Illusion
            </h1>
            <p className="text-xs text-zinc-400 font-light max-w-lg mx-auto mt-2 leading-relaxed">
              Unmasking the guesthouse tragedy of Hauz Rani, South Delhi. Watch the active rescue response documentary and scroll down to investigate the 5 chilling truths of structural negligence.
            </p>
          </div>

          {/* Multi-Dimensional 3D Skewed Video Screen Frame */}
          <div className="w-full max-w-4xl relative" style={{ perspective: "1500px" }}>
            <motion.div
              initial={{ rotateX: 12, rotateY: -10, rotateZ: 2, scale: 0.95 }}
              animate={{ 
                rotateX: scrollPosition > 100 ? 0 : 7, 
                rotateY: scrollPosition > 100 ? 0 : -5, 
                rotateZ: scrollPosition > 100 ? 0 : 1,
                scale: 1 
              }}
              transition={{ type: "spring", stiffness: 45, damping: 15 }}
              className="relative w-full aspect-video bg-zinc-950 border-2 border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.3),inset_0_0_30px_rgba(0,0,0,0.9)] overflow-hidden group"
              id="multi-dimensional-3d-screen"
            >
              {/* Sci-Fi Diagnostic Framing details on screen edges */}
              <div className="absolute top-2 left-3 font-mono text-[8px] text-red-500 opacity-60 z-10 select-none">
                CAM_FEED_B&B // SECURE_INQUEST
              </div>
              <div className="absolute top-2 right-3 font-mono text-[8px] text-zinc-500 z-10 select-none">
                FORENSIC // 03.06.2026
              </div>
              <div className="absolute bottom-2 left-3 font-mono text-[8px] text-zinc-500 z-10 select-none">
                VICTIMS_STATION: HAUZ_RANI
              </div>
              <div className="absolute bottom-2 right-3 font-mono text-[8px] text-red-500 opacity-60 z-10 select-none animate-pulse">
                INQUEST ●
              </div>

              {/* Preloader Overlay shown until the iframe fully loads */}
              {!iframeLoaded && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center gap-4 z-20">
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <div className="absolute inset-0 border-t-2 border-r-2 border-[#EF4444] rounded-full animate-spin" />
                    <Flame className="w-6 h-6 text-[#EF4444] animate-pulse" />
                  </div>
                  <div className="text-center px-4">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#EF4444] animate-pulse">
                      ESTABLISHING SECURE PROTOCOL...
                    </p>
                    <p className="font-mono text-[9px] text-zinc-500 mt-1.5 uppercase tracking-widest">
                      PRELOADING INQUEST DOCUMENTARY VIDEO
                    </p>
                  </div>
                </div>
              )}

              {/* Glowing burning corners overlay */}
              <div className="absolute inset-0 pointer-events-none border border-red-500/20 group-hover:border-red-500/50 transition-all duration-300 z-10" />
              
              {/* Requested iframe method with padding-bottom trick for perfect 16:9 ratio and strict-origin security */}
              <div style={{ left: 0, width: "100%", height: 0, position: "relative", paddingBottom: "56.25%", opacity: iframeLoaded ? 1 : 0, transition: "opacity 0.5s ease-in-out" }}>
                <iframe 
                  src="https://www.youtube.com/embed/IVhNhMK-OgY?rel=0&autoplay=1" 
                  style={{ top: 0, left: 0, width: "100%", height: "100%", position: "absolute", border: 0 }} 
                  allowFullScreen 
                  scrolling="no" 
                  allow="accelerometer *; clipboard-write *; encrypted-media *; gyroscope *; picture-in-picture *; web-share *;" 
                  referrerPolicy="strict-origin"
                  onLoad={() => setIframeLoaded(true)}
                  title="Malviya Nagar Fire Tragedy Inquest Documentary Footage"
                />
              </div>

              {/* Overlaying sparks/flicker layer inside the video area */}
              <div className="absolute inset-0 pointer-events-none mix-blend-screen bg-gradient-to-t from-red-950/20 to-transparent opacity-65 z-10" />
            </motion.div>

            {/* Holographic Wireframe base under the screen */}
            <div className="hidden md:flex justify-between items-center px-4 py-2 bg-zinc-950 border-x-2 border-b-2 border-red-500/20 text-[9px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-red-500" />
                SIGNAL ACQUISITION: SUCCESSFUL
              </span>
              <span>SCROLL DOWN FOR DETAILED EVIDENCE DOSSIER</span>
              <span>FPS: 60.0 // ENCRYPTION: CJS_NODE_3000</span>
            </div>
          </div>

          {/* Interactive Hint Banner to scroll down */}
          <div className="mt-12 flex flex-col items-center gap-1.5 pointer-events-none text-zinc-400">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black font-mono text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]">
              SCROLL TO UNMASK TRAGEDY DETAILS
            </span>
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-red-500 font-mono text-sm"
            >
              ↓
            </motion.div>
          </div>
        </div>

        {/* LOWER PORTION: Related Details Available Underneath on Scroll */}
        <div className="max-w-6xl mx-auto px-6 mt-16 space-y-20">
          
          {/* Grid of compliance failure statistics (Takeaway 1 & 4 & 5) */}
          <section id="evidence-inquest-metrics" className="pt-8 border-t border-zinc-900">
            <div className="mb-10 text-center md:text-left">
              <span className="text-xs font-bold font-mono tracking-widest text-[#EF4444] uppercase block mb-1">
                [EXHIBIT ALPHA]
              </span>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-100">
                The Regulatory & Spatial Breach Log
              </h2>
              <p className="text-xs text-zinc-400 font-light mt-1 max-w-2xl">
                Officially a Bed & Breakfast registered for just six guest rooms. Bajaj's building operated illegally as an unlicensed 5-story block with over 25 partitioned rooms, bypassing basic smoke alarms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INQUEST_METRICS.map((metric, i) => (
                <div 
                  key={i} 
                  className="bg-zinc-950 border border-zinc-900/60 p-5 rounded-none relative overflow-hidden flex flex-col justify-between h-48 shadow-lg hover:border-red-500/30 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-red-600/10 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <span className="text-[9px] font-mono font-bold text-red-500 tracking-wider block mb-1">
                      {metric.status}
                    </span>
                    <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-tight">
                      {metric.label}
                    </h3>
                  </div>
                  <div className="my-2">
                    <span className="text-3xl md:text-4xl font-black text-zinc-100 font-display">
                      {metric.value}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-light leading-normal border-t border-zinc-900/60 pt-2">
                    {metric.subText}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Takeaway 3: Architecture of a Trap */}
          <section id="evidence-structural-flaws" className="pt-8 border-t border-zinc-900">
            <div className="mb-10 text-center md:text-left">
              <span className="text-xs font-bold font-mono tracking-widest text-[#EF4444] uppercase block mb-1">
                [EXHIBIT BETA]
              </span>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-100">
                Anatomy of a Vertical Coffin
              </h2>
              <p className="text-xs text-zinc-400 font-light mt-1 max-w-2xl">
                The building's structural layout was a series of lethal traps. Lacking emergency exits, automated sprinklers, and power overrides, the architecture itself facilitated swift asphyxiation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STRUCTURAL_FLAWS.map((flaw, idx) => {
                const IconComponent = flaw.icon;
                return (
                  <div 
                    key={idx}
                    className={`p-6 border bg-gradient-to-br ${flaw.color} rounded-none flex flex-col justify-between min-h-[250px] relative overflow-hidden group hover:border-red-500/50 transition-all duration-300`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mb-4 text-[#EF4444]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-tight text-zinc-100 mb-2 font-display">
                        {flaw.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                        {flaw.desc}
                      </p>
                    </div>
                    <div className="absolute top-2 right-3 font-mono text-[9px] text-zinc-700 font-bold">
                      FLAW_IDENT_0{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Chronological interactive timeline (Takeaway 2: The Fatal 30-Minute Silence) */}
          <section id="evidence-timeline" className="pt-8 border-t border-zinc-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
              <div>
                <span className="text-xs font-bold font-mono tracking-widest text-[#EF4444] uppercase block mb-1">
                  [EXHIBIT GAMMA]
                </span>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-100">
                  The Fatal 30-Minute Silence
                </h2>
                <p className="text-xs text-zinc-400 font-light mt-1 max-w-xl">
                  A fire is a physical event, but a massacre is a human failure. Watch the timeline of the "Golden Half-Hour" squandered privately to protect hotel optics while guests slept.
                </p>
              </div>

              {/* Selector tabs for interactive timeline highlights */}
              <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 border border-zinc-900 rounded-none w-full md:w-auto">
                {TIMELINE.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTimelineItem(idx)}
                    className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider rounded-none transition-all ${
                      activeTimelineItem === idx 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 font-bold" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {item.time.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Timeline Navigation & Cards */}
              <div className="lg:col-span-4 space-y-3">
                {TIMELINE.map((item, idx) => {
                  const isActive = idx === activeTimelineItem;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveTimelineItem(idx)}
                      className={`p-4 border transition-all cursor-pointer rounded-none relative flex flex-col justify-between ${
                        isActive 
                          ? "bg-zinc-900 border-[#EF4444]/40 shadow-md scale-[1.02]" 
                          : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#EF4444]" />
                      )}
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-[#EF4444] font-mono">{item.time}</span>
                        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{item.badge}</span>
                      </div>
                      <h3 className={`text-xs font-bold uppercase tracking-tight ${isActive ? "text-zinc-100" : "text-zinc-400"}`}>
                        {item.title}
                      </h3>
                    </div>
                  );
                })}
              </div>

              {/* Right Side: Large Interactive Details Display Pane */}
              <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900/60 p-6 md:p-8 min-h-[300px] relative flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-zinc-600 border-l border-b border-zinc-900/60">
                  REF: LOG_PART_{activeTimelineItem + 1}
                </div>
                
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-600/10 text-[#EF4444] text-[9px] font-mono uppercase tracking-widest mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>TIMELINE AUDIT MATRIX // {TIMELINE[activeTimelineItem].time}</span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black uppercase text-zinc-100 tracking-tight mb-2">
                    {TIMELINE[activeTimelineItem].title}
                  </h3>
                  <p className="text-zinc-300 text-xs md:text-sm leading-relaxed font-light mb-6">
                    {TIMELINE[activeTimelineItem].description}
                  </p>
                </div>

                <div className="border-t border-zinc-900 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
                  <div className="text-zinc-500">
                    REAL_TIME_METRICS: <span className="text-red-400 font-bold">{TIMELINE[activeTimelineItem].metrics}</span>
                  </div>
                  <div className="text-zinc-600 text-[10px]">
                    STATION CODE: HAUZ-RANI-BB-LOG
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Survivor & First Responder Testimonial Accounts */}
          <section id="evidence-accounts" className="pt-8 border-t border-zinc-900">
            <div className="mb-10 text-center md:text-left">
              <span className="text-xs font-bold font-mono tracking-widest text-[#EF4444] uppercase block mb-1">
                [EXHIBIT DELTA]
              </span>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-100">
                Hearings & Inquest Testimonials
              </h2>
              <p className="text-xs text-zinc-400 font-light mt-1 max-w-xl">
                Official safety hearing testimonials unmasking the criminal negligence that caused twenty-two lives to be paid in blood.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-none flex flex-col justify-between">
                <p className="text-zinc-400 text-xs italic font-light leading-relaxed mb-6">
                  "The scale of the deception is measured by the human cost. The guesthouse tragedy completely wiped out eight members of the Aggarwal family, including Corporate CFO Vivek, his wife Tarjani, and their young daughters Angel (20) and Pearl (16). Pearl scored 97% on her board exams just days prior. They trusted a certified B&B, but Bajaj gave them a death trap."
                </p>
                <div className="border-t border-zinc-900 pt-4 font-mono text-[10px]">
                  <span className="text-red-400 font-bold block">INQUEST INVESTIGATOR</span>
                  <span className="text-zinc-600">Municipal Forensic Survey</span>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-none flex flex-col justify-between">
                <p className="text-zinc-400 text-xs italic font-light leading-relaxed mb-6">
                  "International medical tourists from Liberia, Nigeria, Mozambique, and Turkmenistan travel thousands of miles to Saket's elite hospitals. These families are funneled directly into these unlicensed, high-risk lodging facilities. Developers exploit the rural 'Lal Dora' exemption to completely bypass mandatory Fire NOCs."
                </p>
                <div className="border-t border-zinc-900 pt-4 font-mono text-[10px]">
                  <span className="text-red-400 font-bold block">PUBLIC SAFETY ADVOCATE</span>
                  <span className="text-zinc-600">Lal Dora Regulatory Reform Petition</span>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-none flex flex-col justify-between">
                <p className="text-zinc-400 text-xs italic font-light leading-relaxed mb-6">
                  "The MCD has arrested owner Lavkesh Bajaj and staff members under Section 105 of the Bharatiya Nyaya Sanhita (BNS) for Culpable Homicide Not Amounting to Murder. But we must ask: why does it take the charred remains of a 16-year-old girl and 21 others to trigger the enforcement of existing safety laws?"
                </p>
                <div className="border-t border-zinc-900 pt-4 font-mono text-[10px]">
                  <span className="text-red-400 font-bold block">SUPREME COURT ADVOCATE</span>
                  <span className="text-zinc-600">MCD Sealing Drive Counsel</span>
                </div>
              </div>
            </div>
          </section>

          {/* Action Footer Callout */}
          <section className="bg-red-950/15 border border-[#EF4444]/20 p-8 text-center flex flex-col items-center justify-center max-w-4xl mx-auto rounded-none">
            <AlertTriangle className="w-8 h-8 text-[#EF4444] mb-3 animate-pulse" />
            <h3 className="text-lg font-black uppercase text-zinc-100 tracking-tight mb-2">
              CULPABLE HOMICIDE DRIVE
            </h3>
            <p className="text-zinc-400 text-xs font-light max-w-xl leading-relaxed mb-6">
              When safety regulations are ignored for commercial gain, the price is ultimately paid in human lives. We must demand an immediate, transparent re-evaluation of every commercial license granted under Lal Dora exemptions.
            </p>
            <button
              onClick={() => {
                if (audioEngine) audioEngine.setTensionLevel(0.2);
                onClose();
              }}
              className="px-6 py-2.5 bg-[#EF4444] hover:bg-red-600 text-zinc-100 font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300"
            >
              ➔ RETURN TO METROPOLITAN ASSESSMENT
            </button>
          </section>

        </div>
      </div>
    </motion.div>
  );
}
