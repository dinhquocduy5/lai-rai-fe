import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'

export default function Layout() {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
