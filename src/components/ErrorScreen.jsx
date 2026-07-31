import React from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  Lock, 
  RefreshCw, 
  Home, 
  ArrowLeft, 
  Fingerprint, 
  Unplug, 
  Terminal,
  Activity
} from "lucide-react";

export default function ErrorScreen({ 
  type = "404", 
  message = "", 
  onRetry = null, 
  onNavigateHome = null 
}) {
  const getErrorDetails = () => {
    switch (type) {
      case "403":
        return {
          code: "403",
          title: "ACCESS FORBIDDEN // PERMISSION DENIED",
          subtitle: "AUTHENTICATION COMPLIANCE SHIELD ACTIVE",
          desc: message || "Your current session credentials lack the required compliance level or secure signature. Biometric verification may be missing, or your proctor authorization token is invalid. Accessing classified municipal Delhi fire audit dossiers requires Level-4 security clearance.",
          accentColor: "#EF4444", // red-500
          bgColor: "bg-red-950/10",
          borderColor: "border-red-900/40",
          icon: <Fingerprint className="w-12 h-12 text-red-500 animate-pulse" />,
          shimmerColor: "rgba(239,68,68,0.15)"
        };
      case "503":
        return {
          code: "503",
          title: "SERVICE TEMPORARILY UNAVAILABLE",
          subtitle: "SQL REGISTRY DISCONNECTED",
          desc: message || "The secure central PostgreSQL database is currently unresponsive or undergoing rapid replication telemetry. System diagnostics indicate a service handshake timeout. The local offline engine remains active but real-time database synchronization is degraded.",
          accentColor: "#F59E0B", // amber-500
          bgColor: "bg-amber-950/10",
          borderColor: "border-amber-900/40",
          icon: <Unplug className="w-12 h-12 text-amber-500 animate-bounce" />,
          shimmerColor: "rgba(245,158,11,0.15)"
        };
      case "404":
      default:
        return {
          code: "404",
          title: "STRUCTURAL PATH NOT FOUND",
          subtitle: "METROPOLITAN COORDINATE ERROR",
          desc: message || "The requested coordinate, file ID, or compliance resource is not registered. It may have been relocated under new Lal Dora zoning guidelines or permanently archived by municipal command. Ensure you are targeting a validated compliance pathway.",
          accentColor: "#F97316", // orange-500
          bgColor: "bg-orange-950/10",
          borderColor: "border-orange-900/40",
          icon: <ShieldAlert className="w-12 h-12 text-orange-500" />,
          shimmerColor: "rgba(249,115,22,0.15)"
        };
    }
  };

  const details = getErrorDetails();

  return (
    <div 
      className="fixed inset-0 z-[120] bg-[#050507] text-zinc-200 flex flex-col items-center justify-center p-4 font-mono select-none overflow-y-auto"
      id={`error-screen-${type}`}
    >
      {/* Immersive cyber-fire theme grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.15)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
      
      {/* Background glowing aura representing embers */}
      <div 
        className="absolute w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ backgroundColor: details.accentColor }}
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative bg-[#08080a] border border-zinc-800 p-6 md:p-10 max-w-xl w-full text-left space-y-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] border-t-2"
        style={{ borderTopColor: details.accentColor }}
      >
        {/* Subtle shimmer banner */}
        <div 
          className="absolute inset-x-0 top-0 h-1 pointer-events-none"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${details.accentColor}, transparent)` 
          }}
        />

        {/* Top Header Row */}
        <div className="flex items-center gap-4">
          <div className={`p-3 border ${details.borderColor} ${details.bgColor}`}>
            {details.icon}
          </div>
          <div>
            <span 
              className="text-[10px] font-black uppercase tracking-[0.2em] block"
              style={{ color: details.accentColor }}
            >
              SYSTEM CODE: {details.code} // {details.subtitle}
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase font-display leading-none mt-1">
              {details.title}
            </h1>
          </div>
        </div>

        {/* Divider line */}
        <div className="h-px bg-zinc-900 w-full" />

        {/* Terminal Telemetry Block */}
        <div className="bg-[#0c0c10] border border-zinc-900 p-4 space-y-4 rounded-none">
          <div className="flex items-center justify-between text-zinc-600 text-[8px] border-b border-zinc-900/60 pb-2">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" /> SECURITY_SHELL_v2.1
            </span>
            <span>TIME: {new Date().toLocaleTimeString()}</span>
          </div>

          <p className="text-zinc-400 text-[11px] leading-relaxed font-light">
            {details.desc}
          </p>

          <div className="flex items-center gap-2 text-[9px] text-zinc-600">
            <Activity className="w-3 h-3 text-red-500 animate-pulse" />
            <span className="uppercase">Auditing Environment parameters: COLD_INGRESS</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RETRY SYNC CONNECTION</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateHome}
            className="flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer text-black"
            style={{ 
              backgroundColor: details.accentColor,
              boxShadow: `0 0 20px ${details.shimmerColor}` 
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <Home className="w-3.5 h-3.5" />
              <span>RETURN TO CORE MISSION</span>
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
