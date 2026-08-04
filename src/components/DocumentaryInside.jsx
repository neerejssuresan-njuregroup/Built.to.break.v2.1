/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ArchitecturalDiagramModal from "./ArchitecturalDiagramModal";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  ReferenceLine 
} from "recharts";
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
  VolumeX,
  BookOpen,
  UserX,
  FileText,
  Building,
  Thermometer,
  Activity,
  ArrowUp,
  ArrowDown,
  X,
  Scale
} from "lucide-react";

// Framer Motion Scrollytelling Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    }
  }
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const chartVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const FLOOR_DATA = [
  {
    id: 5,
    level: "FLOOR 05",
    name: "Penthouse Lodging",
    risk: "Critical Gas Accumulation",
    hazard: "Smoke Poisoning Hazard",
    temp: "800°C",
    co: "1,600 PPM",
    survivalChance: "Critical (Virtually 0% after 20m)",
    timeToUnconscious: "Under 2 minutes",
    brief: "The uppermost penthouse rooms acted as a collection dome for all rising toxic gases. Due to the high-velocity convective draft up the staircase, carbon monoxide pooled here first and reached fatal concentrations of 1,600 PPM within 25 minutes, suffocating sleeping guests long before any flames reached this level. Trapped by sealed windows, escape was impossible.",
    recommendation: "Mandatory smoke barriers, automatic self-closing fire doors, and accessible roof escape routes with physical mechanical pushbars."
  },
  {
    id: 4,
    level: "FLOOR 04",
    name: "Guest Accommodations",
    risk: "Fatal Heat Bottleneck",
    hazard: "Staircase Auto-Ignition",
    temp: "650°C",
    co: "1,200 PPM",
    survivalChance: "Lethal Threshold",
    timeToUnconscious: "3 - 4 minutes",
    brief: "On the fourth floor, the highly flammable wooden wall paneling and plastic ceiling trims lining the staircase caught fire due to intense radiant heat from below. This created a raging vertical firewall that blocked the only escape route. Air temperature in the corridor quickly reached 650°C, causing instant lung damage on inhalation.",
    recommendation: "Prohibition of combustible wood paneling and plastic polymers in exit pathways. Installation of external steel fire escapes."
  },
  {
    id: 3,
    level: "FLOOR 03",
    name: "Guest Accommodations",
    risk: "Oxygen Exhaustion & Smoke",
    hazard: "Sealed Facade Trap",
    temp: "450°C",
    co: "850 PPM",
    survivalChance: "Low",
    timeToUnconscious: "4 - 5 minutes",
    brief: "The third-floor facade featured tight, sealed architectural glass panels with no openable windows. This design element, intended to conserve air-conditioning and soundproof against noisy alleys below, became a deadly seal. Fresh oxygen was depleted within 12 minutes, replaced by rising toxic carbon monoxide soot. Occupants had no ventilation.",
    recommendation: "Mandatory openable fire-rescue ventilation panels or easily breakable tempered glass marked with external reflective safety indicators."
  },
  {
    id: 2,
    level: "FLOOR 02",
    name: "Aggarwal Family Suite",
    risk: "Fatal Ingress of Gas",
    hazard: "Trapped & Suffocated",
    temp: "320°C",
    co: "600 PPM",
    survivalChance: "Extremely Low",
    timeToUnconscious: "5 - 6 minutes",
    brief: "This suite housed the Aggarwal family. The heavy ornamental wooden doors offered minor barrier resistance, but toxic gases penetrated the gaps. Vivek, Tarjani, their daughters Angel and Pearl scored no escape as smoke seeped under the doors. At 08:35 AM, carbon monoxide reached highly lethal concentrations, knocking out consciousness.",
    recommendation: "Flame-retardant smoke seals around all guest room doors. Mandatory battery-operated in-room smoke alarms to warn sleeping occupants."
  },
  {
    id: 1,
    level: "FLOOR 01",
    name: "Reception & Lobby",
    risk: "Locked Exit Gridlock",
    hazard: "Dead Electronic Exit",
    temp: "180°C",
    co: "300 PPM",
    survivalChance: "Medium (Early phase only)",
    timeToUnconscious: "8 - 10 minutes",
    brief: "The main reception area. When the basement fire severed the building's electrical mains, the electronic access-control buttons near the primary exit failed. Because there was no manual failsafe or mechanical escape override, the heavy magnetic-lock glass doors remained clamped shut. Terrified guests clustered at the doors, unable to push them open.",
    recommendation: "Fail-safe mechanical exit push-bars. All electronic magnetic locks must automatically release upon loss of power or fire alarm trigger."
  },
  {
    id: 0,
    level: "BASEMENT",
    name: "Kitchen & Gas Store",
    risk: "Ignition Ground Zero",
    hazard: "Auto-Ignition: 08:20 AM",
    temp: "900°C+",
    co: "1,500 PPM+ (Source)",
    survivalChance: "Immediate Fatality Area",
    timeToUnconscious: "Seconds",
    brief: "The origin point of the catastrophe. An electric deep-fryer filled with commercial cooking oil was left unattended by the kitchen cook during an unauthorized tea break. The oil temperature surpassed auto-ignition limits, bursting into self-sustaining flame. The heat quickly detonated two spare LPG gas cylinders stored nearby without safety permits, fueling the initial blast.",
    recommendation: "Strict zoning ban on commercial kitchens in residential basements. Mandatory fire suppression gas systems and automatic gas leak shut-off valves."
  }
];

