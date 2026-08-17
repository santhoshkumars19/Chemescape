# ChemEscape – Unique Game Design & Architectural Blueprint

## 📜 System Overview & Design Philosophy

**ChemEscape** is designed around a core architectural principle: **Every Chemistry Unit is a Completely Unique Game Engine Experience**.

Rather than relying on repetitive Multiple Choice Quiz (MCQ) templates, each of the 15 Chemistry units features custom UI mechanics, tailored environmental physics, interactive puzzles, and specialized win/fail conditions directly driven by actual curriculum Chemistry concepts.

---

## 🎮 Summary Matrix of 15 Chemistry Unit Games

| Unit | Syllabus Topic | Game Concept | Primary UI & Puzzle Mechanic | Badge |
| :--- | :--- | :--- | :--- | :--- |
| **Unit 1** | Basic Concepts & Calculations | **Chem Calculation Heist** | Keypad Vault Code & Stoichiometric Decryption | `Mole Master` |
| **Unit 2** | Quantum Mechanical Model | **Quantum Orbital Architect** | Electron Drag & Aufbau/Hund Orbital Builder | `Quantum Architect` |
| **Unit 3** | Periodic Classification | **Periodic Grid Reconstruction** | Periodic Table Tile Fitting & Trend Matching | `Periodic Master` |
| **Unit 4** | Hydrogen | **Hydrogen Reactor** | Pressure/Isotope Valve Balancing & Fuel Cell Assembly | `Hydrogen Engineer` |
| **Unit 5** | Alkali & Alkaline Earth Metals | **Element Sorting Factory** | Conveyor Belt Reactivity & Flame Test Sorting | `Metal Master` |
| **Unit 6** | Gaseous State | **Gas Chamber Simulator** | Kinetic Particle Pressure & $PV = nRT$ Sliders | `Gas Controller` |
| **Unit 7** | Thermodynamics | **Energy Core Reactor** | Calorimeter Heat Transfer & $\Delta H$ Energy Flow | `Thermo Engineer` |
| **Unit 8** | Equilibrium | **Equilibrium Stabilizer** | Le Chatelier Dual-Pan Balance & Stress Adjustment | `Equilibrium Master` |
| **Unit 9** | Solutions | **Precision Mixing Lab** | Beaker Volumetric Dilution & Concentration Target | `Solution Specialist` |
| **Unit 10** | Chemical Bonding | **Molecular Construction Lab** | Lewis Dot Node Connecting & VSEPR 3D Assembly | `Bond Builder` |
| **Unit 11** | Organic Fundamentals | **Carbon Detective** | Mass/NMR Spec Analysis & Functional Group Inspection | `Carbon Detective` |
| **Unit 12** | Organic Reaction Concepts | **Reaction Cipher** | Mechanism Arrow Drawing & Intermediate Routing | `Reaction Decoder` |
| **Unit 13** | Hydrocarbons | **Petrochemical Pipeline** | Refinery Fraction Valve Routing & Cracking Strategy | `Hydrocarbon Engineer` |
| **Unit 14** | Haloalkanes & Haloarenes | **Reaction Security Vault** | $S_N1/S_N2$ Stereochemical Combination Lock | `Reaction Strategist` |
| **Unit 15** | Environmental Chemistry | **Save the Chemical City** | Ecological Index Strategy Engine & Pollutant Scrubbing | `Eco Chemist` |

---

# 🚀 Unit-by-Unit Detailed Game Specifications

---

## UNIT 1: Basic Concepts of Chemistry and Chemical Calculations
### 🕹️ Game Name: *Chem Calculation Heist*

#### 1. Story & Lore Narrative
An elite rogue alchemist has encrypted the central laboratory vault containing rare chemical isotopes. To breach the vault before security lock-down, the student must solve stoichiometric calculations to generate each digit of the vault's master override combination.

#### 2. Game Environment & Visual Theme
- **Theme:** High-tech subterranean security vault with neon cyan security lasers, heavy reinforced titanium doors, and an interactive digital numeric keypad console.
- **Atmosphere:** Dark glassmorphism, countdown timers, security status indicators.

#### 3. Gameplay Mechanics & UI Interactions
- **Keypad & Combination Lock:** The player is presented with a 4-to-6 digit combination lock.
- **Stoichiometric Steps:** Each digit corresponds to a calculation challenge (e.g., calculating moles, molar mass, empirical formula, or percentage composition).
- **Interactive Scratchpad:** Built-in molar mass calculator & unit conversion tool.

#### 4. Puzzle Types
- Keypad Code Calculation
- Empirical Formula Assembly
- Mole-to-Particle Converter

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Mole Concept ($n = \frac{m}{M}$):** Number of moles determines target mass.
- **Avogadro's Number ($6.022 \times 10^{23}$):** Conversions to total atom count.
- **Stoichiometry & Limiting Reagent:** Determining exact product mass yields digit 3.

#### 6. Player Actions
- Select problem mode (Moles / Molar Mass / Limiting Reactant).
- Compute value using in-game calculator.
- Enter calculated value into the vault keypad.
- Submit override sequence.

#### 7. Win & Fail Conditions
- **Win:** All vault digits correctly entered before the timer expires ($100\%$ vault access).
- **Fail:** 3 incorrect code entries or timer hits 0 (Vault Lockdown).

#### 8. Rewards & Scoring
- **XP:** 500 XP | **Coins:** 100 Coins | **Badge:** `Mole Master` (🔑)

#### 9. Game State Structure
```json
{
  "vaultLocked": true,
  "digitsRequired": 4,
  "digitsSolved": [4, 2],
  "currentStage": 3,
  "timerSeconds": 300,
  "attemptsRemaining": 3
}
```

