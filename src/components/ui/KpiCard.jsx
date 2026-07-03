import { HugeiconsIcon } from '@hugeicons/react'

const KpiCard = ({ title, value, subtitle, icon, gradientClass, delay = 0 }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md ${gradientClass}`}
    style={{ 
      animationDelay: `${delay}ms`,
      backgroundClip: 'padding-box',
      border: '1px solid rgba(255, 255, 255, 0.15)'
    }}
  >
    {/* Professional Glass Layer */}
    <div className="absolute inset-0 bg-white/10 backdrop-blur-lg" />

    <div className="relative z-10 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5 min-w-0">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/70 truncate">
          {title}
        </h3>
        <p className="text-2xl font-black tracking-tight text-white truncate">
          {value}
        </p>
        {subtitle && (
          <p className="text-[10px] font-medium text-white/60 truncate">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Icon container scaled for mobile */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10">
        <HugeiconsIcon icon={icon} size={20} color="currentColor" strokeWidth={2} />
      </div>
    </div>
  </div>
)

export default KpiCard