const EVIDENCE_DATABASE = {
  intro: {
    title: "FORENSIC SITE LAYOUT",
    sub: "Lal Dora Exemptions vs Access Mandates",
    lawCode: "NBC 2016, Part 3, Clause 4.6 (Access Streets)",
    excerpts: [
      {
        clause: "Clause 4.6.1 - Fire Engine Access",
        text: "Any building of residential or commercial occupancy exceeding 15 meters in height must face a street of width not less than 6.0 meters, with street-to-property setbacks enabling 180° vehicle stabilization."
      },
      {
        clause: "Delhi Lal Dora Land Regulation Act (1963 Exemption)",
        text: "Exempts historic village settlements from standard municipal bylaws. However, local fire services retain statutory authority to seal any high-hazard commercial structures operating in lanes below 4.5m."
      }
    ],
    interactiveTitle: "Lal Dora Arbitrage Scanner",
    interactiveDesc: "Adjust access lane width to see if standard municipal fire tenders can enter, and view the associated statutory penalty.",
    diagramType: "site-layout"
  },
  breach: {
    title: "SPATIAL PARTITION FRAUD",
    sub: "B&B Registration Limit Exploitation",
    lawCode: "NBC 2016, Part 4, Section 3.1.2 (Occupancy)",
    excerpts: [
      {
        clause: "Section 3.1.2.1 - Bed & Breakfast Lodging",
        text: "B&B establishments registered under municipal tourism schemes must restrict guest rooms to a maximum of 6 rooms per building, with a maximum density of 2 persons per room."
      },
      {
        clause: "DMC Act Section 347 (Illegal Change of Use)",
        text: "Subdividing single residential floor plates into multiple individual cells using drywalls or combustible wooden panels constitutes a high-grade spatial felony, subject to immediate structural sealing without prior notice."
      }
    ],
    interactiveTitle: "Illegal Subdivisions Calculator",
    interactiveDesc: "Slide to partition a standard 6-room floorplan and simulate how density blocks the escape path while increasing rental margins.",
    diagramType: "spatial-partitions"
  },
  flaws: {
    title: "COMBUSTIBILITY & OVERLAYS",
    sub: "Chamber Convection & Lock Failures",
    lawCode: "NBC 2016, Part 4, Clause 4.8.2 (Exit Corridors)",
    excerpts: [
      {
        clause: "Clause 4.8.2.3 - Prohibited Materials",
        text: "Interior exit stairways, corridors, and escape passages shall not be lined with wood paneling, polyurethane foams, acrylic sheets, or any material with a smoke development index exceeding 50."
      },
      {
        clause: "NBC Part 4, Clause 3.4.15.2 - Magnetic Lock Failsafes",
        text: "All access-controlled exit doors must be equipped with manual mechanical crash-bars. Electronic locks must automatically disengage immediately upon any power grid severance."
      }
    ],
    interactiveTitle: "Staircase Material Flammability Tester",
    interactiveDesc: "Select different corridor linings to test their fire rating (Class A to D) and see how they contribute to the fatal Chimney Effect.",
    diagramType: "combustibility"
  },
  timeline: {
    title: "THE GOLDEN HALF-HOUR RESPONSES",
    sub: "Private Containment Delay and CO Curves",
    lawCode: "NBC 2016, Part 4, Section 4.14 (Emergency Protocol)",
    excerpts: [
      {
        clause: "Section 4.14.1 - Emergency Dispatch Obligations",
        text: "Building management and staff must trigger manual pull stations and initiate direct notification to the Fire Control Room within 180 seconds of any smoke or heat detection."
      },
      {
        clause: "Bharatiya Nyaya Sanhita (BNS) Sec. 105",
        text: "Culpable homicide not amounting to murder. Delaying emergency alerts for private commercial interests while guests are trapped falls directly under BNS Section 105 liability."
      }
    ],
    interactiveTitle: "Response Delay Liability Scale",
    interactiveDesc: "Drag the staff dispatch delay slider to trace carbon monoxide rise against the timeline and assign specific criminal charges.",
    diagramType: "timeline-co"
  },
  accounts: {
    title: "MUNICIPAL LITIGATION RECORD",
    sub: "Testimonials, Structural Safety NOC Forgery",
    lawCode: "NBC 2016, Part 1, Clause 5.2 (Architect Certification)",
    excerpts: [
      {
        clause: "Clause 5.2.1 - Professional Verification",
        text: "Licensed structural engineers and architects who certify buildings as safe or compliant without conducting physical structural or fire egress tests are subject to criminal collusion charges, permanent blacklisting, and professional license revocation."
      },
      {
        clause: "BNS Sec. 248 - Forgery of Safety Certificates",
        text: "Executing or submitting forged fire NOCs or safety clearances carries a prison term of up to 7 years with mandatory non-bailable judicial custody."
      }
    ],
    interactiveTitle: "Certificate Forgery Analyzer",
    interactiveDesc: "Inspect the building's safety NOC. Click on key seals to reveal the forged signatures and mismatched municipal records.",
    diagramType: "noc-audit"
  }
};

