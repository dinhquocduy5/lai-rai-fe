import { useState, useEffect } from 'react'

export default function Header() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-primary-500 via-primary-600 to-orange-500 text-white shadow-xl">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                <span className="text-2xl">🍜</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Lai Rai</h1>
                <p className="text-xs text-primary-50 font-medium">Restaurant Manager</p>
              </div>
            </div>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
            <p className="text-base font-bold tabular-nums">
              {time.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-[10px] text-primary-50 font-medium">
              {time.toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
