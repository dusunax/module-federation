type EnergyState = {
  current: number;
  maxEnergy: number;
};

let state: EnergyState = { current: 3, maxEnergy: 5 };

export const __setMockEnergyState = (next: Partial<EnergyState>) => {
  state = { ...state, ...next };
};

export const useEnergyStore = () => state;
