import { vi } from 'vitest';
import type { DailyUsage, Order } from '@shared/types/api';

type OrderSummary = Order;

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
  fetchRecentOrders: (count?: number) => Promise<OrderSummary[]>;
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
