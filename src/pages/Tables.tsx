import { useTables, useUpdateTableStatus } from '@/lib/queries'
import { getTableStatusColor, getTableStatusText } from '@/lib/utils'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import OrderModal from '@/components/tables/OrderModal'
import { Utensils, Plus, Filter, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import type { TableStatus, Table } from '@/types'

export default function Tables() {
  const { data: tables, isLoading, error, refetch } = useTables()
  const updateStatus = useUpdateTableStatus()
  const [filter, setFilter] = useState<'all' | TableStatus>('all')
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  if (isLoading) {
    return <LoadingSpinner text="Đang tải danh sách bàn..." />
  }

  if (error) {
    return <ErrorMessage message="Không thể tải danh sách bàn" retry={() => refetch()} />
  }

  const filteredTables = tables?.filter(table => 
    filter === 'all' ? true : table.status === filter
  ) || []

  const availableCount = tables?.filter(t => t.status === 'available').length || 0
  const occupiedCount = tables?.filter(t => t.status === 'occupied').length || 0

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
  }

  const handleCloseModal = () => {
    setSelectedTable(null)
  }

  return (
    <div className="p-5 space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý bàn</h2>
          <p className="text-sm text-gray-600 font-medium">
            {availableCount} trống · {occupiedCount} có khách
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-semibold">Thêm bàn</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`btn text-sm whitespace-nowrap ${
            filter === 'all' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <Filter className="w-4 h-4 mr-1" />
          Tất cả ({tables?.length || 0})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`btn text-sm whitespace-nowrap ${
            filter === 'available' ? 'btn-success' : 'btn-secondary'
          }`}
        >
          Bàn trống ({availableCount})
        </button>
        <button
          onClick={() => setFilter('occupied')}
          className={`btn text-sm whitespace-nowrap ${
            filter === 'occupied' ? 'btn-danger' : 'btn-secondary'
          }`}
        >
          Có khách ({occupiedCount})
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredTables.map(table => (
          <div
            key={table.id}
            onClick={() => handleTableClick(table)}
            className="card relative overflow-hidden hover:shadow-xl transition-all cursor-pointer active:scale-95"
          >
            {/* Status indicator */}
            <div className={`absolute top-0 right-0 w-20 h-20 ${getTableStatusColor(table.status)} opacity-10 rounded-bl-[3rem]`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`${getTableStatusColor(table.status)} rounded-2xl p-3 shadow-lg`}>
                  {table.status === 'occupied' ? (
                    <ShoppingCart className="w-6 h-6 text-white" strokeWidth={2.5} />
                  ) : (
                    <Utensils className="w-6 h-6 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  table.status === 'available' 
                    ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20' 
                    : 'bg-red-100 text-red-700 ring-1 ring-red-600/20'
                }`}>
                  {getTableStatusText(table.status)}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{table.name}</h3>
              <p className="text-xs text-gray-500 font-medium">
                {table.status === 'available' 
                  ? 'Nhấn để tạo order' 
                  : 'Nhấn để xem/chỉnh sửa order'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Không tìm thấy bàn nào</p>
        </div>
      )}

      {/* Order Modal */}
      {selectedTable && (
        <OrderModal
          isOpen={!!selectedTable}
          onClose={handleCloseModal}
          table={selectedTable}
        />
      )}
    </div>
  )
}
