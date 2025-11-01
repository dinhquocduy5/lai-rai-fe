import { usePayments, useRevenue } from '@/lib/queries'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { CreditCard, TrendingUp, Receipt, Calendar, Download } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { exportPaymentsToExcel } from '@/lib/excel-export'

export default function Payments() {
  const { data: payments, isLoading, error, refetch } = usePayments()
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  })

  const { data: revenue } = useRevenue(dateRange.start, dateRange.end)

  if (isLoading) {
    return <LoadingSpinner text="Đang tải dữ liệu thanh toán..." />
  }

  if (error) {
    return <ErrorMessage message="Không thể tải dữ liệu thanh toán" retry={() => refetch()} />
  }

  const todayPayments = payments?.filter(p => 
    format(new Date(p.paid_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ) || []

  const handleExportExcel = () => {
    if (!payments || payments.length === 0) return
    if (!revenue) return
    exportPaymentsToExcel(payments, dateRange.start, dateRange.end, revenue)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Thu ngân</h2>
        <p className="text-sm text-gray-600">
          Quản lý thanh toán và doanh thu
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrency(revenue?.total_revenue || 0)}</p>
          <p className="text-xs opacity-80 mt-1">Doanh thu hôm nay</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <Receipt className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{revenue?.total_orders || 0}</p>
          <p className="text-xs opacity-80 mt-1">Đơn hôm nay</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Lọc theo ngày</h3>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={!payments || payments.length === 0}
            className="btn btn-primary text-sm px-3 py-1.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">
          Thanh toán hôm nay ({todayPayments.length})
        </h3>

        {todayPayments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Chưa có thanh toán nào hôm nay</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      Đơn hàng #{payment.order_id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(payment.paid_at)}
                  </p>
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {payment.payment_method === 'cash' ? 'Tiền mặt' : 
                     payment.payment_method === 'card' ? 'Thẻ' : 'Chuyển khoản'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Payments */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">
          Tất cả thanh toán ({payments?.length || 0})
        </h3>

        {!payments || payments.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Chưa có thanh toán nào</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {payments.slice(0, 20).map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Đơn hàng #{payment.order_id}
                  </span>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(payment.paid_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
