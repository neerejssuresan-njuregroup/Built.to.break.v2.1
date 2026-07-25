/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_KEY = "built_to_break_gamification_v2";

export const MISSIONS = {
  PRELOADER: {
    id: "preloader",
    title: "System Initialization",
    desc: "Bypass or complete the high-tech metropolitan risk preloader diagnostic.",
    xp: 50,
    badge: "Diagnostic Boot"
  },
  AUDIO: {
    id: "audio",
    title: "Auditory Immersion",
    desc: "Activate the live acoustic tension background wave generator.",
    xp: 100,
    badge: "Sound Specialist"
  },
  DOCUMENTARY: {
    id: "documentary",
    title: "Forensic Narrative Probe",
    desc: "Launch the active fire rescue documentary to inspect the Hauz Rani disaster.",
    xp: 150,
    badge: "Incident Inspector"
  },
  SIMULATOR: {
    id: "simulator",
    title: "Urban Stress Calibration",
    desc: "Adjust legal clearances and density sliders to model high-density fire load propagation.",
    xp: 200,
    badge: "Simulation Engineer"
  },
  DIAGNOSTIC: {
    id: "diagnostic",
    title: "Regional Hazard Audit",
    desc: "Perform a municipal safety audit by querying any specific state or district index.",
    xp: 150,
    badge: "Regional Auditor"
  },
  NBC_PORTAL: {
    id: "nbc_portal",
    title: "NBC Loophole Inquest",
    desc: "Launch the regulatory exploitation board to probe construction loopholes.",
    xp: 200,
    badge: "NBC Code Counsel"
  },
  FORENSIC_EXAM: {
    id: "forensic_exam",
    title: "National safety Certification",
    desc: "Complete the 20-scenario randomized National Building Code forensic lab.",
    xp: 300,
    badge: "Certified Safety Chief"
  }
};

export const RANKS = [
  { level: 1, name: "Civilian Observer", minXp: 0, color: "#71717A" },
  { level: 2, name: "Vulnerability Analyst", minXp: 150, color: "#F97316" },
  { level: 3, name: "NBC Code Inspector", minXp: 400, color: "#FACC15" },
  { level: 4, name: "Forensic Audit Chief", minXp: 750, color: "#EF4444" },
  { level: 5, name: "Safety Grandmaster", minXp: 1100, color: "#EC4899" }
];

class GamificationStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    if (typeof window === "undefined") {
      return this.getInitialState();
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate or ensure keys exist
        return {
          ...this.getInitialState(),
          ...parsed
        };
      }
    } catch (e) {
      console.error("Error loading gamification state", e);
    }
    return this.getInitialState();
  }

  getInitialState() {
    return {
      xp: 0,
      completedMissions: {},
      earnedBadges: [],
      quizHighscore: 0,
      quizPassed: false,
      rank: RANKS[0]
    };
  }

  saveState() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Error saving gamification state", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  triggerMission(missionKey) {
    const mission = MISSIONS[missionKey];
    if (!mission) return;

    if (this.state.completedMissions[mission.id]) return; // already completed

    // Update state
    const updatedMissions = {
      ...this.state.completedMissions,
      [mission.id]: new Date().toISOString()
    };

    const newXp = this.state.xp + mission.xp;
    const updatedBadges = [...this.state.earnedBadges];
    if (mission.badge && !updatedBadges.includes(mission.badge)) {
      updatedBadges.push(mission.badge);
    }

    // Determine Rank
    let activeRank = RANKS[0];
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (newXp >= RANKS[i].minXp) {
        activeRank = RANKS[i];
        break;
      }
    }

    const previousRankName = this.state.rank?.name;
    const didLevelUp = previousRankName && previousRankName !== activeRank.name;

    this.state = {
      ...this.state,
      xp: newXp,
      completedMissions: updatedMissions,
      earnedBadges: updatedBadges,
      rank: activeRank
    };

    this.saveState();

    // Dispatch a beautiful custom notification event for visual toast feedback
    if (typeof window !== "undefined") {
      const event = new CustomEvent("safety_xp_gained", {
        detail: {
          xp: mission.xp,
          missionName: mission.title,
          badge: mission.badge,
          didLevelUp,
          newRank: activeRank.name,
          color: activeRank.color
        }
      });
      window.dispatchEvent(event);
    }
  }

  recordQuizScore(percentage, passed, scorePoints) {
    const hasHighscoreChanged = scorePoints > this.state.quizHighscore;
    let newXp = this.state.xp;
    let pointsDeducted = 0;
    
    if (passed) {
      // Passed
    } else {
      // Deduct 25 points
      pointsDeducted = 25;
      newXp = Math.max(0, newXp - 25);
    }

    // Determine Rank
    let activeRank = RANKS[0];
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (newXp >= RANKS[i].minXp) {
        activeRank = RANKS[i];
        break;
      }
    }

    const updatedState = {
      ...this.state,
      xp: newXp,
      quizHighscore: Math.max(this.state.quizHighscore, scorePoints),
      quizPassed: this.state.quizPassed || passed,
      rank: activeRank
    };

    this.state = updatedState;
    this.saveState();

    if (passed) {
      this.triggerMission("FORENSIC_EXAM");
    } else {
      // Dispatch a safety_xp_lost event
      if (typeof window !== "undefined") {
        const event = new CustomEvent("safety_xp_lost", {
          detail: {
            xp: pointsDeducted,
            newXp: newXp,
            newRank: activeRank.name,
            color: activeRank.color
          }
        });
        window.dispatchEvent(event);
      }
    }
  }

  resetAll() {
    this.state = this.getInitialState();
    this.saveState();
  }
}

export const gamificationStore = new GamificationStore();
