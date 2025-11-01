import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  retry?: () => void
}

export default function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="bg-red-50 rounded-full p-3 mb-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-sm text-red-600 text-center mb-3">{message}</p>
      {retry && (
        <button onClick={retry} className="btn btn-primary text-sm">
          Thử lại
        </button>
      )}
    </div>
  )
}