#### 10. Required Backend APIs
- `GET /api/games/heist/stage/:stageId`
- `POST /api/games/heist/verify-digit`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "CALCULATION_HEIST",
  "targetDigitIndex": 3,
  "givenData": {
    "compound": "CaCO3",
    "sampleMassGrams": 50.0,
    "targetQuestion": "How many moles of CaCO3 are present? (Multiply result by 8 for digit)"
  },
  "correctAnswer": 4,
  "tolerance": 0.01
}
```

---

## UNIT 2: Quantum Mechanical Model of Atom
### 🕹️ Game Name: *Quantum Orbital Architect*

#### 1. Story & Lore Narrative
The subatomic particle accelerator's containment magnetic field has collapsed, scattering electrons across quantum shells. The player must reconstruct ground-state electron configurations for unstable elements to restore magnetic containment.

#### 2. Game Environment & Visual Theme
- **Theme:** Futuristic particle accelerator chamber featuring glowing 3D spherical electron shells ($s, p, d, f$ orbitals), magnetic resonance rings, and electron energy level diagrams.
- **Atmosphere:** Deep purple ambient lighting, hum of particle beams, glowing electron nodes.

#### 3. Gameplay Mechanics & UI Interactions
- **Electron Drag & Drop:** Drag electron particles into orbital boxes ($1s, 2s, 2p_x, 2p_y, 2p_z$).
- **Spin Toggle:** Click an electron in an orbital to toggle spin direction ($\uparrow$ vs $\downarrow$).
- **Quantum Number Dial:** Rotate dials to match Principal ($n$), Azimuthal ($l$), Magnetic ($m_l$), and Spin ($m_s$) quantum numbers for designated electrons.

#### 4. Puzzle Types
- Aufbau Orbital Builder
- Spin Alignment (Hund's Rule)
- Quantum Number Matching

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Aufbau Principle:** Lower energy levels ($1s$) must be filled before higher levels ($2s, 2p$).
- **Pauli Exclusion Principle:** Maximum 2 electrons per orbital with opposite spins.
- **Hund's Rule:** Unpaired electrons must occupy degenerate orbitals with parallel spins first.

#### 6. Player Actions
- Grab electron from source pool.
- Drop into appropriate subshell box.
- Set spin orientation ($\uparrow / \downarrow$).
- Verify against total atomic number ($Z$).

#### 7. Win & Fail Conditions
- **Win:** All orbitals filled adhering to quantum rules for the given element.
- **Fail:** Inserting electrons breaking Pauli/Aufbau rules 3 times causes orbital collapse.

#### 8. Rewards & Scoring
- **XP:** 600 XP | **Coins:** 120 Coins | **Badge:** `Quantum Architect` (⚛️)

#### 9. Game State Structure
```json
{
  "element": "Oxygen",
  "atomicNumber": 8,
  "placedElectrons": [
    { "subshell": "1s", "spin": "up" },
    { "subshell": "1s", "spin": "down" },
    { "subshell": "2s", "spin": "up" },
    { "subshell": "2s", "spin": "down" },
    { "subshell": "2px", "spin": "up" },
    { "subshell": "2py", "spin": "up" },
    { "subshell": "2pz", "spin": "up" },
    { "subshell": "2px", "spin": "down" }
  ],
  "isStable": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/quantum/element/:atomicNumber`
- `POST /api/games/quantum/validate-configuration`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "ELECTRON_CONFIGURATION",
  "element": "Chromium",
  "atomicNumber": 24,
  "isException": true,
  "expectedConfiguration": {
    "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "4s": 1, "3d": 5
  },
  "explanation": "Chromium exhibits half-filled 3d subshell stability (4s1 3d5)."
}
```

---

## UNIT 3: Periodic Classification of Elements
### 🕹️ Game Name: *Periodic Grid Reconstruction*

#### 1. Story & Lore Narrative
A catastrophic laboratory sabotage wiped out the master periodic database. The player must reconstruct the periodic table by organizing elements using periodic trends, atomic radii, and valence electron properties.

#### 2. Game Environment & Visual Theme
- **Theme:** Holo-grid laboratory terminal displaying a partially empty 18-column, 7-period grid with color-coded block zones ($s, p, d, f$).

#### 3. Gameplay Mechanics & UI Interactions
- **Grid Placement Drag-and-Drop:** Drag element tiles into empty periodic table cells.
- **Trend Slider Comparison:** Adjust trend sliders (Atomic Radius, Ionization Energy, Electronegativity) to identify unknown element $X$.

#### 4. Puzzle Types
- Missing Element Grid Fitting
- Periodic Trend Ordering
- Group/Period Categorization

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Period Trends:** Atomic radius decreases across a period (left to right).
- **Group Trends:** Ionization energy decreases down a group.
- **Valence Electrons:** Group number determines outermost electron count.

#### 6. Player Actions
- Inspect clue (e.g., "Period 3, Group 16, High Electronegativity").
- Drag tile (Sulfur) into Row 3, Column 16.
- Validate placement.

#### 7. Win & Fail Conditions
- **Win:** All 18 columns and 7 period target cells correctly populated.
- **Fail:** 4 misplaced tiles trigger grid corruption.

#### 8. Rewards & Scoring
- **XP:** 500 XP | **Coins:** 100 Coins | **Badge:** `Periodic Master` (📊)

#### 9. Game State Structure
```json
{
  "gridSize": { "rows": 7, "cols": 18 },
  "placedElementsCount": 118,
  "correctlyPlaced": 118,
  "trendUnlocks": ["atomic_radius", "electronegativity"]
}
```

#### 10. Required Backend APIs
- `GET /api/games/periodic/grid-state`
- `POST /api/games/periodic/place-element`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "GRID_RECONSTRUCTION",
  "missingElements": [
    { "symbol": "O", "period": 2, "group": 16, "atomicNumber": 8 },
    { "symbol": "Na", "period": 3, "group": 1, "atomicNumber": 11 }
  ]
}
```

---

## UNIT 4: Hydrogen
### 🕹️ Game Name: *Hydrogen Reactor*

#### 1. Story & Lore Narrative
A clean-energy Hydrogen Fusion & Fuel Cell Core is experiencing severe instability. The engineer must manage protium, deuterium, and tritium isotope ratios and synthesize pure water to prevent core meltdown.

#### 2. Game Environment & Visual Theme
- **Theme:** High-pressure industrial gas chamber with pressure dials, isotope centrifuges, and fuel cell cathode/anode connectors.

#### 3. Gameplay Mechanics & UI Interactions
- **Isotope Centrifuge Separator:** Drag isotopes ($^1H, ^2H, ^3H$) into designated storage cells based on neutron count.
- **Fuel Cell Synchro Valves:** Adjust $H_2$ and $O_2$ flow valves to maintain stoichiometric 2:1 ratio.

#### 4. Puzzle Types
- Isotope Sorting
- Heavy Water ($D_2O$) Synthesis
- Hydride Classification (Ionic, Covalent, Metallic)

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Isotopes of Hydrogen:** Protium (0 neutrons), Deuterium (1 neutron), Tritium (2 neutrons, radioactive).
- **Water Gas Shift Reaction:** $CO + H_2O \rightarrow CO_2 + H_2$.
- **Hydrogen Peroxide ($H_2O_2$):** Non-linear open book structure and oxidizing properties.

#### 6. Player Actions
- Separate isotopes using mass spectrometer controls.
- Route $H_2$ gas through fuel cell membrane.
- Balance reaction valves for water synthesis.

#### 7. Win & Fail Conditions
- **Win:** Core pressure stabilizes at 100% power output.
- **Fail:** Incorrect gas ratio causes pressure overload ($> 150\text{ psi}$).

#### 8. Rewards & Scoring
- **XP:** 550 XP | **Coins:** 110 Coins | **Badge:** `Hydrogen Engineer` (🔋)

#### 9. Game State Structure
```json
{
  "corePressurePsi": 101.3,
  "h2FlowRate": 2.0,
  "o2FlowRate": 1.0,
  "isotopesBalanced": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/hydrogen/reactor-status`
- `POST /api/games/hydrogen/adjust-valves`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "REACTOR_STABILIZATION",
  "targetH2Ratio": 2.0,
  "isotopes": [
    { "name": "Protium", "mass": 1, "neutrons": 0 },
    { "name": "Deuterium", "mass": 2, "neutrons": 1 },
    { "name": "Tritium", "mass": 3, "neutrons": 2 }
  ]
}
```

---

## UNIT 5: Alkali and Alkaline Earth Metals
### 🕹️ Game Name: *Element Sorting Factory*

#### 1. Story & Lore Narrative
A chemical manufacturing plant received unlabelled shipments of Group 1 and Group 2 metals. The player operates the automated conveyor sorting line, using flame tests and water reactivity tests to direct metals into safe containment vessels.

#### 2. Game Environment & Visual Theme
- **Theme:** Industrial chemical sorting conveyor belt with Bunsen burner flame test stations, water bath drop zones, and robotic arm sorters.

#### 3. Gameplay Mechanics & UI Interactions
- **Flame Test Color Matching:** Drag metal samples into Bunsen burner flame and observe emitted spectral color (e.g., Crimson $\rightarrow$ Lithium, Golden Yellow $\rightarrow$ Sodium, Lilac $\rightarrow$ Potassium, Brick Red $\rightarrow$ Calcium).
- **Conveyor Switch Trigger:** Toggle conveyor switches to route reactive metals into oil baths vs sealed dry vaults.

#### 4. Puzzle Types
- Flame Test Color Identification
- Reactivity Rate Sorting ($Li < Na < K < Rb < Cs$)
- Carbonate Solubility Matching

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Flame Colors:** Characteristic excitation spectra of alkali/alkaline earth metals.
- **Reactivity Trend:** Group 1 metals react vigorously with water to form $MOH + H_2$.
- **Storage:** Group 1 metals stored under kerosene oil to prevent atmospheric oxidation.

#### 6. Player Actions
- Pick up metal sample from belt.
- Place sample in flame test chamber.
- Identify color and select element tag.
- Flip switch to route to kerosene storage or argon chamber.

#### 7. Win & Fail Conditions
- **Win:** All 20 metal samples sorted without explosion.
- **Fail:** Placing Sodium or Potassium into a water bath causes chemical explosion.

#### 8. Rewards & Scoring
- **XP:** 500 XP | **Coins:** 100 Coins | **Badge:** `Metal Master` (🔥)

#### 9. Game State Structure
```json
{
  "samplesSorted": 15,
  "totalSamples": 20,
  "conveyorSpeed": "medium",
  "explosions": 0
}
```

#### 10. Required Backend APIs
- `GET /api/games/metals/next-sample`
- `POST /api/games/metals/submit-sort`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "FLAME_TEST_SORTING",
  "sampleId": "metal_04",
  "flameColorHex": "#E60000",
  "flameColorName": "Crimson Red",
  "correctElement": "Li",
  "requiresKerosene": true
}
```

---

## UNIT 6: Gaseous State
### 🕹️ Game Name: *Gas Chamber Simulator*

#### 1. Story & Lore Narrative
An underwater research habitat's atmospheric chamber is malfunctioning. The player must adjust pressure, volume, temperature, and mole ratios to prevent hull collapse or explosion while obeying the Ideal Gas Law.

#### 2. Game Environment & Visual Theme
- **Theme:** Transparent hyperbaric chamber containing animated moving gas particles, digital pressure gauges ($P$), volume sliders ($V$), temperature controls ($T$), and a real-time $PV=nRT$ balance display.

#### 3. Gameplay Mechanics & UI Interactions
- **Interactive Sliders:** Smoothly adjust $P, V, T, n$ controls.
- **Real-time Physics Particle Motion:** Particle speed scales dynamically with temperature ($v_{rms} \propto \sqrt{T}$).
- **Graph Plotter:** Interactive plots showing $P$ vs $1/V$ (Boyle's Law) and $V$ vs $T$ (Charles' Law).

#### 4. Puzzle Types
- Ideal Gas Law Solver ($PV = nRT$)
- Dalton's Law Partial Pressure Balancer
- Graham's Law Diffusion Speed Race

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Boyle's Law ($P \propto \frac{1}{V}$):** Decreasing volume doubles particle collision frequency on walls.
- **Charles' Law ($V \propto T$):** Heating gas increases kinetic energy and expands volume.
- **Graham's Law ($\frac{r_1}{r_2} = \sqrt{\frac{M_2}{M_1}}$):** Lighter gases ($H_2$) diffuse faster than heavier gases ($CO_2$).

#### 6. Player Actions
- Observe target equilibrium state ($P_{target}, V_{target}$).
- Drag temperature and piston volume sliders.
- Monitor particle velocity and pressure reading.

#### 7. Win & Fail Conditions
- **Win:** Maintain chamber parameters within $\pm 2\%$ safety envelope for 10 seconds.
- **Fail:** Exceeding maximum pressure limit ($P > P_{max}$) ruptures the chamber window.

#### 8. Rewards & Scoring
- **XP:** 600 XP | **Coins:** 120 Coins | **Badge:** `Gas Controller` (🎈)

#### 9. Game State Structure
```json
{
  "pressureAtm": 2.4,
  "volumeLiters": 10.0,
  "temperatureKelvin": 300,
  "moles": 0.97,
  "isTargetReached": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/gas/target-state`
- `POST /api/games/gas/verify-simulation`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "GAS_SIMULATION",
  "given": { "P1": 1.0, "V1": 20.0, "T1": 300, "T2": 450 },
  "unknown": "V2",
  "targetValue": 30.0,
  "law": "Charles Law"
}
```

---

## UNIT 7: Thermodynamics
### 🕹️ Game Name: *Energy Core Reactor*

#### 1. Story & Lore Narrative
A thermochemical power facility's core is losing enthalpy equilibrium. The thermodynamic engineer must calculate reaction enthalpies ($\Delta H$), entropy ($\Delta S$), and Gibbs Free Energy ($\Delta G$) to prevent a thermal runaway or freeze.

#### 2. Game Environment & Visual Theme
- **Theme:** High-tech thermochemical generator with bomb calorimeter displays, thermal imaging heat maps (red/blue energy flows), and enthalpy level diagrams.

#### 3. Gameplay Mechanics & UI Interactions
- **Enthalpy Vector Dial:** Adjust reaction heat input ($q = m c \Delta T$).
- **Spontaneity Switch ($\Delta G = \Delta H - T \Delta S$):** Toggle reaction conditions between spontaneous ($\Delta G < 0$) and non-spontaneous ($\Delta G > 0$).
- **Hess's Law Cycle Assembler:** Drag thermochemical step equations to form a target Hess Cycle.

#### 4. Puzzle Types
- Hess's Law Addition Puzzle
- Calorimetry Calculation ($q = m c \Delta T$)
- Gibbs Spontaneity Decision Engine

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **First Law of Thermodynamics ($\Delta U = q + w$):** Energy conversion between heat and work.
- **Exothermic ($\Delta H < 0$) vs Endothermic ($\Delta H > 0$):** Heat released vs absorbed.
- **Gibbs Free Energy ($\Delta G < 0$):** Defines thermodynamic spontaneity.

#### 6. Player Actions
- Measure temperature change $\Delta T$ in calorimeter.
- Combine enthalpy steps using Hess's Law.
- Set system temperature to achieve spontaneous reaction ($\Delta G < 0$).

#### 7. Win & Fail Conditions
- **Win:** Core achieves stable power generation at $\Delta G = -50\text{ kJ/mol}$.
- **Fail:** Thermal runaway ($\Delta H > +500\text{ kJ}$) triggers core shutdown.

#### 8. Rewards & Scoring
- **XP:** 650 XP | **Coins:** 130 Coins | **Badge:** `Thermo Engineer` (🌡️)

#### 9. Game State Structure
```json
{
  "deltaH": -120.5,
  "deltaS": 0.15,
  "temperature": 298,
  "deltaG": -165.2,
  "isSpontaneous": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/thermo/core-status`
- `POST /api/games/thermo/submit-hess-cycle`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "HESS_LAW_PUZZLE",
  "targetEquation": "C(s) + O2(g) -> CO2(g)",
  "givenSteps": [
    { "eq": "C(s) + 1/2 O2(g) -> CO(g)", "deltaH": -110.5 },
    { "eq": "CO(g) + 1/2 O2(g) -> CO2(g)", "deltaH": -283.0 }
  ],
  "targetDeltaH": -393.5
}
```

---

## UNIT 8: Physical and Chemical Equilibrium
### 🕹️ Game Name: *Equilibrium Stabilizer*

#### 1. Story & Lore Narrative
An industrial chemical synthesis loop ($N_2 + 3H_2 \rightleftharpoons 2NH_3$) is fluctuating wildly. The player acts as the Chief Process Engineer, applying Le Chatelier's Principle to balance reactant and product yields under shifting stress conditions.

#### 2. Game Environment & Visual Theme
- **Theme:** Dual-pan balance scale representing Reactants ($A + B$) vs Products ($C + D$) with pressure gauges, temperature nozzles, and concentration injectors.

#### 3. Gameplay Mechanics & UI Interactions
- **Le Chatelier Stress Controls:** Inject reactants/products, increase/decrease pressure, or heat/cool the reaction vessel.
- **Equilibrium Constant ($K_c$) Gauge:** Real-time display of $K_c = \frac{[C]^c [D]^d}{[A]^a [B]^b}$.

#### 4. Puzzle Types
- Le Chatelier Shift Direction Prediction
- $K_c / K_p$ Expression Calculation
- pH & Buffer Balance ($pH = pKa + \log\frac{[A^-]}{[HA]}$)

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Le Chatelier's Principle:** Increasing reactant concentration shifts equilibrium to the right (products).
- **Pressure Effect:** Increasing pressure shifts equilibrium toward the side with fewer gas moles.
- **Exothermic Reaction Equilibrium:** Increasing temperature decreases $K_c$ for exothermic reactions.

#### 6. Player Actions
- Read system disturbance (e.g., "Pressure Increased").
- Predict shift direction (Forward / Reverse).
- Inject/remove species to re-establish $K_c$ balance.

#### 7. Win & Fail Conditions
- **Win:** Maintain product yield $> 90\%$ at steady equilibrium state.
- **Fail:** Allowing reaction quotient $Q_c$ to deviate by $> 50\%$ from $K_c$ causes system collapse.

#### 8. Rewards & Scoring
- **XP:** 600 XP | **Coins:** 120 Coins | **Badge:** `Equilibrium Master` (⚖️)

#### 9. Game State Structure
```json
{
  "reaction": "N2 + 3H2 <=> 2NH3",
  "kc": 0.5,
  "qc": 0.5,
  "equilibriumShift": "NONE",
  "yieldPercentage": 92.4
}
```

#### 10. Required Backend APIs
- `GET /api/games/equilibrium/state`
- `POST /api/games/equilibrium/apply-stress`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "LE_CHATELIER_BALANCE",
  "equation": "N2(g) + 3H2(g) <=> 2NH3(g) (Delta H = -92 kJ)",
  "appliedStress": "INCREASE_PRESSURE",
  "correctShift": "FORWARD",
  "explanation": "Increasing pressure shifts equilibrium to the side with fewer gas moles (4 moles -> 2 moles)."
}
```

