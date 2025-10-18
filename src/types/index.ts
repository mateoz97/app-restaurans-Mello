// User and Auth Types
export type UserRole = 'admin' | 'manager' | 'waiter' | 'chef';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

// Permissions
export type Permission =
  | 'view_dashboard'
  | 'view_orders'
  | 'create_order'
  | 'edit_order'
  | 'delete_order'
  | 'view_inventory'
  | 'edit_inventory'
  | 'manage_users'
  | 'view_reports'
  | 'view_revenue';

// Order Types
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type OrderType = 'dine-in' | 'takeaway';
export type PaymentStatus = 'paid' | 'pending';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber?: number;  // Opcional para pedidos para llevar
  items: OrderItem[];
  status: OrderStatus;
  orderType: OrderType;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

// Inventory Types
export type InventoryCategory = 'beverages' | 'food' | 'supplies' | 'other';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  supplier?: string;
  lastUpdated: Date;
}

// Stats Types
export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  lowStockItems: number;
}
