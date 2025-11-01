import { useTables, useOrders, useRevenue } from '@/lib/queries'
import { formatCurrency } from '@/lib/utils'
import { Utensils, Receipt, TrendingUp, Users, Clock, DollarSign } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { format } from 'date-fns'

export default function Dashboard() {
  const { data: tables, isLoading: tablesLoading, error: tablesError } = useTables()
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useOrders()
  const { data: revenue, isLoading: revenueLoading } = useRevenue(
    format(new Date(), 'yyyy-MM-dd'),
    format(new Date(), 'yyyy-MM-dd')
  )

  if (tablesLoading || ordersLoading || revenueLoading) {
    return <LoadingSpinner text="Đang tải thông tin..." />
  }

  if (tablesError || ordersError) {
    return <ErrorMessage message="Không thể tải dữ liệu. Vui lòng thử lại." />
  }

  const availableTables = tables?.filter(t => t.status === 'available').length || 0
  const occupiedTables = tables?.filter(t => t.status === 'occupied').length || 0
  const activeOrders = orders?.filter(o => o.status === 'pending').length || 0
  const todayRevenue = revenue?.total_revenue || 0
  const todayOrders = revenue?.total_orders || 0

  const stats = [
    {
      icon: Utensils,
      label: 'Bàn trống',
      value: availableTables,
      total: tables?.length || 0,
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Users,
      label: 'Bàn có khách',
      value: occupiedTables,
      total: tables?.length || 0,
      gradient: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      icon: Receipt,
      label: 'Order đang chờ',
      value: activeOrders,
      gradient: 'from-yellow-500 to-orange-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      icon: DollarSign,
      label: 'Doanh thu hôm nay',
      value: formatCurrency(todayRevenue),
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: TrendingUp,
      label: 'Đơn hôm nay',
      value: todayOrders,
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ]

  const recentOrders = orders?.filter(o => o.status === 'pending').slice(0, 5) || []

  return (
    <div className="p-5 space-y-5 pb-24">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/30">
        <h2 className="text-2xl font-bold mb-2">Xin chào! 👋</h2>
        <p className="text-primary-50 font-medium">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card bg-gradient-to-br ${stat.gradient} shadow-lg`}>
            <div className={`${stat.iconBg} rounded-2xl w-12 h-12 flex items-center justify-center mb-3 bg-white/20 backdrop-blur-sm`}>
              <stat.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <p className="text-2xl font-bold">
              {typeof stat.value === 'number' && !stat.label.includes('Doanh thu') 
                ? stat.value 
                : stat.value}
              {stat.total && <span className="text-sm opacity-80">/{stat.total}</span>}
            </p>
            <p className="text-xs opacity-90 mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary-100 rounded-xl p-2">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Order đang chờ</h3>
          </div>
          <span className="badge badge-warning">{recentOrders.length}</span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Chưa có order nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 hover:border-primary-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 rounded-xl p-2.5">
                    <Utensils className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.table?.name || `Bàn #${order.table_id}`}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {format(new Date(order.check_in), 'HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600 text-lg">
                    {formatCurrency(order.total_amount || 0)}
                  </p>
                  <span className="badge badge-warning text-[10px] mt-1">Đang phục vụ</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary-100 rounded-xl p-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Thao tác nhanh</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a href="/tables" className="btn btn-primary flex items-center justify-center gap-2 text-sm py-3">
            <Utensils className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-semibold">Quản lý bàn</span>
          </a>
          <a href="/orders" className="btn btn-secondary flex items-center justify-center gap-2 text-sm py-3">
            <Receipt className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-semibold">Tạo order</span>
          </a>
          <a href="/menu" className="btn btn-secondary flex items-center justify-center gap-2 text-sm py-3">
            <DollarSign className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-semibold">Xem menu</span>
          </a>
          <a href="/payments" className="btn btn-success flex items-center justify-center gap-2 text-sm py-3">
            <DollarSign className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-semibold">Thu ngân</span>
          </a>
        </div>
      </div>
    </div>
  )
}