---

## UNIT 9: Solutions
### 🕹️ Game Name: *Precision Mixing Lab*

#### 1. Story & Lore Narrative
A medical synthesis laboratory requires exact concentration reagents for emergency antidotes. The technician must measure solutes, calculate molarity ($M$), molality ($m$), and perform precise volumetric dilutions.

#### 2. Game Environment & Visual Theme
- **Theme:** Virtual wet lab bench featuring glass volumetric flasks, pipettes, electronic analytical balances, magnetic stirrers, and liquid meniscus displays.

#### 3. Gameplay Mechanics & UI Interactions
- **Precision Flask Pouring:** Fill volumetric flask to the graduation line (watching meniscus curvature).
- **Concentration Drag Dial:** Calculate and measure solid solute mass ($g$) on analytical balance.
- **Dilution Slider ($M_1 V_1 = M_2 V_2$):** Dilute concentrated stock solution to target molarity.

#### 4. Puzzle Types
- Volumetric Molarity Preparation ($M = \frac{n}{V}$)
- Stock Dilution ($M_1 V_1 = M_2 V_2$)
- Colligative Property Freezing Point Depression ($\Delta T_f = K_f \cdot m$)

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Molarity ($M$):** Moles of solute per liter of solution ($mol/L$).
- **Dilution Principle:** Total moles of solute remain constant during dilution ($M_1 V_1 = M_2 V_2$).
- **Raoult's Law & Vapor Pressure:** Adding non-volatile solute lowers vapor pressure.

