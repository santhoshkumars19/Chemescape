import CalculationHeistPage from '../pages/CalculationHeistPage';
import QuantumArchitectPage from '../pages/QuantumArchitectPage';
import GridReconstructionPage from '../pages/GridReconstructionPage';
import HydrogenReactorPage from '../pages/HydrogenReactorPage';
import MetalSortingPage from '../pages/MetalSortingPage';
import GasSimulatorPage from '../pages/GasSimulatorPage';
import LabGamePage from '../pages/LabGamePage';

export const GAME_REGISTRY = {
  CALCULATION_HEIST: {
    name: 'Chem Calculation Heist',
    component: CalculationHeistPage,
    endpoint: 'calculation-heist',
  },
  QUANTUM_ARCHITECT: {
    name: 'Quantum Orbital Architect',
    component: QuantumArchitectPage,
    endpoint: 'quantum-architect',
  },
  GRID_RECONSTRUCTION: {
    name: 'Periodic Grid Reconstruction',
    component: GridReconstructionPage,
    endpoint: 'grid-reconstruction',
  },
  HYDROGEN_REACTOR: {
    name: 'Hydrogen Reactor',
    component: HydrogenReactorPage,
    endpoint: 'hydrogen-reactor',
  },
  METAL_SORTING: {
    name: 'Element Sorting Factory',
    component: MetalSortingPage,
    endpoint: 'metal-sorting',
  },
  GAS_SIMULATOR: {
    name: 'Gas Chamber Simulator',
    component: GasSimulatorPage,
    endpoint: 'gas-simulator',
  },
};

export function getGameComponentByGameType(gameType) {
  const matched = GAME_REGISTRY[gameType];
  return matched ? matched.component : LabGamePage;
}

export function getGameEndpointByGameType(gameType) {
  const matched = GAME_REGISTRY[gameType];
  return matched ? matched.endpoint : 'lab';
}

export default GAME_REGISTRY;
