import { HugeiconsIcon } from '@hugeicons/react'
import { TABS } from '../../constants/tabs'

const TopNav = ({ active, onChange }) => (
  <header className="hidden md:flex sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg border-b border-primary/10 shadow-sm">
    <div className="max-w-5xl mx-auto w-full flex items-center px-6 h-16 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center text-white font-black text-sm">
          OM
        </div>
        <span className="font-black text-primary text-lg tracking-tight">OMG Temple</span>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`top-nav-${t.id}`}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200
              ${active === t.id
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:bg-primary/8 hover:text-primary'
              }`}
          >
            <HugeiconsIcon icon={t.icon} size={18} color="currentColor" strokeWidth={2} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  </header>
)

export default TopNav
