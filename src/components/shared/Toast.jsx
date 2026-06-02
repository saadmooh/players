import { useEffect, useState } from 'react'

export default function Toast({ type = 'success', msg, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  const styles = {
    success: 'bg-green-600 text-white shadow-lg shadow-green-600/30',
    error: 'bg-red-600 text-white shadow-lg shadow-red-600/30',
    info: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-3 transition-all duration-300 ${styles[type]} ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      }`}
      style={{ transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(1rem)' }}
    >
      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
        {icons[type]}
      </span>
      {msg}
    </div>
  )
}
