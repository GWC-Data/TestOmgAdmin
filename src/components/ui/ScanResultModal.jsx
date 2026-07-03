import { HugeiconsIcon } from '@hugeicons/react'
import { Tick01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'

const ScanResultModal = ({ result, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
      
      {/* Visual Status Indicator */}
      <div className={`h-1.5 w-full shrink-0 ${result.valid ? 'bg-primary' : 'bg-red-500'}`} />

      {/* Header close trigger */}
      <div className="flex justify-end px-4 pt-3 shrink-0">
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Scrollable details container */}
      <div className="px-6 pb-6 overflow-y-auto no-scrollbar flex-1 min-h-0">
        {/* Centered Icon */}
        <div className={`mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center ${result.valid ? 'bg-primary/10' : 'bg-red-500/10'}`}>
          <HugeiconsIcon 
            icon={result.valid ? Tick01Icon : Cancel01Icon} 
            size={28} 
            color={result.valid ? '#293088' : '#ef4444'} 
            strokeWidth={2.5} 
          />
        </div>

        {/* Title and Message */}
        <h2 className="text-lg font-extrabold text-gray-900 text-center mb-1">
          {result.valid 
            ? 'Verified' 
            : (result.message === 'already verified' ? 'Already Verified' : 'Verification Failed')}
        </h2>
        <p className="text-xs text-gray-500 text-center mb-4 px-2 leading-relaxed">
          {result.message}
        </p>

        {/* Details Section */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100 space-y-3">
          {Object.entries(result.details).map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{k}</span>
              <span className="text-xs font-bold text-gray-700 leading-normal">
                {v}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-xs hover:bg-gray-50 active:scale-[0.98] transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={result.valid ? onConfirm : undefined}
            disabled={!result.valid && result.message === 'already verified'}
            className={`flex-[2] py-3 rounded-xl font-bold text-xs text-white shadow-lg shadow-black/5 transition-transform hover:scale-[1.02] active:scale-[0.98]
              ${result.valid ? 'bg-primary' : 'bg-red-500'} ${(!result.valid && result.message === 'already verified') ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {result.valid 
              ? 'Verify' 
              : (result.message === 'already verified' ? 'Already Verified' : 'Try Again')}
          </button>
        </div>
      </div>
    </div>
  </div>
)

export default ScanResultModal