function DocumentaryInside({ onClose, audioEngine }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isAudioAudible, setIsAudioAudible] = useState(audioEngine ? audioEngine.getIsAudible() : false);

  useEffect(() => {
    if (audioEngine) {
      setIsAudioAudible(audioEngine.getIsAudible());
      const unsubscribe = audioEngine.subscribe(({ isAudible }) => {
        setIsAudioAudible(isAudible);
      });
      return unsubscribe;
    }
  }, [audioEngine]);

  const toggleMute = () => {
    if (audioEngine) {
      audioEngine.toggleAudio();
    }
  };

  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTimelineItem, setActiveTimelineItem] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState(0);

  // Persistent Evidence Side-bar Active Chapter State
  const [activeChapter, setActiveChapter] = useState("intro");
  const [showMobileEvidence, setShowMobileEvidence] = useState(false);

  // Interactive Sidebar States
  const [laneWidth, setLaneWidth] = useState(1.5);
  const [partitionsCount, setPartitionsCount] = useState(6);
  const [liningMaterial, setLiningMaterial] = useState("plywood");
  const [alertDelay, setAlertDelay] = useState(25);
  const [activeNocStamp, setActiveNocStamp] = useState(null);
  const [selectedExcerptForModal, setSelectedExcerptForModal] = useState(null);

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
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll > 0) {
      setScrollProgress((target.scrollTop / maxScroll) * 100);
    } else {
      setScrollProgress(0);
    }

    // Determine active chapter dynamically based on scroll offsets of lowered sections
    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      let currentActive = "intro";
      
      const chapters = [
        { id: "intro", elementId: "documentary-scrollable-container" },
        { id: "breach", elementId: "evidence-inquest-metrics" },
        { id: "flaws", elementId: "evidence-structural-flaws" },
        { id: "timeline", elementId: "evidence-timeline" },
        { id: "accounts", elementId: "evidence-accounts" }
      ];

      for (const ch of chapters) {
        const el = document.getElementById(ch.elementId);
        if (el) {
          const elRect = el.getBoundingClientRect();
          // If the element top has entered the viewport's middle, make it active
          if (elRect.top - containerRect.top <= containerRect.height / 2) {
            currentActive = ch.id;
          }
        }
      }
      setActiveChapter(currentActive);
    }
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

  // Data for the comparative charts (Exhibit Alpha)
  const BREACH_DATA = [
    {
      name: "Guest Rooms",
      legal: 6,
      actual: 25,
      unit: " Rooms",
      description: "Bed & Breakfast standard room limits vs Lavkesh Bajaj's illegal partitions"
    },
    {
      name: "Max Occupants",
      legal: 12,
      actual: 65,
      unit: " People",
      description: "Maximum safe lodging capacity vs estimated actual occupancy on June 3"
    },
    {
      name: "Emergency Exits",
      legal: 2,
      actual: 1,
      unit: " Exits",
      description: "Dual fire exits mandated by law vs single wood-paneled staircase block"
    },
    {
      name: "Compliant Systems",
      legal: 100,
      actual: 0,
      unit: " % compliance",
      description: "Active sprinklers, mechanical detectors & emergency electronic bypasses"
    }
  ];

  // Data for Golden Half-Hour gas and temp levels (Exhibit Gamma)
  const ATMOSPHERIC_DATA = [
    { name: "08:20 AM", timeOffset: "0m", temp: 30, co: 35, event: "Ignition" },
    { name: "08:25 AM", timeOffset: "5m", temp: 75, co: 80, event: "Unattended Smoldering" },
    { name: "08:30 AM", timeOffset: "10m", temp: 160, co: 190, event: "Negi's Tea Break" },
    { name: "08:35 AM", timeOffset: "15m", temp: 310, co: 420, event: "Private Suppression" },
    { name: "08:40 AM", timeOffset: "20m", temp: 520, co: 810, event: "Staircase Flushed" },
    { name: "08:45 AM", timeOffset: "25m", temp: 690, co: 1250, event: "Frantic Final Calls" },
    { name: "08:50 AM", timeOffset: "30m", temp: 800, co: 1600, event: "DFS Arrives" }
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

  // Helper to render the interactive Evidence Sidebar content
  const renderSidebarContent = () => {
    const activeData = EVIDENCE_DATABASE[activeChapter] || EVIDENCE_DATABASE.intro;

    return (
      <div className="space-y-6">
        {/* Sync Status Badge */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-red-500">
              evidence synced: {activeChapter.toUpperCase()}
            </span>
          </div>
          <span className="text-[8px] font-mono text-zinc-500">HAUZ-RANI-NOC-REG</span>
        </div>

        {/* Dossier Header */}
        <div>
          <h4 className="text-sm font-black font-mono tracking-tight text-white uppercase leading-none">
            {activeData.title}
          </h4>
          <p className="text-[11px] text-zinc-400 font-light mt-1.5">
            {activeData.sub}
          </p>
        </div>

        {/* Legal Codes and Excerpts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-red-500" />
            <span className="font-mono text-[9px] text-red-400 font-bold uppercase tracking-wider">
              {activeData.lawCode}
            </span>
          </div>
          <div className="space-y-2">
            {activeData.excerpts.map((excerpt, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedExcerptForModal({ ...excerpt, sectionId: activeChapter })}
                className="bg-[#0b0b0d] hover:bg-zinc-950 border-l-2 border-red-900/60 hover:border-red-500 p-3 space-y-1.5 font-mono text-[10px] leading-relaxed relative overflow-hidden cursor-pointer transition-all duration-300 group"
                title="Click to view detailed interactive architectural diagram"
              >
                {/* Decorative scale background icon */}
                <div className="absolute right-2 bottom-1 text-[24px] font-bold text-zinc-900/10 pointer-events-none select-none group-hover:text-red-500/10 transition-colors">
                  §
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-zinc-200 group-hover:text-red-400 font-bold block tracking-tight uppercase text-[9px] transition-colors">
                    {excerpt.clause}
                  </span>
                  <span className="text-[7px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-all uppercase tracking-wider flex-shrink-0">
                    VIEW DIAGRAM ↗
                  </span>
                </div>
                <span className="text-zinc-400 group-hover:text-zinc-300 font-sans text-xs leading-normal font-light block transition-colors">
                  {excerpt.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Diagnosis Section */}
        <div className="border border-red-500/15 bg-red-950/5 p-4 rounded-none relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
          
          <span className="text-[8px] font-mono text-red-500 font-black uppercase tracking-[0.2em] block mb-1">
            interactive forensics simulation
          </span>
          <h5 className="text-[11px] font-bold uppercase font-mono text-zinc-100 tracking-tight">
            {activeData.interactiveTitle}
          </h5>
          <p className="text-[10px] text-zinc-400 font-sans mt-1 leading-normal font-light">
            {activeData.interactiveDesc}
          </p>

          {/* Render corresponding interactive graphic and sliders based on diagramType */}
          {activeData.diagramType === "site-layout" && (
            <div className="space-y-4 mt-4 font-mono">
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>MIN: 1.0m</span>
                <span className="text-red-400 font-bold">ALLEY WIDTH: {laneWidth.toFixed(1)}m</span>
                <span>MAX: 10.0m</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={laneWidth}
                onChange={(e) => setLaneWidth(parseFloat(e.target.value))}
                className="w-full accent-red-600 bg-zinc-900 h-1 cursor-pointer"
                aria-label="Access lane width slider"
              />
              
              {/* Lane width status visualization */}
              <div className="border border-zinc-900 bg-zinc-950 p-3 mt-2 text-[10px] leading-relaxed text-zinc-400 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>NBC MIN STREET MANDATE:</span>
                  <span className="text-green-400">6.0 Meters (Part 3 Sec 4)</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>SAFETY DEVIATION RATE:</span>
                  <span className={laneWidth < 6 ? "text-red-500 animate-pulse" : "text-green-400"}>
                    {laneWidth < 6 ? `${Math.round((1 - laneWidth / 6) * 100)}% BREACHED` : "0% (COMPLIANT)"}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>DFS FIRE TENDER ACCESS:</span>
                  <span className={laneWidth < 4.5 ? "text-red-500" : laneWidth < 6 ? "text-orange-400" : "text-green-400"}>
                    {laneWidth < 4.5 ? "IMPASSABLE GRIDLOCK (CRITICAL)" : laneWidth < 6 ? "DELAYED ACCESS (HIGH)" : "MINIMAL DEVIATION (SAFE)"}
                  </span>
                </div>
              </div>

              {/* Graphic container simulating the lane */}
              <div className="border border-zinc-900 bg-zinc-950 h-20 relative overflow-hidden flex items-center justify-between px-10">
                {/* Left Wall */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-around text-[6px] text-zinc-700 font-sans text-center">
                  <span>BLDG</span>
                  <span>BLDG</span>
                </div>

                {/* Road Lane */}
                <div className="flex-1 h-full relative flex items-center justify-center">
                  {/* Road markings */}
                  <div className="absolute inset-x-0 h-[1px] border-b border-dashed border-zinc-800" />
                  
                  {/* Fire Truck block representation */}
                  <div 
                    className={`px-3 py-1.5 border font-bold text-[9px] text-center transition-all ${
                      laneWidth < 4.5 
                        ? "bg-red-950/60 border-red-600 text-red-500 animate-pulse" 
                        : "bg-red-600/20 border-red-500 text-red-400"
                    }`}
                  >
                    {laneWidth < 4.5 ? "COLLISION BLOCKED" : "FIRE TENDER PASS"}
                  </div>
                </div>

                {/* Right Wall */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-zinc-900 border-l border-zinc-800 flex flex-col justify-around text-[6px] text-zinc-700 font-sans text-center">
                  <span>BLDG</span>
                  <span>BLDG</span>
                </div>
              </div>
            </div>
          )}

          {activeData.diagramType === "spatial-partitions" && (
            <div className="space-y-4 mt-4 font-mono">
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>LEGAL CAP: 6</span>
                <span className="text-red-400 font-bold">ACTIVE ROOMS: {partitionsCount} Cells</span>
                <span>MAX CAP: 30</span>
              </div>
              <input
                type="range"
                min="6"
                max="30"
                step="1"
                value={partitionsCount}
                onChange={(e) => setPartitionsCount(parseInt(e.target.value))}
                className="w-full accent-red-600 bg-zinc-900 h-1 cursor-pointer"
                aria-label="Rooms partitions slider"
              />
              
              {/* Simulated floor plate grid */}
              <div className="border border-zinc-900 bg-zinc-950 p-2 rounded-none mt-2">
                <div className="text-[8px] text-zinc-500 mb-2 uppercase text-center font-bold">
                  GUESTHOUSE SECTION ALIGNMENT MATRIX
                </div>
                <div className="grid grid-cols-6 gap-1 h-16 overflow-hidden">
                  {Array.from({ length: partitionsCount }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center justify-center text-[7px] font-bold border transition-all ${
                        partitionsCount === 6 
                          ? "bg-green-950/40 border-green-700/60 text-green-400" 
                          : partitionsCount <= 12 
                          ? "bg-orange-950/40 border-orange-700/60 text-orange-400" 
                          : "bg-red-950/50 border-red-800/80 text-red-400 animate-pulse"
                      }`}
                    >
                      R_{i+1}
                    </div>
                  ))}
                </div>
                
                {/* Statistics output */}
                <div className="mt-3 text-[9px] text-zinc-400 flex flex-col gap-1 border-t border-zinc-900/60 pt-2.5">
                  <div className="flex justify-between">
                    <span>Escape Path Clearance:</span>
                    <span className={partitionsCount > 15 ? "text-red-500 font-bold" : "text-white font-bold"}>
                      {(2.0 - (partitionsCount - 6) * 0.06).toFixed(2)} meters
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Occupancy Load:</span>
                    <span className="text-white font-bold">{partitionsCount * 2} Persons</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Illegal Monthly Profit Boost:</span>
                    <span className="text-green-400 font-bold">+₹{(partitionsCount - 6) * 12000}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NBC Code Safety Status:</span>
                    <span className={partitionsCount > 6 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                      {partitionsCount > 6 ? "CRITICAL CODE BREACH" : "COMPLIANT LIMIT"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeData.diagramType === "combustibility" && (
            <div className="space-y-4 mt-4 font-mono">
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                {[
                  { id: "plywood", name: "Plywood Panel", rating: "Class D (Lethal)" },
                  { id: "acrylic", name: "Acrylic Panel", rating: "Class D (Toxic)" },
                  { id: "concrete", name: "Concrete / Tile", rating: "Class A (Safe)" },
                  { id: "gypsum", name: "Gypsum Board", rating: "Class B (Compliant)" }
                ].map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setLiningMaterial(mat.id)}
                    className={`px-2 py-1.5 border transition-all text-left ${
                      liningMaterial === mat.id 
                        ? "border-red-500 bg-red-950/20 text-red-400 font-bold" 
                        : "border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <div className="font-bold text-[8px] uppercase">{mat.name}</div>
                    <div className="text-[7px] opacity-75">{mat.rating}</div>
                  </button>
                ))}
              </div>

              {/* Simulated central shaft */}
              <div className="border border-zinc-900 bg-zinc-950 p-2.5 relative h-28 overflow-hidden flex items-stretch">
                <div className="w-1/4 border-r border-zinc-900/80 pr-1.5 flex flex-col justify-between text-[7px] text-zinc-500 py-1">
                  <span>PENTHOUSE</span>
                  <span>FLOOR 3</span>
                  <span>BASEMENT</span>
                </div>
                
                <div className="flex-1 relative flex flex-col justify-end items-center px-4">
                  {/* Fire rise visual simulation */}
                  {liningMaterial === "plywood" && (
                    <motion.div 
                      animate={{ height: ["10%", "100%", "10%"] }} 
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} 
                      className="absolute bottom-0 inset-x-2 bg-gradient-to-t from-red-600/50 via-orange-500/35 to-transparent blur-sm"
                    />
                  )}
                  {liningMaterial === "acrylic" && (
                    <motion.div 
                      animate={{ height: ["10%", "95%", "10%"] }} 
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }} 
                      className="absolute bottom-0 inset-x-2 bg-gradient-to-t from-orange-600/50 via-yellow-500/30 to-transparent blur-sm"
                    />
                  )}
                  {liningMaterial === "gypsum" && (
                    <motion.div 
                      animate={{ height: ["5%", "25%", "5%"] }} 
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} 
                      className="absolute bottom-0 inset-x-2 bg-gradient-to-t from-emerald-600/25 to-transparent blur-sm"
                    />
                  )}
                  
                  <div className="relative z-10 w-full space-y-1.5 py-1">
                    <div className="border-b border-zinc-900 h-2 w-full text-[7px] text-zinc-500 font-bold text-center">Stairwell Core</div>
                    <div className="border-b border-zinc-900 h-2 w-full" />
                    <div className="border-b border-zinc-900 h-2 w-full" />
                  </div>
                </div>

                <div className="w-2/5 pl-2 border-l border-zinc-900/80 flex flex-col justify-center text-[8px] space-y-1 leading-snug">
                  <span className="text-zinc-600 uppercase font-bold text-[6px]">CHIMNEY VELOCITY</span>
                  <span className="font-bold text-white">
                    {liningMaterial === "plywood" ? "8.4 m/s (EXTREME)" : liningMaterial === "acrylic" ? "7.2 m/s (FAST)" : liningMaterial === "gypsum" ? "1.1 m/s" : "0.0 m/s"}
                  </span>
                  <span className="text-zinc-600 uppercase font-bold text-[6px] mt-1">TOXIC GAS</span>
                  <span className="font-bold text-red-500">
                    {liningMaterial === "plywood" ? "1,600 PPM" : liningMaterial === "acrylic" ? "1,200 PPM" : liningMaterial === "gypsum" ? "150 PPM" : "0 PPM"}
                  </span>
                  <span className="text-zinc-600 uppercase font-bold text-[6px] mt-1">NBC STATUS</span>
                  <span className={liningMaterial === "concrete" || liningMaterial === "gypsum" ? "text-green-500 font-bold" : "text-red-500 font-bold animate-pulse"}>
                    {liningMaterial === "concrete" ? "APPROVED" : liningMaterial === "gypsum" ? "COMPLIANT" : "ILLEGAL"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeData.diagramType === "timeline-co" && (
            <div className="space-y-4 mt-4 font-mono">
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>IMMEDIATE: 1 Min</span>
                <span className="text-red-400 font-bold">ALERT DELAY: {alertDelay} Mins</span>
                <span>CRITICAL: 30 Mins</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={alertDelay}
                onChange={(e) => setAlertDelay(parseInt(e.target.value))}
                className="w-full accent-red-600 bg-zinc-900 h-1 cursor-pointer"
                aria-label="Staff notification delay slider"
              />
              
              <div className="bg-zinc-950 border border-zinc-900 p-3 mt-2 text-[10px] space-y-1.5 text-zinc-400">
                <div className="flex justify-between">
                  <span>CO Saturation Level:</span>
                  <span className={alertDelay > 15 ? "text-red-500 animate-pulse font-bold" : "text-white font-bold"}>
                    {alertDelay <= 3 ? "45 PPM (Normal)" : `${45 + (alertDelay - 3) * 55} PPM`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Corridor Temperature:</span>
                  <span className="text-orange-400 font-bold">
                    {alertDelay <= 3 ? "35°C" : alertDelay <= 10 ? `${35 + (alertDelay - 3) * 15}°C` : `${140 + (alertDelay - 10) * 32}°C`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Survival Escape Rating:</span>
                  <span className={alertDelay > 15 ? "text-red-500 font-bold" : "text-green-400 font-bold"}>
                    {alertDelay <= 5 ? "98% (Secure)" : alertDelay <= 15 ? "45% (Choked)" : "< 2% (Asphyxiated)"}
                  </span>
                </div>
                
                {/* Criminal Code readout */}
                <div className="border-t border-zinc-900/60 pt-2 mt-1.5">
                  <span className="text-zinc-600 block uppercase font-bold text-[7px] mb-1">CRIMINAL LIABILITY INQUEST</span>
                  <div className={`p-2 font-bold text-center border text-[8px] leading-tight ${
                    alertDelay <= 3 
                      ? "bg-green-950/20 border-green-800 text-green-400" 
                      : alertDelay <= 12 
                      ? "bg-yellow-950/20 border-yellow-800 text-yellow-400" 
                      : "bg-red-950/30 border-red-800 text-red-500 animate-pulse"
                  }`}>
                    {alertDelay <= 3 
                      ? "NO LIABILITY ASSIGNED" 
                      : alertDelay <= 12 
                      ? "NEGLIGENT CONDUCT (BNS SEC. 287)" 
                      : "CULPABLE HOMICIDE (BNS SEC. 105)"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeData.diagramType === "noc-audit" && (
            <div className="space-y-4 mt-4 font-mono">
              <div className="border border-zinc-900 bg-zinc-950 p-3 relative shadow-sm">
                <div className="text-center border-b border-zinc-900 pb-2 mb-2">
                  <div className="text-[7px] text-zinc-500 font-bold">SAFETY ASSESSMENT RECORD</div>
                  <div className="text-[9px] font-black text-zinc-300 uppercase tracking-wide">MUNICIPAL SAFETY CLEARANCE</div>
                </div>

                <div className="text-[8px] leading-relaxed text-zinc-500 space-y-1.5">
                  <p>Check the stamps below for legal anomalies:</p>
                  <div className="flex flex-col gap-1 pt-1">
                    {[
                      { id: "stamp", label: "A1. SECTOR MCD OFFICIAL SEAL" },
                      { id: "owner", label: "A2. PROPRIETOR LAWFUL INDEMNITY" },
                      { id: "inspector", label: "A3. DFS ASSIGNED OFFICER CODE" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setActiveNocStamp(btn.id)}
                        className={`text-left px-2 py-1.5 border text-[7px] font-bold transition-all ${
                          activeNocStamp === btn.id 
                            ? "border-yellow-500 bg-yellow-950/20 text-yellow-400" 
                            : "border-zinc-900 bg-zinc-950/50 text-zinc-400 hover:border-yellow-600/30"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Node Analysis */}
              <div className="bg-zinc-950 border border-zinc-900 p-3 min-h-[90px] flex flex-col justify-center text-[9px] leading-relaxed">
                {!activeNocStamp ? (
                  <span className="text-zinc-600 text-center italic uppercase block font-sans">
                    Click any yellow node stamp above to run forensic integrity scan and unmask loopholes
                  </span>
                ) : (
                  <div>
                    {activeNocStamp === "stamp" && (
                      <p>
                        <strong className="text-yellow-500 uppercase block mb-0.5">MCD STAMP DEFICIT:</strong>
                        Forensic ink checks reveal the MCD seal was forged from a 2021 approval. Developers copied the stamp onto high-density 18m layouts to bypass central structural height regulations.
                      </p>
                    )}
                    {activeNocStamp === "owner" && (
                      <p>
                        <strong className="text-yellow-500 uppercase block mb-0.5">OWNER ASSUMPTION DECEIT:</strong>
                        Lavkesh Bajaj signed under a shell firm "Flourish LLC" which dissolved prior to the incident, shielding personal assets and capital from victims' lawsuit warrants.
                      </p>
                    )}
                    {activeNocStamp === "inspector" && (
                      <p>
                        <strong className="text-yellow-500 uppercase block mb-0.5">OFFICER CERTIFICATE FORGERY:</strong>
                        The DFS Chief signature is entirely fabricated. Municipal digital registers confirm no clearance dispatch records exist for this property in standard archives.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col font-sans text-zinc-100"
      id="documentary-fullscreen-portal"
    >
      {/* Fixed-position horizontal scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-950 z-[100] pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
          style={{ width: `${scrollProgress}%` }}
          initial={{ width: "0%" }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        />
      </div>

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

        <div className="flex items-center gap-4">
          {audioEngine && (
            <button
              onClick={toggleMute}
              className="p-2 border border-[#EF4444]/30 bg-red-950/10 hover:bg-zinc-900 hover:border-zinc-500 transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center"
              title={isAudioAudible ? "Mute Ambient Audio" : "Play Ambient Audio"}
            >
              {isAudioAudible ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-red-500 animate-pulse" />}
            </button>
          )}
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-widest text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>LOCATION_FEED: FLOURISH_STAY_BB_FORENSICS</span>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Layout Panel */}
      <div className="relative flex-1 flex overflow-hidden z-10 w-full">
        
        {/* Left: Scrollable Main Area */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scroll-smooth pb-32 relative z-10"
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
          <motion.section 
            id="evidence-inquest-metrics" 
            className="pt-8 border-t border-zinc-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
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

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              variants={staggerContainer}
            >
              {INQUEST_METRICS.map((metric, i) => (
                <motion.div 
                  key={i} 
                  variants={gridItemVariants}
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
                </motion.div>
              ))}
            </motion.div>

            {/* Visual comparative chart panel */}
            <motion.div 
              className="mt-8 bg-zinc-950 border border-zinc-900/80 p-5 md:p-6 shadow-2xl relative"
              variants={chartVariants}
            >
              <div className="absolute top-2 right-3 font-mono text-[8px] text-zinc-500">
                AUDIT_DIAGRAM // SCALE: REGULATORY_GAP
              </div>
              <h3 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                QUANTITATIVE BREACH AUDIT: LEGAL CODE VS PHYSICAL REALITY
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={BREACH_DATA}
                      margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={{ stroke: "#27272a" }}
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: "#27272a" }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const dataObj = payload[0].payload;
                            return (
                              <div className="bg-zinc-950 border border-red-500/40 p-3 shadow-lg font-mono text-[10px] text-zinc-300">
                                <p className="font-bold text-red-500 mb-1">{label}</p>
                                <p className="text-zinc-500 text-[9px] mb-2 font-sans font-light leading-snug">{dataObj.description}</p>
                                <div className="flex justify-between gap-4 mt-0.5">
                                  <span className="text-zinc-400">Legal Limit:</span>
                                  <span className="font-bold text-zinc-300">{dataObj.legal}{dataObj.unit}</span>
                                </div>
                                <div className="flex justify-between gap-4 mt-0.5">
                                  <span className="text-[#EF4444]">Actual (Illegal):</span>
                                  <span className="font-bold text-red-400">{dataObj.actual}{dataObj.unit}</span>
                                </div>
                                {dataObj.legal > 0 && (
                                  <div className="flex justify-between gap-4 mt-0.5">
                                    <span className="text-orange-400">Overload Factor:</span>
                                    <span className="font-bold text-orange-400">
                                      {Math.round((dataObj.actual / dataObj.legal) * 100)}%
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between gap-4 mt-1 border-t border-zinc-900 pt-1 text-red-500 font-bold">
                                  <span>Breach Scale:</span>
                                  <span>100% (No Fire NOC)</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconSize={8}
                        iconType="circle"
                        wrapperStyle={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "1px" }}
                      />
                      <Bar name="MCD Permitted Limit" dataKey="legal" fill="#3f3f46" radius={[2, 2, 0, 0]} />
                      <Bar name="Actual Operational Volume" dataKey="actual" fill="#EF4444" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="lg:col-span-4 space-y-4">
                  <div className="border-l-2 border-red-500 bg-red-950/10 p-4 font-mono text-[11px] leading-relaxed text-zinc-300">
                    <span className="text-red-500 font-bold block mb-1">MCD CODE COMPLIANCE AUDIT</span>
                    The Flourish Stay B&B operated under a registration limited strictly to <strong className="text-white">6 guest rooms</strong> (approx 12 adults). Lavkesh Bajaj squeezed <strong className="text-red-400 font-black">25 distinct cell partitions</strong>, registering a staggering <strong className="text-red-400 font-black">416% occupancy overload</strong>. This completely negated the building's emergency evacuation capacity, turning individual spaces into sealed traps.
                  </div>
                  <div className="border-l-2 border-zinc-700 bg-zinc-900/20 p-4 font-mono text-[11px] leading-relaxed text-zinc-400">
                    <span className="text-zinc-300 font-bold block mb-1">SAFETY GAP SUMMARY</span>
                    The safety system's code rating registered at <strong className="text-red-400">0% compliance</strong> as water fire sprinklers, smoke sensors, automatic emergency breaker panels, and direct-to-DFS telemetry triggers were completely absent.
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Takeaway 3: Architecture of a Trap */}
          <motion.section 
            id="evidence-structural-flaws" 
            className="pt-8 border-t border-zinc-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
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

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
            >
              {STRUCTURAL_FLAWS.map((flaw, idx) => {
                const IconComponent = flaw.icon;
                return (
                  <motion.div 
                    key={idx}
                    variants={gridItemVariants}
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
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Structural Floor Cross-Section Schematic */}
            <motion.div 
              className="mt-8 bg-zinc-950 border border-zinc-900 p-5 md:p-6 shadow-2xl relative"
              variants={chartVariants}
            >
              <div className="absolute top-2 right-3 font-mono text-[8px] text-zinc-500">
                SCHEMATIC // DESIGN: VERTICAL_COFFIN // INTERACTIVE_SCANNER
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 mb-6 gap-4">
                <div>
                  <h3 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                    FLOURISH STAY B&B: VERTICAL HEAT & TOXIN TRANSMISSION DYNAMICS
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    DRAG THE SCANNER SLIDER OR CLICK A FLOOR TO MAP THE INFILTRATION LEVEL
                  </p>
                </div>
                
                {/* Horizontal slider control */}
                <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-900 px-4 py-2 self-start md:self-auto w-full md:w-auto">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">BASEMENT</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="5" 
                    value={selectedFloorId} 
                    onChange={(e) => setSelectedFloorId(parseInt(e.target.value))}
                    className="w-24 md:w-44 accent-red-600 bg-zinc-900 h-1 cursor-pointer"
                    aria-label="Elevation scanner slider"
                  />
                  <span className="font-mono text-[9px] text-red-500 font-bold uppercase">PENTHOUSE (F5)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Side: Interactive 5-story Building Cross Section */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-zinc-950 p-4 border border-zinc-900 relative">
                  
                  {/* Roof Top / Exit Indicator */}
                  <div className="flex justify-between items-center px-4 py-1.5 bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-mono text-zinc-500">
                    <span>ROOF DECK / SOLAR HARVEST AREA</span>
                    <span className="text-red-500 font-bold">TERRACE HEIGHT: 18 METERS</span>
                  </div>

                  {/* The Floors */}
                  <div className="space-y-1.5 p-3 relative">
                    {/* The stairwell shaft visual running vertically through the middle */}
                    <div className="absolute left-[30%] md:left-[40%] top-0 bottom-0 w-8 md:w-12 bg-gradient-to-t from-red-600/30 via-orange-600/20 to-red-600/5 border-x border-red-500/10 pointer-events-none flex flex-col justify-around items-center z-10">
                      <div className="animate-bounce text-[9px] text-red-500 font-bold opacity-75">↑</div>
                      <div className="text-[8px] text-red-500 font-bold opacity-60">CHIMNEY</div>
                      <div className="animate-bounce text-[9px] text-red-500 font-bold opacity-75">↑</div>
                    </div>

                    {/* Floor items listed from top (5) to bottom (0) */}
                    {FLOOR_DATA.map((floor) => {
                      const isSelected = selectedFloorId === floor.id;
                      return (
                        <button
                          key={floor.id}
                          onClick={() => setSelectedFloorId(floor.id)}
                          className={`w-full text-left flex border transition-all duration-300 p-3 relative focus:outline-none ${
                            isSelected 
                              ? "border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                              : "border-zinc-800/80 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-700"
                          }`}
                        >
                          <div className="w-[30%] md:w-[40%] pr-4 border-r border-zinc-800/50">
                            <span className={`font-mono text-[9px] block ${isSelected ? "text-red-500 font-bold" : "text-zinc-500"}`}>
                              {floor.level}
                            </span>
                            <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-zinc-300"}`}>
                              {floor.name}
                            </span>
                          </div>
                          
                          {/* Stairwell shaft junction */}
                          <div className={`w-8 md:w-12 relative z-20 transition-colors duration-300 ${
                            isSelected ? "bg-red-900/30" : "bg-red-950/10"
                          }`} />
                          
                          <div className="flex-1 pl-4 flex flex-col justify-center">
                            <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                              isSelected ? "text-red-400" : "text-zinc-400"
                            }`}>
                              <Flame className={`w-3 h-3 ${isSelected ? "text-red-500 animate-pulse" : "text-zinc-500"}`} />
                              {floor.risk}
                            </span>
                            <span className="text-[9px] text-zinc-500 line-clamp-1">{floor.hazard}</span>
                          </div>

                          {/* Forensics Laser Scanning Line on active item */}
                          {isSelected && (
                            <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-red-600 animate-pulse shadow-[0_0_8px_#EF4444]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Street Ground Line */}
                  <div className="mt-2 flex justify-between items-center px-4 py-1 bg-red-950/30 border-t border-red-500/20 text-[9px] font-mono text-red-400">
                    <span>STREET: NARROW 1.5M ALLEY GRIDLOCK</span>
                    <span>HAUZ RANI SLUM AREA</span>
                  </div>
                </div>

                {/* Right Side: Structural Heat Vector Descriptions - Dynamic Interactive Assessment Console */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-950 border border-zinc-900/80 p-5 relative overflow-hidden">
                  
                  {/* Subtle decorative background scanner mesh */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  {(() => {
                    const activeFloor = FLOOR_DATA.find(f => f.id === selectedFloorId) || FLOOR_DATA[0];
                    const tempVal = parseInt(activeFloor.temp);
                    const coVal = parseInt(activeFloor.co.replace(/,/g, ''));
                    
                    return (
                      <div className="space-y-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Header of Active Floor Console */}
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                            <span className="font-mono text-[9px] text-red-500 font-bold bg-red-950/40 border border-red-500/20 px-2 py-0.5 uppercase tracking-widest">
                              ACTIVE SCAN: {activeFloor.level}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              FORENSIC_DEEP_DIVE
                            </span>
                          </div>
                          
                          {/* Title & Secondary Header */}
                          <div className="mt-3">
                            <h4 className="text-sm font-black text-zinc-100 uppercase tracking-tight">
                              {activeFloor.name}
                            </h4>
                            <p className="text-[10px] text-red-400 font-mono font-bold mt-0.5">
                              {activeFloor.risk}
                            </p>
                          </div>

                          {/* Dynamic Forensics Parameters & Meters */}
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-zinc-900/30 border border-zinc-900 p-2.5 font-mono">
                              <span className="text-[8px] text-zinc-500 block uppercase">AMBIENT HEAT</span>
                              <span className="text-sm font-bold text-orange-400 block mt-0.5">{activeFloor.temp}</span>
                              {/* Thermal meter bar */}
                              <div className="w-full bg-zinc-950 h-1 mt-1.5 rounded-none overflow-hidden">
                                <div 
                                  className="bg-orange-500 h-full transition-all duration-700 ease-out"
                                  style={{ width: `${Math.min(100, (tempVal / 1000) * 100)}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="bg-zinc-900/30 border border-zinc-900 p-2.5 font-mono">
                              <span className="text-[8px] text-zinc-500 block uppercase">CARBON MONOXIDE</span>
                              <span className="text-sm font-bold text-red-500 block mt-0.5">{activeFloor.co}</span>
                              {/* CO saturation meter bar */}
                              <div className="w-full bg-zinc-950 h-1 mt-1.5 rounded-none overflow-hidden">
                                <div 
                                  className="bg-red-500 h-full transition-all duration-700 ease-out"
                                  style={{ width: `${Math.min(100, (coVal / 2000) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Survival and unconscious levels */}
                          <div className="mt-3.5 space-y-2 border-t border-b border-zinc-900/80 py-3 font-mono text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">TIME TO UNCONSCIOUSNESS:</span>
                              <span className="text-yellow-500 font-bold">{activeFloor.timeToUnconscious}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">SURVIVAL CHANCE LIMIT:</span>
                              <span className="text-red-500 font-bold uppercase">{activeFloor.survivalChance}</span>
                            </div>
                          </div>

                          {/* Brief Narrative */}
                          <div className="mt-4">
                            <p className="text-xs text-zinc-300 leading-relaxed font-light">
                              {activeFloor.brief}
                            </p>
                          </div>

                          {/* Pre-emptive Solution block */}
                          <div className="mt-4 bg-zinc-900/30 border-l-2 border-green-500 p-3">
                            <span className="font-mono text-[9px] text-green-400 font-bold block mb-1">MANDATED CORRECTION FOR LIFE-SAFETY</span>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                              {activeFloor.recommendation}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Step Buttons for sliding up/down */}
                        <div className="flex gap-2 pt-4 border-t border-zinc-900 mt-4">
                          <button
                            disabled={selectedFloorId === 0}
                            onClick={() => setSelectedFloorId(prev => Math.max(0, prev - 1))}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-zinc-900 bg-zinc-900/30 text-[10px] font-mono hover:bg-zinc-900/80 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                            SCAN DOWN
                          </button>
                          <button
                            disabled={selectedFloorId === 5}
                            onClick={() => setSelectedFloorId(prev => Math.min(5, prev + 1))}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-zinc-900 bg-zinc-900/30 text-[10px] font-mono hover:bg-zinc-900/80 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                            SCAN UP
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Chronological interactive timeline (Takeaway 2: The Fatal 30-Minute Silence) */}
          <motion.section 
            id="evidence-timeline" 
            className="pt-8 border-t border-zinc-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
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

            {/* Visual Atmospheric Poisoning Chart Panel */}
            <motion.div 
              className="mt-8 bg-zinc-950 border border-zinc-900/80 p-5 md:p-6 shadow-2xl relative"
              variants={chartVariants}
            >
              <div className="absolute top-2 right-3 font-mono text-[8px] text-zinc-500">
                FORENSIC // THERMAL_ATMOSPHERIC_SIMULATOR
              </div>
              <h3 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                ATMOSPHERIC POISONING & TEMPERATURE INTRUSION MODEL
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={ATMOSPHERIC_DATA}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorCo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717a" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: "#27272a" }}
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: "#27272a" }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const dataObj = payload[0].payload;
                            return (
                              <div className="bg-zinc-950 border border-red-500/40 p-3 shadow-lg font-mono text-[10px] text-zinc-300">
                                <p className="font-bold text-red-500 mb-1">{label} ({dataObj.timeOffset})</p>
                                <p className="text-yellow-500 font-bold text-[9px] mb-2 font-mono">Stage: {dataObj.event}</p>
                                <div className="flex justify-between gap-4 mt-0.5">
                                  <span className="text-orange-400 font-mono">Staircase Temp:</span>
                                  <span className="font-bold text-orange-300 font-mono">{dataObj.temp}°C</span>
                                </div>
                                <div className="flex justify-between gap-4 mt-0.5">
                                  <span className="text-red-500 font-mono">CO Gas Level:</span>
                                  <span className="font-bold text-red-400 font-mono">{dataObj.co} PPM</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconSize={8}
                        iconType="circle"
                        wrapperStyle={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "1px" }}
                      />
                      <ReferenceLine y={1280} stroke="#EF4444" strokeDasharray="3 3" label={{ value: "Lethal CO Threshold (1280 PPM)", fill: "#EF4444", fontSize: 8, position: "top" }} />
                      <ReferenceLine y={600} stroke="#F97316" strokeDasharray="3 3" label={{ value: "Structural Combustion (600°C)", fill: "#F97316", fontSize: 8, position: "top" }} />
                      <Area name="Central Stairwell Temp (°C)" type="monotone" dataKey="temp" stroke="#F97316" fillOpacity={1} fill="url(#colorTemp)" />
                      <Area name="CO Carbon Monoxide Level (PPM)" type="monotone" dataKey="co" stroke="#EF4444" fillOpacity={1} fill="url(#colorCo)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="lg:col-span-4 space-y-4">
                  <div className="border-l-2 border-orange-500 bg-orange-950/10 p-4 font-mono text-[11px] leading-relaxed text-zinc-300">
                    <span className="text-orange-500 font-bold block mb-1">THE GOLDEN HALF-HOUR DELAY</span>
                    During the 30-minute silence between 08:20 AM and 08:50 AM, as guesthouse staff delayed emergency calls to protect hotel optics, the temperature in the central staircase rocketed from <strong className="text-white">30°C to over 800°C</strong>. At this level, the wooden paneling and plastics reached auto-ignition, feeding the upward draft with extreme thermal intensity.
                  </div>
                  <div className="border-l-2 border-red-500 bg-red-950/10 p-4 font-mono text-[11px] leading-relaxed text-zinc-300">
                    <span className="text-red-500 font-bold block mb-1">THE SILENT KILLER (CARBON MONOXIDE)</span>
                    Carbon Monoxide levels rose exponentially, surpassing the lethal human threshold of <strong className="text-white">1,280 PPM</strong> by 08:45 AM. Because there was no smoke-extraction ventilation or automated water sprinkles to cool the gases, trapped occupants faced fatal levels before fire tenders even reached the entry path.
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Survivor & First Responder Testimonial Accounts */}
          <motion.section 
            id="evidence-accounts" 
            className="pt-8 border-t border-zinc-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
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

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
            >
              <motion.div 
                variants={gridItemVariants}
                className="bg-zinc-950 border border-zinc-900 p-5 rounded-none flex flex-col justify-between"
              >
                <p className="text-zinc-400 text-xs italic font-light leading-relaxed mb-6">
                  "The scale of the deception is measured by the human cost. The guesthouse tragedy completely wiped out eight members of the Aggarwal family, including Corporate CFO Vivek, his wife Tarjani, and their young daughters Angel (20) and Pearl (16). Pearl scored 97% on her board exams just days prior. They trusted a certified B&B, but Bajaj gave them a death trap."
                </p>
                <div className="border-t border-zinc-900 pt-4 font-mono text-[10px]">
                  <span className="text-red-400 font-bold block">INQUEST INVESTIGATOR</span>
                  <span className="text-zinc-600">Municipal Forensic Survey</span>
                </div>
              </motion.div>

              <motion.div 
                variants={gridItemVariants}
                className="bg-zinc-950 border border-zinc-900 p-5 rounded-none flex flex-col justify-between"
              >
                <p className="text-zinc-400 text-xs italic font-light leading-relaxed mb-6">
                  "International medical tourists from Liberia, Nigeria, Mozambique, and Turkmenistan travel thousands of miles to Saket's elite hospitals. These families are funneled directly into these unlicensed, high-risk lodging facilities. Developers exploit the rural 'Lal Dora' exemption to completely bypass mandatory Fire NOCs."
                </p>
                <div className="border-t border-zinc-900 pt-4 font-mono text-[10px]">
                  <span className="text-red-400 font-bold block">PUBLIC SAFETY ADVOCATE</span>
                  <span className="text-zinc-600">Lal Dora Regulatory Reform Petition</span>
                </div>
              </motion.div>

              <motion.div 
                variants={gridItemVariants}
                className="bg-zinc-950 border border-zinc-900 p-5 rounded-none flex flex-col justify-between"
              >
                <p className="text-zinc-400 text-xs italic font-light leading-relaxed mb-6">
                  "The MCD has arrested owner Lavkesh Bajaj and staff members under Section 105 of the Bharatiya Nyaya Sanhita (BNS) for Culpable Homicide Not Amounting to Murder. But we must ask: why does it take the charred remains of a 16-year-old girl and 21 others to trigger the enforcement of existing safety laws?"
                </p>
                <div className="border-t border-zinc-900 pt-4 font-mono text-[10px]">
                  <span className="text-red-400 font-bold block">SUPREME COURT ADVOCATE</span>
                  <span className="text-zinc-600">MCD Sealing Drive Counsel</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.section>

          {/* Action Footer Callout */}
          <motion.section 
            className="bg-red-950/15 border border-[#EF4444]/20 p-6 sm:p-8 text-center flex flex-col items-center justify-center max-w-4xl mx-auto rounded-none"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
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
          </motion.section>

        </div>
      </div>

      {/* Right Column: Persistent Evidence Sidebar (Desktop Only) */}
      <div className="w-[440px] bg-[#070709] border-l border-zinc-900 flex flex-col z-20 overflow-y-auto hidden xl:flex relative">
        {/* Sidebar Background Canvas Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0" />
        
        <div className="flex-1 p-6 space-y-6 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-red-500">
              evidence sidepanel
            </span>
          </div>
          
          {renderSidebarContent()}
        </div>
      </div>

      {/* Floating Evidence Button for Mobile/Tablet */}
      <div className="xl:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowMobileEvidence(true)}
          className="flex items-center gap-2 px-4 py-3 bg-red-950/90 border border-red-500/50 text-red-400 font-mono text-xs font-bold uppercase tracking-wider rounded-none shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:bg-[#EF4444] hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 animate-pulse" />
          <span>EVIDENCE DOSSIER</span>
        </button>
      </div>

      {/* Mobile Evidence Slide-up Drawer */}
      <AnimatePresence>
        {showMobileEvidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 xl:hidden flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="bg-[#08080a] border-t-2 border-[#EF4444]/40 w-full h-[85vh] flex flex-col overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-900/80 bg-zinc-950/60">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-500">
                    NBC EVIDENCE DOSSIER
                  </span>
                </div>
                <button
                  onClick={() => setShowMobileEvidence(false)}
                  className="p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white rounded-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content inside mobile drawer */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {renderSidebarContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedExcerptForModal && (
          <ArchitecturalDiagramModal 
            excerpt={selectedExcerptForModal}
            onClose={() => setSelectedExcerptForModal(null)}
          />
        )}
      </AnimatePresence>

      </div> {/* Closes Main Split-Screen Layout Panel */}
    </motion.div>
  );
}

export default React.memo(DocumentaryInside);
