import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './api'
import type {
  Table,
  MenuItem,
  MenuItemsByCategory,
  Order,
  Payment,
  CreateOrderRequest,
  UpdateOrderItemsRequest,
  CreatePaymentRequest,
  RevenueReport,
  ApiResponse,
} from '@/types'

// Query keys
export const QUERY_KEYS = {
  tables: ['tables'],
  table: (id: number) => ['tables', id],
  availableTables: ['tables', 'available'],
  
  menuItems: ['menu-items'],
  menuItemsByCategory: ['menu-items', 'by-category'],
  menuItem: (id: number) => ['menu-items', id],
  
  orders: ['orders'],
  order: (id: number) => ['orders', id],
  activeOrders: ['orders', 'active'],
  tableActiveOrder: (tableId: number) => ['orders', 'table', tableId],
  
  payments: ['payments'],
  payment: (id: number) => ['payments', id],
  revenue: (startDate?: string, endDate?: string) => ['payments', 'revenue', startDate, endDate],
}

// ============= TABLES =============
export const useTables = () => {
  return useQuery({
    queryKey: QUERY_KEYS.tables,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Table[]>>('/tables')
      return response.data
    },
  })
}

export const useAvailableTables = () => {
  return useQuery({
    queryKey: QUERY_KEYS.availableTables,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Table[]>>('/tables/available')
      return response.data
    },
  })
}

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'available' | 'occupied' }) => {
      const response = await api.patch<ApiResponse<Table>>(`/tables/${id}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.availableTables })
    },
  })
}

// ============= MENU ITEMS =============
export const useMenuItems = (type?: 'food' | 'drink') => {
  return useQuery({
    queryKey: [...QUERY_KEYS.menuItems, type],
    queryFn: async () => {
      const params = type ? { type } : {}
      const response = await api.get<ApiResponse<MenuItem[]>>('/menu-items', { params })
      return response.data
    },
  })
}

export const useMenuItemsByCategory = () => {
  return useQuery({
    queryKey: QUERY_KEYS.menuItemsByCategory,
    queryFn: async () => {
      const response = await api.get<ApiResponse<MenuItemsByCategory>>('/menu-items/grouped/by-category')
      return response.data
    },
  })
}

// ============= ORDERS =============
export const useOrders = (status?: 'pending' | 'completed' | 'cancelled') => {
  return useQuery({
    queryKey: [...QUERY_KEYS.orders, status],
    queryFn: async () => {
      const params = status ? { status } : {}
      const response = await api.get<ApiResponse<Order[]>>('/orders', { params })
      return response.data
    },
  })
}

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Order>>(`/orders/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export const useTableActiveOrder = (tableId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.tableActiveOrder(tableId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Order>>(`/orders/table/${tableId}/active`)
      return response.data
    },
    enabled: !!tableId,
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const response = await api.post<ApiResponse<Order>>('/orders', data)
      return response.data
    },
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables })
      // Invalidate the specific table's active order query
      if (newOrder?.table_id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tableActiveOrder(newOrder.table_id) })
      }
    },
  })
}

export const useUpdateOrderItems = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateOrderItemsRequest }) => {
      const response = await api.put<ApiResponse<Order>>(`/orders/${id}/items`, data)
      return response.data
    },
    onSuccess: (updatedOrder, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(variables.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders })
      // Invalidate the specific table's active order query
      if (updatedOrder?.table_id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tableActiveOrder(updatedOrder.table_id) })
      }
    },
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'pending' | 'completed' | 'cancelled' }) => {
      const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables })
    },
  })
}

export const useCompletePayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ orderId, amount }: { orderId: number; amount: number }) => {
      // Complete the order (this will also set table back to available)
      const response = await api.post<ApiResponse<any>>(`/payments`, {
        order_id: orderId,
        amount: amount,
        payment_method: 'cash',
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.revenue() })
    },
  })
}

// ============= PAYMENTS =============
export const usePayments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.payments,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Payment[]>>('/payments')
      return response.data
    },
  })
}

export const useRevenue = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.revenue(startDate, endDate),
    queryFn: async () => {
      const params: { start_date?: string; end_date?: string } = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      
      const response = await api.get<ApiResponse<RevenueReport>>('/payments/revenue', { params })
      return response.data
    },
  })
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreatePaymentRequest) => {
      const response = await api.post<ApiResponse<Payment>>('/payments', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.revenue() })
    },
  })
}
