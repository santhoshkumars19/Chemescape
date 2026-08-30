import CalculationHeistPage from '../pages/CalculationHeistPage';
import QuantumArchitectPage from '../pages/QuantumArchitectPage';
import GridReconstructionPage from '../pages/GridReconstructionPage';
import HydrogenReactorPage from '../pages/HydrogenReactorPage';
import MetalSortingPage from '../pages/MetalSortingPage';
import GasSimulatorPage from '../pages/GasSimulatorPage';

export const GAME_REGISTRY = {
  CALCULATION_HEIST: {
    name: 'Chem Calculation Heist',
    component: CalculationHeistPage,
    endpoint: 'calculation-heist',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  QUANTUM_ARCHITECT: {
    name: 'Quantum Orbital Architect',
    component: QuantumArchitectPage,
    endpoint: 'quantum-architect',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  GRID_RECONSTRUCTION: {
    name: 'Periodic Grid Reconstruction',
    component: GridReconstructionPage,
    endpoint: 'grid-reconstruction',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  HYDROGEN_REACTOR: {
    name: 'Hydrogen Reactor',
    component: HydrogenReactorPage,
    endpoint: 'hydrogen-reactor',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  METAL_SORTING: {
    name: 'Element Sorting Factory',
    component: MetalSortingPage,
    endpoint: 'metal-sorting',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  GAS_SIMULATOR: {
    name: 'Gas Chamber Simulator',
    component: GasSimulatorPage,
    endpoint: 'gas-simulator',
    standard: 'grade-11',
    subject: 'chemistry',
  },
};

export function isGameTypeSupported(gameType) {
  if (!gameType) return false;
  const key = String(gameType).toUpperCase().replace(/[-\s]/g, '_');
  return Boolean(GAME_REGISTRY[key] || GAME_REGISTRY[gameType]);
}

export function getGameComponentByGameType(gameType) {
  if (!gameType) return null;
  const key = String(gameType).toUpperCase().replace(/[-\s]/g, '_');
  const matched = GAME_REGISTRY[key] || GAME_REGISTRY[gameType];
  return matched ? matched.component : null;
}

export function getGameEndpointByGameType(gameType) {
  if (!gameType) return null;
  const key = String(gameType).toUpperCase().replace(/[-\s]/g, '_');
  const matched = GAME_REGISTRY[key] || GAME_REGISTRY[gameType];
  return matched ? matched.endpoint : null;
}

export default GAME_REGISTRY;
