import { vi } from 'vitest';

interface DailyUsage {
  used: number;
  count: number;
  date: string;
}

interface Order {
  id: string;
  items?: Array<{
    product?: {
      emoji?: string;
      name?: string;
      category?: string;
      energyCost?: number;
    };
    quantity?: number;
  }>;
  totalEnergy?: number;
  totalItems?: number;
  orderDate: string;
  status?: string;
}

interface EnergyState {
  current: number;
  maxEnergy: number;
  lastResetDate: string | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
  initializeEnergy: (userId: string, plan?: string) => Promise<void>;
  hasEnoughEnergy: (cost: number) => boolean;
  deductEnergy: (cost: number, count?: number) => Promise<number>;
  restoreEnergy: (amount: number, count?: number) => Promise<number>;
  clearEnergy: () => void;
  resetEnergy: () => Promise<void>;
  fetchDailyUsage: (days?: number) => Promise<DailyUsage[]>;
  fetchRecentOrders: (count?: number) => Promise<Order[]>;
}

const defaultState: EnergyState = {
  current: 100,
  maxEnergy: 100,
  lastResetDate: null,
  loading: false,
  error: null,
  userId: null,
  initializeEnergy: vi.fn(),
  hasEnoughEnergy: vi.fn(() => true),
  deductEnergy: vi.fn(async () => 0),
  restoreEnergy: vi.fn(async () => 0),
  clearEnergy: vi.fn(),
  resetEnergy: vi.fn(),
  fetchDailyUsage: vi.fn(async () => []),
  fetchRecentOrders: vi.fn(async () => []),
};

let currentState = { ...defaultState };

export function useEnergyStore(): EnergyState;
export function useEnergyStore<T>(selector: (state: EnergyState) => T): T;
export function useEnergyStore<T>(selector?: (state: EnergyState) => T): EnergyState | T {
  if (selector) return selector(currentState);
  return currentState;
}

export function __setEnergyState(partial: Partial<EnergyState>) {
  currentState = { ...defaultState, ...partial };
}

export function __resetEnergyState() {
  currentState = {
    ...defaultState,
    initializeEnergy: vi.fn(),
    hasEnoughEnergy: vi.fn(() => true),
    deductEnergy: vi.fn(async () => 0),
    restoreEnergy: vi.fn(async () => 0),
    clearEnergy: vi.fn(),
    resetEnergy: vi.fn(),
    fetchDailyUsage: vi.fn(async () => []),
    fetchRecentOrders: vi.fn(async () => []),
  };
}
