import { useEffect } from 'react'

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!message) return null

  return (
    <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-pulse ${
      type === 'error' 
        ? 'bg-rose-50 border-rose-200 text-rose-700' 
        : 'bg-green-50 border-green-200 text-green-700'
    }`}>
      <span>{type === 'error' ? '❌' : '✅'}</span>
      <span>{message}</span>
    </div>
  )
}

export default Toast
