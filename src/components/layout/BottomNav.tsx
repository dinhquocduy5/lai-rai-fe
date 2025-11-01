import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Utensils, ShoppingBag, Receipt, CreditCard } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/tables', icon: Utensils, label: 'Bàn' },
  { to: '/menu', icon: ShoppingBag, label: 'Menu' },
  { to: '/orders', icon: Receipt, label: 'Order' },
  { to: '/payments', icon: CreditCard, label: 'Thu ngân' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl backdrop-blur-lg bg-white/95">
      <div className="flex justify-around items-center px-2 py-2 safe-area-inset-bottom">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-primary-600 bg-primary-50 scale-105'
                  : 'text-gray-400 active:scale-95'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative transition-transform duration-300 ${
                  isActive ? 'scale-110 -translate-y-0.5' : ''
                }`}>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold mt-1 transition-all ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
