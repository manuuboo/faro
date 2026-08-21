/**
 * storage.ts
 *
 * Centralised data-access layer.
 * ALL localStorage reads/writes go through here.
 *
 * Future migration path:
 *   Replace the localStorage calls below with fetch() / axios calls
 *   to a REST API without touching any UI component.
 */

import type { OnboardingData } from '../types/onboarding';
import type { BusinessData } from '../types/business';

// ─── Storage keys ───────────────────────────────────────────────────────────

const KEYS = {
  USER_DATA: 'faro_user_data',
  BUSINESS_ID: 'faro_business_id',
  ONBOARDING_COMPLETE: 'faro_onboarding_complete',
  BUSINESS_DATA: 'faro_business_data',
  TUTORIAL_COMPLETE: 'faro_tutorial_complete',
  SETTINGS: 'faro_settings',
} as const;


// ─── Helpers ─────────────────────────────────────────────────────────────────

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── User / Onboarding ───────────────────────────────────────────────────────

export function getUserData(): OnboardingData | null {
  return read<OnboardingData>(KEYS.USER_DATA);
}

export function saveUserData(data: OnboardingData): void {
  write(KEYS.USER_DATA, data);
}

export function getBusinessId(): string | null {
  return localStorage.getItem(KEYS.BUSINESS_ID);
}

export function saveBusinessId(id: string): void {
  localStorage.setItem(KEYS.BUSINESS_ID, id);
}

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(KEYS.ONBOARDING_COMPLETE) === 'true';
}

export function setOnboardingComplete(value = true): void {
  localStorage.setItem(KEYS.ONBOARDING_COMPLETE, String(value));
}

export function clearUserData(): void {
  localStorage.removeItem(KEYS.USER_DATA);
  localStorage.removeItem(KEYS.ONBOARDING_COMPLETE);
  localStorage.removeItem(KEYS.BUSINESS_DATA);
  localStorage.removeItem(KEYS.TUTORIAL_COMPLETE);
  localStorage.removeItem(KEYS.SETTINGS);
  localStorage.removeItem(KEYS.BUSINESS_ID);
}

// ─── Tutorial ───────────────────────────────────────────────────────────────

export function isTutorialComplete(): boolean {
  return localStorage.getItem(KEYS.TUTORIAL_COMPLETE) === 'true';
}

export function setTutorialComplete(value = true): void {
  localStorage.setItem(KEYS.TUTORIAL_COMPLETE, String(value));
}

export function resetTutorial(): void {
  localStorage.removeItem(KEYS.TUTORIAL_COMPLETE);
}

// ─── Business data ───────────────────────────────────────────────────────────

const DEFAULT_BUSINESS_DATA: BusinessData = {
  sales: [],
  purchases: [],
  clients: [],
  suppliers: [],
  expenses: [],
  inventory: [],
  invoices: [],
  activities: [],
  notifications: [],
};

export function getBusinessData(): BusinessData {
  const stored = read<Partial<BusinessData>>(KEYS.BUSINESS_DATA);
  if (!stored) return { ...DEFAULT_BUSINESS_DATA };

  return {
    ...DEFAULT_BUSINESS_DATA,
    ...stored,
    sales: stored.sales || [],
    purchases: stored.purchases || [],
    clients: stored.clients || [],
    suppliers: stored.suppliers || [],
    expenses: stored.expenses || [],
    inventory: stored.inventory || [],
    invoices: stored.invoices || [],
    activities: stored.activities || [],
    notifications: stored.notifications || [],
  } as BusinessData;
}

export function saveBusinessData(data: BusinessData): void {
  write(KEYS.BUSINESS_DATA, data);
}