#### 6. Player Actions
- Calculate required mass of solute $NaOH$.
- Weigh mass on virtual digital balance.
- Transfer solute to volumetric flask and add distilled water to mark.

#### 7. Win & Fail Conditions
- **Win:** Solution concentration matches target within $\pm 0.005\text{ M}$.
- **Fail:** Overfilling flask past graduation line or incorrect mass calculation requires dumping solution.

#### 8. Rewards & Scoring
- **XP:** 500 XP | **Coins:** 100 Coins | **Badge:** `Solution Specialist` (🧪)

#### 9. Game State Structure
```json
{
  "targetMolarity": 0.25,
  "preparedMolarity": 0.25,
  "volumeMl": 500,
  "soluteGrams": 5.0,
  "isAccurate": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/solutions/target-recipe`
- `POST /api/games/solutions/verify-solution`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "PRECISION_DILUTION",
  "stockMolarity": 12.0,
  "targetMolarity": 1.5,
  "targetVolumeMl": 500.0,
  "correctStockVolumeMl": 62.5
}
```

---

## UNIT 10: Chemical Bonding
### 🕹️ Game Name: *Molecular Construction Lab*

#### 1. Story & Lore Narrative
A nanotech manufacturing platform requires structural molecular assembly. The player builds 3D covalent and ionic chemical structures by placing valence electrons, forming single/double/triple bonds, and predicting VSEPR 3D geometry.

#### 2. Game Environment & Visual Theme
- **Theme:** 3D molecular canvas with floating atomic nuclei ($C, H, O, N, Cl$), valence electron snapping nodes, bond spring connectors, and 3D VSEPR geometry rotators.

#### 3. Gameplay Mechanics & UI Interactions
- **Atom Drag-and-Snap:** Drag atomic symbols onto canvas.
- **Lewis Electron Dot Snapping:** Click and drag electron dots between atoms to form single ($-$)$, double ($=$)$, or triple ($\equiv$) bonds.
- **VSEPR 3D Rotation:** Rotate 3D molecular model to select geometry (Linear, Trigonal Planar, Tetrahedral, Trigonal Bipyramidal, Octahedral).

#### 4. Puzzle Types
- Lewis Structure Builder
- VSEPR Geometry Identifier
- Formal Charge Minimization

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Octet Rule:** Atoms share electrons to achieve 8 valence electrons (except $H$).
- **VSEPR Theory:** Electron pairs repel each other to maximize spatial separation angle ($109.5^\circ$ for tetrahedral).
- **Electronegativity Difference ($\Delta EN$):** Determines polar vs non-polar covalent vs ionic bonds.

#### 6. Player Actions
- Calculate total valence electrons.
- Connect central atom to terminal atoms.
- Distribute lone pairs to complete octets.
- Select 3D VSEPR shape tag.

#### 7. Win & Fail Conditions
- **Win:** Correct Lewis structure and VSEPR geometry assembled.
- **Fail:** Incomplete octets or incorrect total electron count triggers structural collapse.

#### 8. Rewards & Scoring
- **XP:** 650 XP | **Coins:** 130 Coins | **Badge:** `Bond Builder` (💎)

#### 9. Game State Structure
```json
{
  "molecule": "CH4",
  "valenceElectronsUsed": 8,
  "bondsFormed": 4,
  "vseprShape": "Tetrahedral",
  "bondAngle": 109.5,
  "isCorrect": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/bonding/target-molecule`
- `POST /api/games/bonding/verify-structure`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "MOLECULAR_BUILDER",
  "formula": "H2O",
  "totalValenceElectrons": 8,
  "centralAtom": "O",
  "expectedBonds": 2,
  "expectedLonePairs": 2,
  "expectedShape": "Bent"
}
```

---

## UNIT 11: Fundamentals of Organic Chemistry
### 🕹️ Game Name: *Carbon Detective*

#### 1. Story & Lore Narrative
A mysterious unknown organic toxin has been uncovered at a crime scene. The forensic chemist must inspect functional groups, decode IUPAC nomenclature, and identify structural isomers to identify the substance.

#### 2. Game Environment & Visual Theme
- **Theme:** Forensic investigation lab with infrared spectrometer screen, mass spec peaks, interactive 2D chemical structure inspector, and IUPAC name generator wheel.

#### 3. Gameplay Mechanics & UI Interactions
- **Functional Group Scanner:** Hover magnifying scanner over organic molecule to highlight functional groups (Alcohol $-\text{OH}$, Aldehyde $-\text{CHO}$, Ketone $-\text{CO}-$, Carboxylic Acid $-\text{COOH}$, Ester $-\text{COOR}$).
- **IUPAC Nomenclature Builder Wheel:** Rotate prefix, root chain, suffix wheels (e.g., *eth-* + *-an-* + *-ol* $\rightarrow$ Ethanol).

#### 4. Puzzle Types
- Functional Group Identification
- IUPAC Naming Wheel
- Structural Isomer Matcher

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **IUPAC Rules:** Longest carbon chain selection, lowest locant rule for functional groups.
- **Isomerism:** Compounds with same molecular formula but different structural arrangements.
- **Homologous Series:** Successive members differing by $-\text{CH}_2-$ unit.

#### 6. Player Actions
- Scan unknown molecule for functional groups.
- Identify longest carbon chain length.
- Dial IUPAC name wheels to construct official name.

#### 7. Win & Fail Conditions
- **Win:** Unknown compound correctly named and functional group classified.
- **Fail:** 3 incorrect IUPAC name submissions invalidates the evidence report.

#### 8. Rewards & Scoring
- **XP:** 600 XP | **Coins:** 120 Coins | **Badge:** `Carbon Detective` (🔍)

#### 9. Game State Structure
```json
{
  "unknownCompoundId": "org_07",
  "formula": "C3H6O",
  "identifiedGroups": ["Ketone"],
  "selectedIupacName": "Propan-2-one",
  "isSolved": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/organic/forensic-sample`
- `POST /api/games/organic/verify-iupac`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "CARBON_DETECTIVE",
  "structureSmi": "CC(=O)C",
  "formula": "C3H6O",
  "correctIupac": "Propan-2-one",
  "functionalGroup": "Ketone",
  "distractors": ["Propanal", "Prop-2-en-1-ol", "Methoxyethene"]
}
```

---

## UNIT 12: Basic Concept of Organic Reactions
### 🕹️ Game Name: *Reaction Cipher*

#### 1. Story & Lore Narrative
An encrypted chemical database holds the secrets to catalytic organic synthesis. The player must decode reaction ciphers by tracing electron pushing arrows (curved arrows), identifying nucleophiles/electrophiles, and predicting reaction intermediates.

#### 2. Game Environment & Visual Theme
- **Theme:** Cybernetic terminal screen displaying organic reaction mechanisms with animated electron density clouds, curved arrow tools, and intermediate resonance structures.

#### 3. Gameplay Mechanics & UI Interactions
- **Curved Arrow Drawing Tool:** Click nucleophilic electron pair and drag arrow head to electrophilic carbon center.
- **Intermediate Selector:** Drag correct carbocation/carbanion intermediate into the reaction sequence step.

#### 4. Puzzle Types
- Electron Pushing Arrow Placement
- Nucleophile vs Electrophile Tagging
- Inductive & Mesomeric (+I / -I, +M / -M) Effect Classifier

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Curved Arrow Notation:** Indicates movement of electron pairs from electron-rich to electron-deficient sites.
- **Carbocation Stability:** $3^\circ > 2^\circ > 1^\circ > \text{Methyl}$ due to hyperconjugation and +I effect.
- **Electrophile vs Nucleophile:** Electron-seeking ($\text{E}^+$) vs electron-donating ($\text{Nu}^-$).

#### 6. Player Actions
- Select nucleophile site ($\text{OH}^-$).
- Draw curved arrow to electrophilic carbon ($R-\text{CH}_2-\text{Br}$).
- Select stable intermediate ($3^\circ$ carbocation).

#### 7. Win & Fail Conditions
- **Win:** Complete mechanism sequence decoded from reactants to final products.
- **Fail:** Directing electron arrows from electrophile to nucleophile causes mechanism error.

#### 8. Rewards & Scoring
- **XP:** 650 XP | **Coins:** 130 Coins | **Badge:** `Reaction Decoder` (🔓)

#### 9. Game State Structure
```json
{
  "reactionType": "Nucleophilic Substitution",
  "arrowsCorrect": 2,
  "intermediateSelected": "3_degree_carbocation",
  "cipherUnlocked": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/reaction-cipher/stage`
- `POST /api/games/reaction-cipher/submit-arrow`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "REACTION_CIPHER",
  "reactant": "(CH3)3C-Br",
  "reagent": "H2O",
  "mechanism": "SN1",
  "correctIntermediate": "tertiary_carbocation",
  "arrowStartNode": "lone_pair_O",
  "arrowEndNode": "C_plus"
}
```

---

## UNIT 13: Hydrocarbons
### 🕹️ Game Name: *Petrochemical Pipeline*

#### 1. Story & Lore Narrative
A major petroleum refinery plant pipeline network is damaged. The chemical engineer must route raw alkane feedstocks through cracking units, addition reactions, and aromatic substitution loops to synthesize target polymer products.

#### 2. Game Environment & Visual Theme
- **Theme:** Industrial refinery pipe matrix with pressure valves, catalytic cracking towers, hydrogenation units, and glowing hydrocarbon fluid streams.

#### 3. Gameplay Mechanics & UI Interactions
- **Pipeline Valve Routing:** Rotate pipe junction valves to direct hydrocarbon streams through specific reaction chambers (e.g., $Br_2/h\nu$, $H_2/Pt$, $KMnO_4$).
- **Combustion Ratio Lever:** Adjust $O_2$ air intake to achieve complete combustion ($\text{CO}_2 + \text{H}_2\text{O}$) vs incomplete combustion ($\text{CO} / \text{C}$).

#### 4. Puzzle Types
- Reaction Pathway Routing (Alkane $\rightarrow$ Alkene $\rightarrow$ Alkyne)
- Markownikoff vs Anti-Markownikoff Addition Selector
- Electrophilic Aromatic Substitution (Benzene Nitration/Halogenation)

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Markownikoff's Rule:** Acid addition to unsymmetrical alkene adds $H$ to carbon with more hydrogens.
- **Ozonolysis ($O_3 / Zn$):** Cleaves double bonds to yield aldehydes/ketones.
- **Aromatic Stability:** Benzene undergoes substitution rather than addition to preserve aromatic resonance.

#### 6. Player Actions
- Select starting material (Propene).
- Route stream into $HBr + \text{Peroxide}$ valve (Anti-Markownikoff).
- Collect 1-bromopropane at output valve.

#### 7. Win & Fail Conditions
- **Win:** Target petrochemical product synthesized at $100\%$ pipeline efficiency.
- **Fail:** Wrong reagent selection causes pipeline clogging or toxic side-product formation.

#### 8. Rewards & Scoring
- **XP:** 650 XP | **Coins:** 130 Coins | **Badge:** `Hydrocarbon Engineer` (🛢️)

#### 9. Game State Structure
```json
{
  "startingHydrocarbon": "Propene",
  "reagentsApplied": ["HBr", "Peroxides"],
  "targetProduct": "1-bromopropane",
  "pipelineFlowActive": true,
  "isSuccessful": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/hydrocarbons/pipeline-map`
- `POST /api/games/hydrocarbons/select-reagent-path`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "PETROCHEMICAL_PIPELINE",
  "startMaterial": "CH3-CH=CH2",
  "targetProduct": "CH3-CH(OH)-CH3",
  "correctPath": ["H2O / H+"],
  "ruleApplied": "Markownikoff Addition"
}
```

---

## UNIT 14: Haloalkanes and Haloarenes
### 🕹️ Game Name: *Reaction Security Vault*

#### 1. Story & Lore Narrative
An underground chemical safe is sealed by stereochemical substitution locks. The player must choose between $S_N1$ vs $S_N2$ and $E1$ vs $E2$ reaction mechanisms to invert or retain stereochemistry and unlock the vault.

#### 2. Game Environment & Visual Theme
- **Theme:** Vault door with rotating 3D stereochemical combination dials showing Walden Inversion ($R \leftrightarrow S$ configuration) and solvent chamber monitors (polar protic vs polar aprotic).

#### 3. Gameplay Mechanics & UI Interactions
- **$S_N1$ vs $S_N2$ Mechanism Toggle Switch:** Select mechanism based on substrate ($1^\circ, 2^\circ, 3^\circ$), nucleophile strength, and solvent type.
- **Walden Inversion 3D Molecule Flipper:** Observe umbrella-like stereochemical inversion in $S_N2$ and flip 3D product model accordingly ($R \rightarrow S$).

#### 4. Puzzle Types
- $S_N1$ vs $S_N2$ Mechanism Decider
- Walden Inversion Stereochemistry Lock
- Grignard Reagent ($RMgX$) Synthesis Puzzle

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **$S_N2$ Mechanism:** One-step bimolecular reaction causing $100\%$ Walden inversion ($R \rightarrow S$).
- **$S_N1$ Mechanism:** Two-step reaction via carbocation intermediate causing racemization ($50\% R + 50\% S$).
- **Solvent Effects:** Polar aprotic solvents (acetone, DMSO) favor $S_N2$; polar protic solvents ($H_2O, EtOH$) favor $S_N1$.

#### 6. Player Actions
- Analyze substrate ($1^\circ$ Alkyl Halide) and solvent (Acetone).
- Flip mechanism switch to $S_N2$.
- Rotate combination dial to inverted stereocenter ($S$-configuration).

#### 7. Win & Fail Conditions
- **Win:** Combination lock unlocks upon correct stereochemical product input.
- **Fail:** Selecting $S_N1$ for a primary alkyl halide jams the vault lock mechanism.

#### 8. Rewards & Scoring
- **XP:** 700 XP | **Coins:** 140 Coins | **Badge:** `Reaction Strategist` (🔐)

#### 9. Game State Structure
```json
{
  "substrate": "1-bromobutane",
  "nucleophile": "NaI",
  "solvent": "Acetone",
  "chosenMechanism": "SN2",
  "stereochemistryResult": "Inverted",
  "vaultUnlocked": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/haloalkanes/vault-challenge`
- `POST /api/games/haloalkanes/verify-mechanism`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "STREOCHEMICAL_VAULT",
  "substrate": "(R)-2-bromobutane",
  "reagent": "NaOH (dilute)",
  "solvent": "Water",
  "correctMechanism": "SN1",
  "expectedProduct": "Racemic 2-butanol (50% R, 50% S)"
}
```

---

## UNIT 15: Environmental Chemistry
### 🕹️ Game Name: *Save the Chemical City*

#### 1. Story & Lore Narrative
"Metropolis Chemica" is facing an ecological catastrophe due to smog, acid rain, industrial heavy metal effluents, and ozone depletion. The player assumes the role of Chief Environmental Officer, managing chemical treatments and policy decisions to lower city pollution metrics below critical emergency thresholds.

#### 2. Game Environment & Visual Theme
- **Theme:** Interactive city map simulation dashboard showing live indicators for Air Quality Index (AQI), Water pH, Soil Heavy Metal Levels, and Stratospheric Ozone Layer Thickness.

#### 3. Gameplay Mechanics & UI Interactions
- **Chemical Treatment Scrubbers:** Deploy industrial catalytic converters ($\text{NO}_x \rightarrow \text{N}_2$), flue gas desulfurization ($\text{SO}_2 + \text{CaCO}_3 \rightarrow \text{CaSO}_4$), and lime treatment for acidic lakes.
- **Policy Decision Cards:** Drag and enact environmental policies (e.g., Ban CFCs, Enforce Green Chemistry metrics, Deploy Electrostatic Precipitators).

#### 4. Puzzle Types
- Acid Rain Neutralization Calculation ($\text{H}_2\text{SO}_4 + \text{Ca(OH)}_2$)
- Ozone Depletion Free Radical Mechanism Chaining ($Cl^\bullet + O_3 \rightarrow ClO^\bullet + O_2$)
- BOD (Biochemical Oxygen Demand) Water Quality Balancer

#### 5. Chemistry Concepts Directly Mapped to Mechanics
- **Acid Rain:** $\text{SO}_2$ and $\text{NO}_x$ react with moisture to form $\text{H}_2\text{SO}_4$ and $\text{HNO}_3$ ($pH < 5.6$).
- **Ozone Depletion:** Chlorofluorocarbons (CFCs) release chlorine free radicals ($Cl^\bullet$) that breakdown $O_3$.
- **Green Chemistry Principles:** Preventing waste, atom economy, non-toxic chemical synthesis.

#### 6. Player Actions
- Inspect polluted river ($pH = 4.2$).
- Calculate required Calcium Hydroxide mass to neutralize lake acid.
- Deploy catalytic scrubbers to reduce industrial $\text{SO}_2$ emission.
- Pass anti-CFC legislation to halt ozone degradation.

#### 7. Win & Fail Conditions
- **Win:** All city environmental indices brought into the Green Safe Zone ($\text{AQI} < 50, \text{Water } pH = 6.8 - 7.2, \text{BOD} < 5\text{ ppm}$).
- **Fail:** Letting AQI exceed $400$ or Lake $pH$ drop below $3.5$ triggers mass evacuation.

#### 8. Rewards & Scoring
- **XP:** 750 XP | **Coins:** 150 Coins | **Badge:** `Eco Chemist` (🌱)

#### 9. Game State Structure
```json
{
  "cityAqi": 42,
  "waterPh": 7.0,
  "bodPpm": 3.2,
  "ozoneThicknessDobson": 300,
  "ecoScore": 98,
  "citySaved": true
}
```

#### 10. Required Backend APIs
- `GET /api/games/environmental/city-metrics`
- `POST /api/games/environmental/apply-treatment`

#### 11. `puzzleData` JSON Schema & Example
```json
{
  "puzzleType": "ECOLOGICAL_STRATEGY",
  "issue": "ACID_RAIN",
  "lakeVolumeLiters": 1000000.0,
  "currentPh": 4.0,
  "correctNeutralizer": "Ca(OH)2",
  "calculatedMassKg": 3.7
}
```

---

# 🗄️ Summary of Database & Prisma Schema Additions Required for Implementation

To support all 15 unique game mechanics in future development phases, the backend Prisma schema (`prisma/schema.prisma`) will need to incorporate the following additional models and fields:

### 1. New Enums to Add
```prisma
enum GameType {
  CALCULATION_HEIST
  QUANTUM_ARCHITECT
  GRID_RECONSTRUCTION
  HYDROGEN_REACTOR
  METAL_SORTING
  GAS_SIMULATOR
  ENERGY_CORE
  EQUILIBRIUM_STABILIZER
  PRECISION_MIXING
  MOLECULAR_BUILDER
  CARBON_DETECTIVE
  REACTION_CIPHER
  PETROCHEMICAL_PIPELINE
  STREOCHEMICAL_VAULT
  ECOLOGICAL_STRATEGY
}
```

### 2. Additions to `Room` Model
- Add `gameType GameType @default(CALCULATION_HEIST)` to specify which frontend game component engine renders for the room.
- Add `gameConfig Json?` to store room-level interactive parameters (e.g. initial timer, allowed attempts, environment theme settings).

### 3. Future Game Progress Tracking Model (`UserGameProgress`)
```prisma
model UserGameProgress {
  id           String    @id @default(uuid())
  userId       String
  chapterId    String
  roomId       String
  highScore    Int       @default(0)
  starsEarned  Int       @default(0) // 1, 2, or 3 stars
  isCompleted  Boolean   @default(false)
  attempts     Int       @default(0)
  bestTimeSec  Int?
  gameState    Json?     // Saved mid-game state for resuming
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter      Chapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  room         Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@unique([userId, roomId])
  @@map("user_game_progress")
}
```

### 4. User Badges Model (`UserBadge`)
```prisma
model UserBadge {
  id        String   @id @default(uuid())
  userId    String
  badgeName String
  unlockedAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeName])
  @@map("user_badges")
}
```

---

## 🎯 Conclusion & Next Steps
This blueprint provides a complete technical roadmap for turning all 15 Chemistry units into distinct, gamified interactive experiences. 

Each unit combines core syllabus learning objectives with unique UI interactions, ensuring students stay engaged while mastering complex chemical concepts.
