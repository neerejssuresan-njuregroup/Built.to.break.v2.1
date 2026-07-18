/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const STEPS = [
  {
    id: "1",
    icon: "📈",
    category: "Growth Dynamics",
    title: "The Macro Pressure",
    desc: "Over the last decade, commercial and residential footprints have expanded rapidly. As urban density hits its limit, spaces meant for small families are being packed beyond capacity.",
    accentColor: "from-amber-500 to-orange-600"
  },
  {
    id: "2",
    icon: "🏗️",
    category: "Structural Deficit",
    title: "The Structural Loophole",
    desc: "When we look at building code approvals versus reality, unauthorized vertical expansion leaves neighborhoods with dangerously narrow exits and compromised safety clearances.",
    accentColor: "from-red-500 to-rose-600"
  },
  {
    id: "3",
    icon: "🚨",
    category: "Transit Bottlenecks",
    title: "Regional Commute Delays",
    desc: "When high-density built-up volumes overflow structural plans, the surrounding street layout collapses completely. Commuters in primary business zones routinely hit over double their baseline travel times during peak operating cycles.",
    accentColor: "from-orange-500 to-red-600"
  },
  {
    id: "4",
    icon: "📊",
    category: "Macro Vulnerability",
    title: "Cross-Metropolitan Risk Index",
    desc: "When compared nationally, dense regional zones like Bengaluru and Delhi spike dangerously high on the Fire Vulnerability Index due to systemic emergency response delays.",
    accentColor: "from-rose-500 to-purple-600"
  }
];

export const EXPANSION_DATA = [
  { year: 2016, residential: 45, commercial: 15, mixedUse: 20 },
  { year: 2018, residential: 48, commercial: 18, mixedUse: 25 },
  { year: 2020, residential: 50, commercial: 24, mixedUse: 35 },
  { year: 2022, residential: 52, commercial: 35, mixedUse: 52 },
  { year: 2024, residential: 54, commercial: 48, mixedUse: 76 },
  { year: 2026, residential: 55, commercial: 62, mixedUse: 98 }
];

export const DEFICIT_DATA = [
  { location: "Hauz Rani Lane A", legal: 2, illegal: 4 },
  { location: "Hauz Rani Lane B", legal: 2, illegal: 3 },
  { location: "Khirki Extension", legal: 3, illegal: 4 },
  { location: "Malviya Nagar C-Block", legal: 3, illegal: 2 },
  { location: "Begumpur Village", legal: 2, illegal: 5 }
];

export const CONGESTION_DATA = [
  { corridor: "Malviya Nagar Main Rd", baseline: 12, peak: 38 },
  { corridor: "Press Enclave Marg", baseline: 8, peak: 26 },
  { corridor: "LBS Marg", baseline: 15, peak: 42 },
  { corridor: "Hauz Rani Lanes", baseline: 6, peak: 24 },
  { corridor: "Outer Ring Rd Jcn", baseline: 10, peak: 31 }
];

export const VULNERABILITY_DATA = [
  { city: "Mumbai (Kalbadevi)", index: 94, delayComponent: 42, densityComponent: 52 },
  { city: "Delhi (Hauz Rani)", index: 92, delayComponent: 48, densityComponent: 44 },
  { city: "Bengaluru (Chickpet)", index: 88, delayComponent: 44, densityComponent: 44 },
  { city: "Kolkata (Burrabazar)", index: 86, delayComponent: 40, densityComponent: 46 },
  { city: "Hyderabad (Old City)", index: 82, delayComponent: 38, densityComponent: 44 },
  { city: "Chennai (George Town)", index: 78, delayComponent: 36, densityComponent: 42 }
];

export function calculateUrbanRisk(inputs) {
  const { laneWidth, buildingFloors, commercialOverload, exitsCount } = inputs;

  // Evacuation Velocity formula: depends positively on exits, positively on laneWidth, negatively on floors & overloading
  const baseVelocity = 80;
  const laneFactor = (laneWidth / 12) * 20; // up to +20
  const exitFactor = (exitsCount / 4) * 15; // up to +15
  const floorFactor = (buildingFloors / 8) * -25; // up to -25
  const loadFactor = ((commercialOverload - 1) / 4) * -30; // up to -30
  
  const evacuationVelocity = Math.min(100, Math.max(12, Math.round(baseVelocity + laneFactor + exitFactor + floorFactor + loadFactor)));

  // Tender Access Minutes: standard fire engine needs 4.5m lane width.
  // If lane width is less than 3m, tender cannot enter at all (requires manual hose dragging, delaying access significantly)
  let tenderAccessMinutes = 3.0; // optimal base response time in minutes
  if (laneWidth < 3.0) {
    tenderAccessMinutes += 12.0 + (buildingFloors * 1.5); // extreme delays dragging hose vertically
  } else if (laneWidth < 4.5) {
    tenderAccessMinutes += 6.0 + (buildingFloors * 0.8); // partial blockage / tight squeezing
  } else {
    tenderAccessMinutes += (12 - laneWidth) * 0.3; // standard traffic slows it down
  }
  // Add commercial overloading delay
  tenderAccessMinutes += (commercialOverload - 1) * 2.0;
  tenderAccessMinutes = Math.round(tenderAccessMinutes * 10) / 10;

  // Total Hazard Score (0 to 100)
  // Higher score = more dangerous
  const laneHazard = (1 - laneWidth / 12) * 30; // up to 30
  const floorHazard = (buildingFloors / 8) * 30; // up to 30
  const overloadHazard = ((commercialOverload - 1) / 4) * 25; // up to 25
  const exitHazard = (1 - exitsCount / 4) * 15; // up to 15
  const hazardScore = Math.min(100, Math.max(5, Math.round(laneHazard + floorHazard + overloadHazard + exitHazard)));

  let hazardLevel = "Low";
  let hazardColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  let explanation = "";

  if (hazardScore >= 80) {
    hazardLevel = "Critical";
    hazardColor = "text-red-500 bg-red-500/10 border-red-500/20";
    explanation = "Systemic collapse risk. Emergency vehicles cannot penetrate lanes. Unsanctioned floors create extreme collapse risk, and evacuation speeds are cut by 80%+.";
  } else if (hazardScore >= 55) {
    hazardLevel = "High";
    hazardColor = "text-orange-500 bg-orange-500/10 border-orange-500/20";
    explanation = "Severe danger during high-density incidents. Fire tender response is delayed by over 8 minutes. High vertical loads threaten exit pathways.";
  } else if (hazardScore >= 30) {
    hazardLevel = "Moderate";
    hazardColor = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    explanation = "Moderate safety cushion. Minor vertical code infractions. Narrow pathways present bottleneck risks but fire access remains physically viable.";
  } else {
    hazardLevel = "Low";
    hazardColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    explanation = "Compliant urban layouts. Road widths meet national fire codes (4.5m+), building heights are within municipal limits, and escape pathways are clear.";
  }

  return {
    evacuationVelocity,
    tenderAccessMinutes,
    hazardScore,
    hazardLevel,
    hazardColor,
    explanation
  };
}
