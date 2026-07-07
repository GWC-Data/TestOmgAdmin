import { useState } from 'react'

const Dialog = ({ isOpen, type = 'confirm', title, message, defaultValue = '', onConfirm, onClose }) => {
  const [val, setVal] = useState(defaultValue)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-extrabold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm font-medium text-slate-500 mb-4">{message}</p>
        
        {type === 'prompt' && (
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary/20 focus:bg-white mb-4"
          />
        )}
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm?.(val)
              onClose?.()
            }}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark shadow-md transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dialog
