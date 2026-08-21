// ─── Activity System ────────────────────────────────────────────────────────

export type ActivityType = 'sale' | 'purchase' | 'client' | 'expense' | 'inventory' | 'invoice' | 'supplier';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  amount?: number;
  date: string;
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export interface SaleItem {
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  description: string; // kept for backward compat
  items?: SaleItem[];
  amount: number;
  clientId?: string;
  clientName?: string;
  date: string;
}

// ─── Purchases ───────────────────────────────────────────────────────────────

export interface PurchaseItem {
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface Purchase {
  id: string;
  description: string;
  items?: PurchaseItem[];
  amount: number;
  supplierId?: string;
  supplierName?: string;
  date: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  costPrice: number;
  unit: string; // e.g. "unidad", "kg", "litro"
  date: string;
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact?: string; // backward compat alias
  notes?: string;
  date: string;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  notes?: string;
  date: string;
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category?: string;
  date: string;
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  type?: string;
  number: string;
  clientId?: string;
  clientName: string;
  clientCuit?: string;
  clientEmail?: string;
  clientPhone?: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  notes?: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType = 'sale' | 'purchase' | 'stock' | 'invoice' | 'system' | 'client';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  date: string;
}

// ─── Chat messages ────────────────────────────────────────────────────────────

export type AttachmentType = 'image' | 'file' | 'audio';

export interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  size?: number;
  url?: string;     // object URL for preview
  mimeType?: string;
  duration?: number; // for audio in seconds
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'faro';
  text: string;
  attachments?: Attachment[];
  date: string;
}

// ─── Business Data Root ──────────────────────────────────────────────────────

export interface BusinessData {
  sales: Sale[];
  purchases: Purchase[];
  clients: Client[];
  suppliers: Supplier[];
  expenses: Expense[];
  inventory: InventoryProduct[];
  invoices: Invoice[];
  activities: Activity[];
  notifications: AppNotification[];
}
