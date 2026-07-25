/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Award, 
  ListTodo, 
  Zap, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Flame,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { gamificationStore, MISSIONS, RANKS } from "../lib/GamificationStore";

function GamificationHUD() {
  const [hudState, setHudState] = useState(() => gamificationStore.loadState());
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Subscribe to changes in store
  useEffect(() => {
    const unsubscribe = gamificationStore.subscribe((newState) => {
      setHudState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Listen for custom XP Gained and Lost events to show the live HUD toast
  useEffect(() => {
    const handleXpGained = (e) => {
      const { xp, missionName, badge, didLevelUp, newRank, color } = e.detail;
      setToast({
        xp,
        missionName,
        badge,
        didLevelUp,
        newRank,
        color,
        type: "gained"
      });

      // Clear toast after 4.5 seconds
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    };

    const handleXpLost = (e) => {
      const { xp, newXp, newRank, color } = e.detail;
      setToast({
        xp,
        missionName: "Compliance Forensic Exam Failed",
        badge: null,
        didLevelUp: false,
        newRank,
        color,
        type: "lost"
      });

      // Clear toast after 4.5 seconds
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    };

    window.addEventListener("safety_xp_gained", handleXpGained);
    window.addEventListener("safety_xp_lost", handleXpLost);
    return () => {
      window.removeEventListener("safety_xp_gained", handleXpGained);
      window.removeEventListener("safety_xp_lost", handleXpLost);
    };
  }, []);

  const totalXP = hudState.xp;
  const rank = hudState.rank || RANKS[0];
  
  // Calculate next rank requirements
  const currentRankIndex = RANKS.findIndex(r => r.level === rank.level);
  const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  
  const xpInCurrentLevel = totalXP - rank.minXp;
  const xpNeededForNextLevel = nextRank ? nextRank.minXp - rank.minXp : 100;
  const progressPercent = Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100);

  return (
    <>
      {/* Dynamic Toast Alerts for instant XP rewards */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-24 left-1/2 z-[200] w-full max-w-md px-4 font-mono pointer-events-auto"
            id="gamification-xp-toast"
          >
            <div className={`bg-black/95 border shadow-[0_0_35px_rgba(239,68,68,0.25)] rounded-none p-4 flex flex-col gap-3 relative overflow-hidden ${
              toast.type === "lost" ? "border-red-600 shadow-[0_0_35px_rgba(220,38,38,0.3)]" : "border-red-500"
            }`}>
              {/* Animated corner glows */}
              <div className={`absolute top-0 left-0 w-8 h-px animate-pulse ${toast.type === "lost" ? "bg-red-600" : "bg-red-500"}`} />
              <div className={`absolute top-0 left-0 w-px h-8 animate-pulse ${toast.type === "lost" ? "bg-red-600" : "bg-red-500"}`} />
              
              <div className="flex items-start gap-3">
                <div className={`p-2 border rounded-none relative ${
                  toast.type === "lost" ? "bg-red-950/20 border-red-700" : "bg-red-950/40 border-red-600"
                }`}>
                  <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-red-500 tracking-widest uppercase">
                      {toast.type === "lost" ? "MUNICIPAL CODE PENALTY" : "AUDIT MISSION SOLVED"}
                    </span>
                    <span className={`text-xs font-black ${toast.type === "lost" ? "text-red-500" : "text-amber-400"}`}>
                      {toast.type === "lost" ? `-${toast.xp} XP` : `+${toast.xp} XP`}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-zinc-100 uppercase mt-0.5 truncate">
                    {toast.missionName}
                  </h4>
                  {toast.badge && (
                    <div className="flex items-center gap-1.5 mt-1 text-[9px] text-zinc-400">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>UNLOCKED BADGE: <strong className="text-zinc-200">{toast.badge}</strong></span>
                    </div>
                  )}
                  {toast.type === "lost" && (
                    <div className="text-[9px] text-zinc-500 mt-1">
                      Failed safety audit margin. Critical vulnerability penalty applied.
                    </div>
                  )}
                </div>
              </div>

              {toast.didLevelUp && (
                <div className="border-t border-zinc-900 pt-2 flex items-center gap-2 animate-bounce">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] text-zinc-100 uppercase tracking-wider">
                    SAFETY LEVEL UP: <strong style={{ color: toast.color }}>{toast.newRank}</strong>
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating HUD Controller */}
      <div className="fixed bottom-6 right-6 z-[90] font-mono select-none" id="gamification-hud-controller">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="bg-black/95 border border-zinc-900 w-[320px] shadow-2xl p-5 mb-3 flex flex-col gap-4 relative overflow-hidden"
              id="gamification-expanded-board"
            >
              {/* Outer hazard line banner */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,#EF4444,#EF4444_10px,transparent_10px,transparent_20px)] opacity-30" />
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#EF4444]" />
                  <span className="text-xs font-black text-zinc-100 uppercase tracking-widest">
                    SAFETY STATION STATUS
                  </span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rank and XP Section */}
              <div className="bg-zinc-950/60 border border-zinc-900/80 p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">ACTIVE RANK:</span>
                  <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: rank.color }}>
                    {rank.name}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">FORENSIC XP:</span>
                  <span className="text-sm font-black text-zinc-200">
                    {totalXP} {nextRank && <span className="text-zinc-600 text-[10px]">/ {nextRank.minXp} XP</span>}
                  </span>
                </div>

                {/* Level Up Progress Bar */}
                {nextRank && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-zinc-900 rounded-none overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-zinc-500 mt-1">
                      <span>LEVEL {rank.level}</span>
                      <span>{nextRank.minXp - totalXP} XP TO LEVEL {nextRank.level}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mission Objectives */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-1.5 mb-1">
                  <ListTodo className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">AUDIT CHECKLIST</span>
                </div>
                <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                  {Object.entries(MISSIONS).map(([key, mission]) => {
                    const isCompleted = !!hudState.completedMissions[mission.id];
                    return (
                      <div 
                        key={mission.id} 
                        className={`flex items-start gap-2.5 p-2 border transition-colors ${
                          isCompleted 
                            ? "bg-red-950/10 border-red-950/40 opacity-75" 
                            : "bg-zinc-950/20 border-zinc-900 hover:border-zinc-800"
                        }`}
                      >
                        <div className="mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 border border-zinc-800 rounded-none" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className={`text-[10px] font-black uppercase leading-tight ${isCompleted ? "text-zinc-400 line-through" : "text-zinc-200"}`}>
                            {mission.title}
                          </h5>
                          <p className="text-[8px] text-zinc-500 leading-normal mt-0.5">
                            {mission.desc}
                          </p>
                          <div className="flex gap-2 items-center mt-1 text-[8px]">
                            <span className="text-amber-500 font-bold">+{mission.xp} XP</span>
                            {mission.badge && (
                              <span className="text-zinc-500">[{mission.badge}]</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Earned Badges Showcase */}
              {hudState.earnedBadges.length > 0 && (
                <div className="flex flex-col gap-1.5 border-t border-zinc-900 pt-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">UNLOCKED AUDIT BADGES:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {hudState.earnedBadges.map((badge, idx) => (
                      <span 
                        key={idx}
                        className="bg-red-950/25 border border-red-900/60 text-red-400 text-[8px] uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 shadow-inner"
                      >
                        <Award className="w-2.5 h-2.5 text-amber-500" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Core Indicator Switch */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 border transition-all duration-300 relative group shadow-2xl rounded-none cursor-pointer ${
            isOpen 
              ? "bg-[#EF4444] text-white border-transparent" 
              : "bg-black text-zinc-300 border-zinc-800 hover:border-zinc-700"
          }`}
          id="gamification-main-hud-toggle"
        >
          {/* Animated red ring glow */}
          {!isOpen && (
            <div className="absolute -inset-1 rounded-none border border-red-500/20 group-hover:border-red-500/40 pointer-events-none animate-pulse" />
          )}

          <Shield className={`w-4 h-4 ${isOpen ? "text-white" : "text-[#EF4444]"}`} />
          <div className="text-left">
            <span className="text-[8px] text-zinc-500 group-hover:text-zinc-400 block tracking-wider uppercase font-bold leading-none">
              MUNICIPAL CIVIL DEFENSE
            </span>
            <span className="text-[10px] font-black tracking-widest block uppercase mt-0.5 leading-none">
              AUDIT RANK: {rank.level}
            </span>
          </div>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />}
        </button>
      </div>
    </>
  );
}

export default React.memo(GamificationHUD);
