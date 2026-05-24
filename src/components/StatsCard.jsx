import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * @param {string}  label
 * @param {string}  value
 * @param {string}  [change]      e.g. "+12.5%"
 * @param {boolean} [changeUp]    true = green, false = red
 * @param {React.ElementType} icon
 * @param {string}  iconBg        Tailwind bg class  e.g. "bg-primary-light"
 * @param {string}  iconColor     Tailwind text class e.g. "text-primary"
 * @param {string}  [subtext]     small line below value
 */
export default function StatsCard({
  label, value, change, changeUp, icon: Icon,
  iconBg = 'bg-primary-light', iconColor = 'text-primary', subtext
}) {
  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={20} className={iconColor} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold
                           ${changeUp ? 'text-success' : 'text-danger'}`}>
            {changeUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-dark tracking-tight leading-none mb-1">
        {value}
      </p>
      <p className="text-xs font-medium text-gray-mid">{label}</p>
      {subtext && (
        <p className="text-[11px] text-gray-mid mt-1 leading-tight">{subtext}</p>
      )}
    </div>
  )
}
