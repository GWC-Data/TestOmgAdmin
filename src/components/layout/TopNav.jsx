import { HugeiconsIcon } from '@hugeicons/react'
import { TABS } from '../../constants/tabs'

const TopNav = ({ active, onChange }) => (
  <header className="hidden md:flex sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg border-b border-primary/10 shadow-sm">
    <div className="max-w-7xl mx-auto w-full flex items-center px-4 sm:px-6 lg:px-8 h-16 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-8">
        <img 
          src="https://omgofficial.com/omg-logo.png" 
          alt="OMG Logo" 
          className="h-8 w-auto object-contain" 
        />
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
