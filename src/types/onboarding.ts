// ─────────────────────────────────────────────
//  Onboarding
// ─────────────────────────────────────────────

export interface OnboardingData {
  name: string;
  businessName: string;
  category: string;
  /** Reserved for future use – not collected in the current MVP flow */
  teamSize: string;
  mainProblem: string;
}

// ─────────────────────────────────────────────
//  Business / Dashboard data models
//  (structures ready for future implementation)
// ─────────────────────────────────────────────

export interface Sale {
  id: string;
  product: string;
  quantity: number;
  price: number;
  date: string;
}

export interface InventoryItem {
  id: string;
  product: string;
  quantity: number;
  price: number;
  minimumStock: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
}

export interface BusinessData {
  sales: Sale[];
  inventory: InventoryItem[];
  transactions: Transaction[];
}
