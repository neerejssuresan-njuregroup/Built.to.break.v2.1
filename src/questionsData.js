/**
 * Standard Fallback Question Bank for National Building Code (NBC) 2016 & BNS Compliance Assessment
 */

export const FALLBACK_QUESTIONS = [
  {
    id: "fb_q_001",
    title: "Fire Door Assemblies & Self-Closing Devices Code #326",
    type: "Structural & Egress",
    location: "Commercial District 26",
    description: "What is the standard requirement for self-closing mechanisms and hold-open devices installed on 120-minute fire-rated doors leading into escape stairwells?",
    difficulty: "MEDIUM",
    points: 10,
    options: [
      { id: "opt_a", text: "Wooden wedges placed under the door leaves to keep corridors breezy", explanation: "Incorrect. Wedging fire doors open completely destroys compartmentation." },
      { id: "opt_b", text: "Hydraulic automatic self-closing hinges or magnetic hold-open releases connected to the central fire alarm", explanation: "Correct! NBC Part 4 Clause 4.8 requires fire doors to remain closed or feature electromagnetic hold-open releases that trigger closed instantly on alarm." },
      { id: "opt_c", text: "Manual latch locks requiring a key from room occupants", explanation: "Incorrect. Locking egress doors with keys traps fleeing occupants." },
      { id: "opt_d", text: "No closing mechanism required if door weighs over 50kg", explanation: "Incorrect. Door weight does not close doors automatically during a draft." }
    ],
    correctId: "opt_b",
    nbcClauses: ["NBC Part 4, Clause 4.8 (Fire Door Assemblies)", "IS 3614 Fire Door Standards"],
    bnsSection: "BNS Sec. 106 (Negligent Building Management)",
    hazardLevel: "HIGH",
    fact: "Wooden wedges are a major fire safety offense. When fire doors are propped open, toxic smoke floods the entire stairwell within 90 seconds."
  },
  {
    id: "fb_q_002",
    title: "Industrial Chemical Storage Ventilation Audit #249",
    type: "Industrial/Hazardous",
    location: "Chemical Zone 49",
    description: "A solvent bottling warehouse stores toluene and benzene in unventilated steel drums. The factory manager turned off mechanical exhaust blowers to cut electricity bills.",
    difficulty: "EASY",
    points: 5,
    options: [
      { id: "compliant", text: "Fully Compliant (Legal)", explanation: "Incorrect. Shutting off solvent exhaust systems causes explosive heavy chemical vapors to pool along floors." },
      { id: "non_compliant", text: "Non-Compliant (Illegal)", explanation: "Correct! NBC Part 4 Section 5.3 mandates continuous flame-proof sparkless mechanical ventilation providing at least 12 air changes per hour for chemical storage areas." }
    ],
    correctId: "non_compliant",
    nbcClauses: ["NBC Part 4, Section 5.3 (Hazardous Occupancies)", "Factories Act 1948 Sec. 37"],
    bnsSection: "BNS Sec. 287 (Negligent Handling of Explosive/Combustible Liquids)",
    hazardLevel: "CRITICAL",
    fact: "Toluene and benzene vapors are heavier than air. Without low-level mechanical extraction, static electricity from shoe soles can detonate the entire floor."
  },
  {
    id: "fb_q_003",
    title: "Healthcare Safety Code Protocol #75",
    type: "Healthcare",
    location: "Zone 25 Urban Precinct",
    description: "Under NBC 2016 Part 4 rules for healthcare buildings, what is the mandatory requirement for exit door width and hardware mechanism during emergency evacuation?",
    difficulty: "MEDIUM",
    points: 10,
    options: [
      { id: "opt_a", text: "Inward sliding automatic glass door without battery backup", explanation: "Incorrect. Inward sliding doors can bind when power fails during fires." },
      { id: "opt_b", text: "Outward swinging door with single-action panic push-bar hardware", explanation: "Correct! NBC Part 4 Clause 3.4.15 mandates that all emergency exit doors must swing outward in the direction of escape and feature panic crash bars." },
      { id: "opt_c", text: "Padlocked steel door with key held by security supervisor", explanation: "Incorrect. Padlocked exits directly violate life safety codes." },
      { id: "opt_d", text: "Revolving glass door with no side swing door", explanation: "Incorrect. Revolving doors cannot be counted as main emergency fire exits." }
    ],
    correctId: "opt_b",
    nbcClauses: ["NBC Part 4, Clause 3.4.15 (Panic Hardware & Door Swing)", "Section 3.1.2"],
    bnsSection: "BNS Sec. 105 (Knowledge of Direct Danger to Human Lives)",
    hazardLevel: "CRITICAL",
    fact: "Panic hardware allows crowds to open exit doors instantly by pressing their bodies against the bar, preventing fatal crush injuries."
  },
  {
    id: "fb_q_004",
    title: "Educational Institute Occupant Density Audit #156",
    type: "Educational",
    location: "Coaching Hub Ward 6",
    description: "A coaching center operating on the 3rd floor of a commercial arcade holds 180 students in a single 90 sq.m room. The room has one 0.9m door opening inwards into a narrow hallway.",
    difficulty: "EASY",
    points: 5,
    options: [
      { id: "compliant", text: "Fully Compliant (Legal)", explanation: "Incorrect. Overcrowding student classrooms and restricting exit doors violates NBC occupant load factors." },
      { id: "non_compliant", text: "Non-Compliant (Illegal)", explanation: "Correct! NBC Part 4 Table 3 caps educational occupant load at 4.0 sq.m per net floor area for classrooms, requiring twin 1.5m outward opening doors for loads over 50 persons." }
    ],
    correctId: "non_compliant",
    nbcClauses: ["NBC Part 4, Table 3 (Occupant Load Factors)", "Table 5 (Egress Widths)"],
    bnsSection: "BNS Sec. 125 (Endangering Life of Students)",
    hazardLevel: "CRITICAL",
    fact: "When occupant density exceeds code limits, evacuating students jam against narrow inward doors, turning minor electrical sparks into deadly crush tragedies."
  },
  {
    id: "fb_q_005",
    title: "Lithium Battery Recycling Disassembly Yard",
    type: "Industrial/Hazardous",
    location: "Seelampur Industrial Zone",
    description: "A battery recycling facility storing 800 kilograms of discarded lithium-ion batteries installed high-pressure overhead water sprinkler heads directly above the battery sorting lines.",
    difficulty: "HARD",
    points: 15,
    options: [
      { id: "compliant", text: "Fully Compliant (Legal)", explanation: "Incorrect. Water reacts violently with burning lithium metal and battery thermal runaway." },
      { id: "non_compliant", text: "Non-Compliant (Illegal)", explanation: "Correct! NBC Part 4 forbids water suppressants for metal/chemical hazards where water causes hydrogen gas explosion risks." }
    ],
    correctId: "non_compliant",
    nbcClauses: ["NBC Clause 5.3.4 (Prohibited Water Suppressants)", "Part 4, Clause 4.12 (Class D Hazard Regulations)"],
    bnsSection: "BNS Sec. 287 (Extreme Danger to General Public)",
    hazardLevel: "CRITICAL",
    fact: "Lithium reactions strip oxygen from water, generating explosive hydrogen gas. Chemical processing requires specialized gas-flood or Class D suppression."
  },
  {
    id: "fb_q_006",
    title: "Electrical Transformer Room Isolation Code #185",
    type: "Electrical & HVAC",
    location: "Commercial Hub Phase 35",
    description: "Where must oil-filled electrical transformers located inside high-rise commercial buildings be situated according to NBC 2016 Part 8?",
    difficulty: "MEDIUM",
    points: 10,
    options: [
      { id: "opt_a", text: "Directly under the main central atrium floor", explanation: "Incorrect. Placing oil-filled transformers under public atriums creates massive fire risks." },
      { id: "opt_b", text: "On the ground floor or 1st basement level with direct external access and 4-hour fire-rated enclosure walls", explanation: "Correct! NBC Part 8 Section 4 mandates that sub-station transformers must be located on ground level or first basement perimeter with direct external access and 4-hour fire doors." },
      { id: "opt_c", text: "In upper residential penthouse utility rooms", explanation: "Incorrect. Upper floor transformers complicate oil drainage and emergency access." },
      { id: "opt_d", text: "Inside the primary emergency exit stairwell shaft", explanation: "Incorrect. Storing electrical transformers inside exit stairwells is strictly prohibited." }
    ],
    correctId: "opt_b",
    nbcClauses: ["NBC Part 8, Section 4 (Sub-station Enclosures)", "Part 4, Clause 4.8"],
    bnsSection: "BNS Sec. 287 (Negligent Maintenance of High-Voltage Infrastructure)",
    hazardLevel: "HIGH",
    fact: "Transformer oil fires burn at extreme temperatures. Direct ground level access allows fire service foam tenders to isolate transformer vaults quickly."
  },
  {
    id: "fb_q_007",
    title: "Basement Smoke Extraction & Fire Dampers",
    type: "Electrical & HVAC",
    location: "Metro Sub-Basement Arcade",
    description: "An underground basement parking facility with 3 levels lacks mechanical smoke extraction shafts, relying solely on natural stairwell drafts.",
    difficulty: "EASY",
    points: 5,
    options: [
      { id: "compliant", text: "Fully Compliant (Legal)", explanation: "Incorrect. Basements without forced mechanical ventilation become death traps from carbon monoxide accumulation." },
      { id: "non_compliant", text: "Non-Compliant (Illegal)", explanation: "Correct! NBC Part 4 Clause 4.6 requires mechanical smoke extraction systems providing at least 12 air changes/hour with automatic fire dampers." }
    ],
    correctId: "non_compliant",
    nbcClauses: ["NBC Part 4, Clause 4.6 (Basement Ventilation & Fire Dampers)"],
    bnsSection: "BNS Sec. 285 (Danger from Toxic Fume Accumulation)",
    hazardLevel: "HIGH",
    fact: "Basement fires starve of oxygen and generate deadly carbon monoxide. Forced mechanical smoke extraction is essential to permit firefighter entry."
  },
  {
    id: "fb_q_008",
    title: "High-Rise Refuge Area Rules #412",
    type: "Structural & Egress",
    location: "Skyline Tower Sector 62",
    description: "In a commercial building exceeding 24 meters in height, at what intervals must cantilevered external refuge areas be provided according to NBC 2016 Part 4?",
    difficulty: "MEDIUM",
    points: 10,
    options: [
      { id: "opt_a", text: "Only on the top penthouse roof", explanation: "Incorrect. Top roof access can be blocked by rising thermal updrafts." },
      { id: "opt_b", text: "At 24m height and every 15m thereafter above 24m floor level", explanation: "Correct! NBC Part 4 Clause 4.3.5 mandates refuge floors starting at 24m and repeating every 15m vertical elevation." },
      { id: "opt_c", text: "Refuge floors are optional if building has 2 elevators", explanation: "Incorrect. Elevators automatically park on ground floor during fire alarms and cannot substitute for refuge areas." },
      { id: "opt_d", text: "Every 2 floors regardless of total height", explanation: "Incorrect. Code specifies 24m threshold and 15m intervals." }
    ],
    correctId: "opt_b",
    nbcClauses: ["NBC Part 4, Clause 4.3.5 (Refuge Area Provisions)"],
    bnsSection: "BNS Sec. 106 (Failure to Provide Mandatory Emergency Refuge)",
    hazardLevel: "HIGH",
    fact: "Refuge areas provide pressurized, non-combustible safe havens for high-rise occupants waiting for aerial ladder hydraulic platform rescue."
  },
  {
    id: "fb_q_009",
    title: "Fire Pump House & Dual Power Supply Code",
    type: "Fire Suppression Systems",
    location: "Tech Park Central Complex",
    description: "The main electric fire pump supplying wet risers in a 45-meter IT park is powered strictly from the regular utility power line with no automatic diesel generator backup.",
    difficulty: "EASY",
    points: 5,
    options: [
      { id: "compliant", text: "Fully Compliant (Legal)", explanation: "Incorrect. Main power grid trips during severe fires, rendering electric pumps useless without automatic diesel backup." },
      { id: "non_compliant", text: "Non-Compliant (Illegal)", explanation: "Correct! NBC Part 4 Table 7 mandates an independent secondary power source (auto-starting diesel engine pump) for all high-rise fire pumps." }
    ],
    correctId: "non_compliant",
    nbcClauses: ["NBC Part 4, Table 7 (Fire Pumps & Secondary Power Supply)"],
    bnsSection: "BNS Sec. 287 (Failure to Maintain Critical Life Safety Equipment)",
    hazardLevel: "CRITICAL",
    fact: "Power authorities cut municipal electric grids during major fire calls to prevent electrocution, making automatic diesel backup pumps vital."
  },
  {
    id: "fb_q_010",
    title: "Hazardous Gas Cylinder Storage Distance",
    type: "Industrial/Hazardous",
    location: "Industrial Estate Block B",
    description: "LPG manifold cylinders totaling 500kg are kept directly inside an underground basement commercial kitchen without gas leak detection sensors.",
    difficulty: "HARD",
    points: 15,
    options: [
      { id: "compliant", text: "Fully Compliant (Legal)", explanation: "Incorrect. LPG gas cylinders stored in basements create catastrophic explosion hazards." },
      { id: "non_compliant", text: "Non-Compliant (Illegal)", explanation: "Correct! NBC Part 4 and Gas Cylinder Rules strictly forbid storing LPG cylinders in basements. Cylinders must be kept in open-air ground enclosures with leak sensors." }
    ],
    correctId: "non_compliant",
    nbcClauses: ["NBC Part 4, Clause 5.2 (LPG & Combustible Gas Enclosures)", "Gas Cylinder Rules 2016"],
    bnsSection: "BNS Sec. 287 (Negligent Handling of Explosive Material)",
    hazardLevel: "CRITICAL",
    fact: "LPG is heavier than air. Leaking gas sinks into basement pits and sumps, creating invisible vapor clouds that ignite with a single light switch click."
  }
];
