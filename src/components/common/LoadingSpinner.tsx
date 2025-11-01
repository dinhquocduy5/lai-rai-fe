import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" />
        <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin relative z-10`} strokeWidth={2.5} />
      </div>
      {text && <p className="mt-4 text-sm text-gray-600 font-medium">{text}</p>}
    </div>
  )
}
