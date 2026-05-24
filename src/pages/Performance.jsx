import { useState, useEffect } from 'react'
import { Activity, CheckCircle2, Clock, XCircle, Zap, Star,
         TrendingUp, TrendingDown, AlertTriangle, ShieldAlert,
         RefreshCw, Info } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis,
         ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
         CartesianGrid, Tooltip } from 'recharts'
import { getPerformanceMetrics } from '../services/vendorApi'

/* ── Fallback ── */
const FALLBACK = {
  acceptance_rate:    92,
  on_time_delivery:   88,
  failure_rate:        4,
  response_speed:     95,
  customer_satisfaction: 4.6,
  total_orders:       48,
  completed_orders:   41,
  failed_orders:       2,
  avg_response_time:  '4.2 min',
  standing:           'good',  // good | warning | probation | suspended
}

const HISTORY = [
  { week: 'W1', acceptance: 88, delivery: 82, satisfaction: 85 },
  { week: 'W2', acceptance: 90, delivery: 85, satisfaction: 88 },
  { week: 'W3', acceptance: 89, delivery: 87, satisfaction: 87 },
  { week: 'W4', acceptance: 92, delivery: 88, satisfaction: 91 },
  { week: 'W5', acceptance: 93, delivery: 90, satisfaction: 92 },
  { week: 'W6', acceptance: 92, delivery: 88, satisfaction: 92 },
]

