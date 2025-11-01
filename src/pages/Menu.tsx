import { useMenuItemsByCategory } from '@/lib/queries'
import { formatCurrency } from '@/lib/utils'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { Search, Coffee, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'

export default function Menu() {
  const { data: menuByCategory, isLoading, error, refetch } = useMenuItemsByCategory()
  const [searchTerm, setSearchTerm] = useState('')

  if (isLoading) {
    return <LoadingSpinner text="Đang tải menu..." />
  }

  if (error) {
    return <ErrorMessage message="Không thể tải menu" retry={() => refetch()} />
  }

  const categories = Object.entries(menuByCategory || {})

  // Filter items based on search
  const filteredCategories = categories.map(([category, items]) => [
    category,
    items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  ]).filter(([, items]) => (items as any[]).length > 0)

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
        <p className="text-sm text-gray-600">
          {categories.reduce((sum, [, items]) => sum + items.length, 0)} món
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm món ăn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Menu Categories */}
      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Không tìm thấy món nào</p>
          </div>
        ) : (
          filteredCategories.map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="card flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${
                        item.type === 'drink' ? 'bg-blue-100' : 'bg-orange-100'
                      } rounded-lg p-2`}>
                        {item.type === 'drink' ? (
                          <Coffee className={`w-5 h-5 ${
                            item.type === 'drink' ? 'text-blue-600' : 'text-orange-600'
                          }`} />
                        ) : (
                          <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-500">
                          {item.type === 'drink' ? 'Đồ uống' : 'Món ăn'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
