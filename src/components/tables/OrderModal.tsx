import { useState, useEffect } from 'react'
import { X, Plus, Minus, Search, ShoppingCart, Check, Trash2 } from 'lucide-react'
import { useMenuItemsByCategory, useCreateOrder, useUpdateOrderItems, useTableActiveOrder } from '@/lib/queries'
import { formatCurrency } from '@/lib/utils'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { Table, MenuItem } from '@/types'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  table: Table
}

interface CartItem {
  menu_item_id: number
  name: string
  price: number
  quantity: number
  note: string
}

export default function OrderModal({ isOpen, onClose, table }: OrderModalProps) {
  const { data: menuByCategory, isLoading: menuLoading } = useMenuItemsByCategory()
  const { data: activeOrder, isLoading: orderLoading } = useTableActiveOrder(table.id)
  const createOrder = useCreateOrder()
  const updateOrderItems = useUpdateOrderItems()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Initialize cart from existing order
  useEffect(() => {
    if (activeOrder?.order?.id && isOpen) {
      const existingCart = activeOrder.items.map(item => ({
        menu_item_id: item.menu_item_id,
        name: item.menu_item?.name || '',
        price: item.price_at_order_time,
        quantity: item.quantity,
        note: item.note || '',
      }))
      setCart(existingCart)
    } else if (!isOpen) {
      // Reset cart when modal closes
      setCart([])
      setSearchTerm('')
      setSelectedCategory('')
    }
  }, [activeOrder, isOpen])

  if (!isOpen) return null

  const categories = Object.keys(menuByCategory || {})
  const currentCategory = selectedCategory || categories[0] || ''
  const menuItems = menuByCategory?.[currentCategory] || []

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(c => c.menu_item_id === item.id)
    if (existingItem) {
      setCart(cart.map(c =>
        c.menu_item_id === item.id
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ))
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        note: '',
      }])
    }
  }

  const updateQuantity = (menuItemId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.menu_item_id === menuItemId) {
        const newQuantity = item.quantity + delta
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const updateNote = (menuItemId: number, note: string) => {
    setCart(cart.map(item =>
      item.menu_item_id === menuItemId ? { ...item, note } : item
    ))
  }

  const removeFromCart = (menuItemId: number) => {
    setCart(cart.filter(item => item.menu_item_id !== menuItemId))
  }

  const handleSubmit = async () => {
    if (cart.length === 0) return

    const orderData = {
      table_id: table.id,
      items: cart.map(item => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        note: item.note || undefined,
      })),
    }

    try {
      const existingOrderId = activeOrder?.order?.id
      
      if (existingOrderId) {
        // Update existing order
        console.log('Updating order:', existingOrderId, orderData.items)
        await updateOrderItems.mutateAsync({ 
          id: existingOrderId, 
          data: { items: orderData.items } 
        })
      } else {
        // Create new order
        console.log('Creating new order:', orderData)
        await createOrder.mutateAsync(orderData)
      }
      onClose()
      // Cart will be reset by useEffect when modal closes
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Có lỗi xảy ra khi xử lý order. Vui lòng thử lại!')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="flex h-full flex-col">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative z-10 flex h-full flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-4 text-white">
            <div>
              <h3 className="text-xl font-bold">{table.name}</h3>
              <p className="text-sm text-primary-50">
                {orderLoading ? 'Đang kiểm tra...' : activeOrder?.order ? 'Chỉnh sửa order' : 'Tạo order mới'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-white/20 p-2 backdrop-blur-sm transition-all active:scale-95"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {menuLoading || orderLoading ? (
            <LoadingSpinner text="Đang tải menu..." />
          ) : (
            <>
              {/* Search */}
              <div className="border-b border-gray-200 bg-white p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm món ăn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-4 py-3 custom-scrollbar">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                      currentCategory === category
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 active:scale-95'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Main Content - Split View */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Menu Items Section */}
                <div className={`overflow-y-auto custom-scrollbar bg-gray-50 p-4 ${cart.length > 0 ? 'flex-1' : 'flex-1'}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700">CHỌN MÓN</h3>
                    <span className="text-xs text-gray-500">{filteredItems.length} món</span>
                  </div>
                  <div className="space-y-2">
                    {filteredItems.map((item) => {
                      const cartItem = cart.find(c => c.menu_item_id === item.id)
                      const quantity = cartItem?.quantity || 0

                      return (
                        <div
                          key={item.id}
                          className={`card ${quantity > 0 ? 'ring-2 ring-primary-500 shadow-md' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                              <p className="text-sm font-bold text-primary-600">
                                {formatCurrency(item.price)}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {quantity > 0 ? (
                                <>
                                  <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="rounded-xl bg-red-500 p-2.5 text-white shadow-lg"
                                  >
                                    <Minus className="h-5 w-5" strokeWidth={2.5} />
                                  </button>
                                  <span className="w-10 text-center font-bold text-lg text-gray-900">{quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="rounded-xl bg-green-500 p-2.5 text-white shadow-lg"
                                  >
                                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    disabled
                                    className="rounded-xl bg-gray-200 p-2.5 text-gray-400 shadow-sm cursor-not-allowed"
                                  >
                                    <Minus className="h-5 w-5" strokeWidth={2.5} />
                                  </button>
                                  <span className="w-10 text-center font-bold text-lg text-gray-900">0</span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="rounded-xl bg-primary-500 p-2.5 text-white shadow-lg"
                                  >
                                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Cart Section - Collapsible */}
                {cart.length > 0 && (
                  <div className="border-t-4 border-primary-500 bg-white shadow-2xl">
                    {/* Cart Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-orange-500 px-4 py-3 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
                          <h3 className="font-bold">GIỎ HÀNG TẠM</h3>
                        </div>
                        <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold">
                          {totalItems} món
                        </span>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="max-h-[35vh] overflow-y-auto custom-scrollbar">
                      {cart.map((item) => (
                        <div key={item.menu_item_id} className="border-b border-gray-100 p-4 last:border-b-0 bg-gradient-to-r from-white to-gray-50">
                          <div className="flex items-start gap-3">
                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-bold text-gray-900 truncate flex-1">{item.name}</h4>
                                <button
                                  onClick={() => removeFromCart(item.menu_item_id)}
                                  className="rounded-lg bg-red-500 p-1.5 text-white flex-shrink-0 shadow-md"
                                  title="Xóa món"
                                >
                                  <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 mb-2">
                                <button
                                  onClick={() => updateQuantity(item.menu_item_id, -1)}
                                  className="rounded-lg bg-red-100 p-1.5 text-red-600"
                                >
                                  <Minus className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                                <span className="text-base font-bold text-gray-900 w-12 text-center bg-gray-100 rounded-lg py-1">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.menu_item_id, 1)}
                                  className="rounded-lg bg-green-100 p-1.5 text-green-600"
                                >
                                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                                <span className="text-sm text-gray-600 ml-2">
                                  × {formatCurrency(item.price)}
                                </span>
                                <span className="text-base font-bold text-primary-600 ml-auto">
                                  = {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>

                              {/* Note Input */}
                              <input
                                type="text"
                                placeholder="💬 Ghi chú (VD: Không hành, ít đường...)"
                                value={item.note}
                                onChange={(e) => updateNote(item.menu_item_id, e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total & Submit - Sticky Bottom */}
                    <div className="bg-gradient-to-r from-primary-600 to-orange-600 p-4 text-white shadow-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-white/80 font-medium mb-1">TỔNG CỘNG</p>
                          <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="text-right">
                          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                            <p className="text-2xl font-bold">{totalItems}</p>
                            <p className="text-xs text-white/80">món</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={createOrder.isPending || updateOrderItems.isPending || orderLoading}
                        className="btn w-full bg-white text-primary-600 hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2 py-4 font-bold shadow-xl text-base"
                      >
                        <Check className="h-6 w-6" strokeWidth={2.5} />
                        {activeOrder?.order ? 'CẬP NHẬT ORDER' : 'XÁC NHẬN ORDER'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}