const STANDING_MAP = {
  good:       { label: 'Good Standing',         color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: CheckCircle2, desc: 'Your account is in good standing. Keep up the great work!' },
  warning:    { label: 'Warning Issued',         color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', icon: AlertTriangle,desc: 'You have received a warning. Please improve your metrics.' },
  probation:  { label: 'On Probation',           color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/20',  icon: ShieldAlert,  desc: 'Account on probation. Significant improvement required.' },
  suspended:  { label: 'Temporarily Suspended',  color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/20',  icon: XCircle,      desc: 'Account suspended. Contact TRID support immediately.' },
}

/* ── Metric circle gauge ── */
function Gauge({ value, max = 100, color, size = 96 }) {
  const pct    = Math.min(100, (value / max) * 100)
  const r      = (size / 2) - 8
  const circ   = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F5F5F7" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  )
}

/* ── Single metric card ── */
function MetricCard({ label, value, max, unit, color, hexColor, icon: Icon, threshold, desc }) {
  const numVal = parseFloat(value)
  const isGood = threshold ? numVal >= threshold : true

  return (
    <div className="card card-hover flex items-center gap-4">
      <div className="relative shrink-0">
        <Gauge value={numVal} max={max} color={hexColor} size={80} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={20} style={{ color: hexColor }} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <p className="text-xs text-gray-mid font-medium">{label}</p>
          <span className={`badge ${isGood ? 'badge-success' : 'badge-danger'} text-[10px]`}>
            {isGood ? '✓ Good' : '⚠ Low'}
          </span>
        </div>
        <p className="text-2xl font-black text-gray-dark mt-0.5 tracking-tight">
          {value}{unit}
        </p>
        <p className="text-[11px] text-gray-mid mt-0.5 leading-tight">{desc}</p>
      </div>
    </div>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-dark text-white text-xs rounded-xl px-3 py-2">
      <p className="text-gray-mid mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.stroke }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  )
}

export default function Performance() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await getPerformanceMetrics()
      setData(res.data)
    } catch { setData(FALLBACK) }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const d       = data || FALLBACK
  const standing= STANDING_MAP[d.standing] || STANDING_MAP['good']
  const StIcon  = standing.icon

  const radarData = [
    { metric: 'Acceptance',   value: d.acceptance_rate },
    { metric: 'On-Time',      value: d.on_time_delivery },
    { metric: 'Response',     value: d.response_speed },
    { metric: 'Satisfaction', value: (d.customer_satisfaction / 5) * 100 },
    { metric: 'Quality',      value: Math.max(0, 100 - (d.failure_rate * 10)) },
  ]

  if (loading) return (
    <div className="p-6 space-y-5 animate-pulse max-w-5xl mx-auto">
      <div className="h-8 w-56 bg-gray-border rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="h-28 bg-gray-border rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-dark tracking-tight">Performance</h1>
          <p className="text-sm text-gray-mid mt-0.5">Your vendor scorecard</p>
        </div>
        <button onClick={fetch} className="btn btn-outline"><RefreshCw size={15} /> Refresh</button>
      </div>

      {/* Standing banner */}
      <div className={`flex items-center gap-4 ${standing.bg} border ${standing.border} rounded-xl px-5 py-4`}>
        <div className={`w-10 h-10 rounded-xl ${standing.bg} border ${standing.border}
                         flex items-center justify-center shrink-0`}>
          <StIcon size={20} className={standing.color} />
        </div>
        <div className="flex-1">
          <p className={`font-bold ${standing.color}`}>{standing.label}</p>
          <p className="text-sm text-gray-mid mt-0.5">{standing.desc}</p>
        </div>
        {/* Suspension ladder */}
        <div className="hidden md:flex items-center gap-1.5">
          {['good','warning','probation','suspended'].map((s, i) => {
            const current = ['good','warning','probation','suspended'].indexOf(d.standing)
            return (
              <div key={s} className={`h-2 w-8 rounded-full transition-all
                ${i <= current
                  ? i === 0 ? 'bg-success' : i === 1 ? 'bg-warning' : 'bg-danger'
                  : 'bg-gray-border'}`}
              />
            )
          })}
          <span className="text-xs text-gray-mid ml-1">Account health</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard label="Acceptance Rate"   value={d.acceptance_rate}   max={100} unit="%" hexColor="#34C759" color="success" icon={CheckCircle2} threshold={85} desc="Orders accepted out of total assigned" />
        <MetricCard label="On-Time Delivery"  value={d.on_time_delivery}  max={100} unit="%" hexColor="#0071E3" color="info"    icon={Clock}        threshold={80} desc="Orders delivered within deadline"     />
        <MetricCard label="Response Speed"    value={d.response_speed}    max={100} unit="%" hexColor="#FF9500" color="primary"  icon={Zap}          threshold={75} desc={`Avg response: ${d.avg_response_time}`} />
        <MetricCard label="Customer Rating"   value={d.customer_satisfaction} max={5} unit="/5" hexColor="#FF9F0A" color="warning" icon={Star}      threshold={4}  desc="Average customer satisfaction score" />
      </div>

      {/* Failure rate + summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders',     val: d.total_orders,     color: 'text-gray-dark', bg: 'bg-gray-light',   icon: Activity   },
          { label: 'Completed',        val: d.completed_orders, color: 'text-success',   bg: 'bg-success/10',   icon: CheckCircle2},
          { label: 'Failed / Rejected',val: d.failed_orders,    color: 'text-danger',    bg: 'bg-danger/10',    icon: XCircle    },
        ].map(({ label, val, color, bg, icon: Icon }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className={`text-2xl font-black ${color}`}>{val}</p>
              <p className="text-xs text-gray-mid font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Radar + trend chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-bold text-gray-dark mb-4">Performance Radar</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <PolarGrid stroke="#E5E5EA" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#86868B' }} />
              <Radar name="Score" dataKey="value" stroke="#FF9500" fill="#FF9500" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-dark mb-1">6-Week Trend</h2>
          <p className="text-xs text-gray-mid mb-4">Key metrics week over week</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={HISTORY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="accGrad"  x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34C759" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="delGrad"  x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071E3" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0071E3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} />
              <YAxis domain={[70,100]} tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="acceptance"   name="Acceptance"   stroke="#34C759" fill="url(#accGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="delivery"     name="On-Time"      stroke="#0071E3" fill="url(#delGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex gap-4 mt-2">
            {[['#34C759','Acceptance Rate'],['#0071E3','On-Time Delivery']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-gray-mid">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suspension logic info */}
      <div className="card bg-gray-light border-0">
        <p className="text-xs font-bold text-gray-mid uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Info size={12} /> Vendor Standing Policy
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { stage: '1. Warning',             color: 'text-warning', bg: 'bg-warning/10', desc: 'Metrics drop below threshold. Improvement expected.' },
            { stage: '2. Probation',           color: 'text-orange-500', bg: 'bg-orange-500/10', desc: 'Continued issues. Close monitoring by TRID ops.' },
            { stage: '3. Temp Suspension',     color: 'text-danger',  bg: 'bg-danger/10',  desc: 'Account paused. No new orders until resolved.' },
            { stage: '4. Permanent Removal',   color: 'text-danger',  bg: 'bg-danger/15',  desc: 'Persistent violations. Removed from platform.' },
          ].map(({ stage, color, bg, desc }) => (
            <div key={stage} className={`${bg} rounded-xl p-3`}>
              <p className={`text-xs font-bold ${color} mb-1`}>{stage}</p>
              <p className="text-[11px] text-gray-mid leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
