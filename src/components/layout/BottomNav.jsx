import { HugeiconsIcon } from '@hugeicons/react'
import { TABS } from '../../constants/tabs'

const BottomNav = ({ active, onChange }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(41,48,136,0.10)]">
    <div className="flex items-stretch h-16">
      {TABS.map((t) => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            id={`bottom-nav-${t.id}`}
            onClick={() => onChange(t.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200
              ${isActive ? 'text-primary' : 'text-gray-400'}`}
          >
            {isActive && <span className="bnav-pip" />}
            <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
              <HugeiconsIcon icon={t.icon} size={24} color="currentColor" strokeWidth={isActive ? 2 : 1.5} />
            </span>
            <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-primary' : 'text-gray-400'}`}>
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
    {/* iPhone home indicator spacer */}
    <div className="bg-white" style={{ height: 'env(safe-area-inset-bottom)' }} />
  </nav>
)

export default BottomNav
