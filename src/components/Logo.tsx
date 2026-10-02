import destinationIcon from '../assets/destination.png'

interface LogoProps {
  compact?: boolean
  white?: boolean
}

export function Logo({ compact = false, white = false }: LogoProps) {
  const textColor = white ? 'text-white' : 'text-slate-900'
  const accentText = white ? 'text-slate-300' : 'text-slate-500'

  return (
    <div className="flex items-center gap-3">
      <img
        src={destinationIcon}
        alt="VisitCebu destination icon"
        className={[
          'block h-auto object-contain',
          compact ? 'w-[32px]' : 'w-[36px] md:w-[42px]',
        ].join(' ')}
      />

      <div className="flex flex-col justify-center leading-none">
        <div className={['font-semibold tracking-tight', compact ? 'text-base' : 'text-lg', textColor].join(' ')}>
          VisitCebu
        </div>
        <div className={['text-[10px] uppercase tracking-[0.15em]', accentText].join(' ')}>
          DISCOVER MORE
        </div>
      </div>
    </div>
  )
}
