// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// Table types
export type TableStatus = 'available' | 'occupied'

export interface Table {
  id: number
  name: string
  status: TableStatus
  created_at: string
}

// Menu types
export type MenuItemType = 'food' | 'drink'

export interface MenuItem {
  id: number
  name: string
  price: number
  type: MenuItemType
  category: string | null
  created_at: string
}

export interface MenuItemsByCategory {
  [category: string]: MenuItem[]
}

// Order types
export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export interface OrderItem {
  id: number
  order_id: number
  menu_item_id: number
  quantity: number
  price_at_order_time: number
  note: string | null
  menu_item?: MenuItem
}

export interface Order {
  id: number
  table_id: number
  check_in: string
  check_out: string | null
  status: OrderStatus
  total_amount?: number
  table?: Table
  items?: OrderItem[]
}

export interface CreateOrderRequest {
  table_id: number
  items: Array<{
    menu_item_id: number
    quantity: number
    note?: string
  }>
}

export interface UpdateOrderItemsRequest {
  items: Array<{
    menu_item_id: number
    quantity: number
    note?: string
  }>
}

// Payment types
export type PaymentMethod = 'cash' | 'card' | 'transfer'

export interface Payment {
  id: number
  order_id: number
  amount: number
  paid_at: string
  payment_method: PaymentMethod
  order?: Order
}

export interface CreatePaymentRequest {
  order_id: number
  payment_method: PaymentMethod
}

export interface RevenueReport {
  total_revenue: number
  total_orders: number
  start_date?: string
  end_date?: string
}

// Dashboard stats
export interface DashboardStats {
  totalTables: number
  availableTables: number
  occupiedTables: number
  activeOrders: number
  todayRevenue: number
  todayOrders: number
}
