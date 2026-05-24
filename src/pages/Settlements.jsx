import { useState, useEffect } from 'react'
import {
  Wallet, TrendingUp, Clock, CheckCircle2, AlertCircle,
  RefreshCw, Download, ChevronDown, ChevronUp, Info,
  IndianRupee, ArrowUpRight, ShieldCheck, Calendar
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import StatsCard from '../components/StatsCard'
import { getSettlementSummary, getSettlements } from '../services/settlementApi'

/* ── Fallback data ── */
const FALLBACK_SUMMARY = {
  total_earned:     94200,
  pending_release:  18600,
  released_amount:  70800,
  tds_deducted:      4800,
  this_month:       21400,
  avg_per_order:     2350,
}

const FALLBACK_SETTLEMENTS = [
  { id: 1,  order_id: 'ORD-1031', gross: 3100,  tds: 310,  net: 2790,  status: 'released',  released_on: '22 May 2026', delivery_date: '20 May 2026', notes: '' },
  { id: 2,  order_id: 'ORD-1028', gross: 750,   tds: 75,   net: 675,   status: 'released',  released_on: '20 May 2026', delivery_date: '18 May 2026', notes: '' },
  { id: 3,  order_id: 'ORD-1035', gross: 980,   tds: 98,   net: 882,   status: 'pending',   released_on: null,          delivery_date: '24 May 2026', notes: 'Verification buffer: 2 days' },
  { id: 4,  order_id: 'ORD-1038', gross: 2400,  tds: 240,  net: 2160,  status: 'processing',released_on: null,          delivery_date: null,          notes: 'Awaiting delivery confirmation' },
  { id: 5,  order_id: 'ORD-1025', gross: 1650,  tds: 165,  net: 1485,  status: 'pending',   released_on: null,          delivery_date: '26 May 2026', notes: 'Verification buffer: 4 days' },
  { id: 6,  order_id: 'ORD-1020', gross: 4200,  tds: 420,  net: 3780,  status: 'released',  released_on: '19 May 2026', delivery_date: '18 May 2026', notes: '' },
  { id: 7,  order_id: 'ORD-1015', gross: 1200,  tds: 120,  net: 1080,  status: 'released',  released_on: '14 May 2026', delivery_date: '12 May 2026', notes: '' },
  { id: 8,  order_id: 'ORD-1009', gross: 5800,  tds: 580,  net: 5220,  status: 'released',  released_on: '08 May 2026', delivery_date: '06 May 2026', notes: '' },
]

const MONTHLY_DATA = [
  { month: 'Dec', amount: 8400  },
  { month: 'Jan', amount: 11200 },
  { month: 'Feb', amount: 9800  },
  { month: 'Mar', amount: 15600 },
  { month: 'Apr', amount: 13200 },
  { month: 'May', amount: 21400 },
]

const STATUS_MAP = {
  released:   { label: 'Released',   cls: 'badge-success', icon: CheckCircle2 },
  pending:    { label: 'Pending',     cls: 'badge-warning', icon: Clock        },
  processing: { label: 'Processing',  cls: 'badge-info',    icon: RefreshCw    },
  held:       { label: 'On Hold',     cls: 'badge-danger',  icon: AlertCircle  },
}

/* ── Custom tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-dark text-white text-xs rounded-xl px-3 py-2">
      <p className="text-gray-mid mb-0.5">{label}</p>
      <p className="font-bold">₹{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

/* ── Expandable settlement row ── */
function SettlementRow({ s }) {
  const [expanded, setExpanded] = useState(false)
  const { label, cls, icon: Icon } = STATUS_MAP[s.status] || STATUS_MAP['pending']
  const tdsRate = ((s.tds / s.gross) * 100).toFixed(0)

  return (
    <>
      <tr
        className="hover:bg-gray-light/60 cursor-pointer transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <td className="py-3.5 pl-4 pr-3">
          <span className="font-mono font-semibold text-sm text-info">{s.order_id}</span>
        </td>
        <td className="py-3.5 pr-3 text-sm font-bold text-gray-dark">
          ₹{s.gross.toLocaleString()}
        </td>
        <td className="py-3.5 pr-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-danger font-semibold">−₹{s.tds.toLocaleString()}</span>
            <span className="text-[10px] text-gray-mid bg-danger/8 px-1.5 py-0.5 rounded">{tdsRate}%</span>
          </div>
        </td>
        <td className="py-3.5 pr-3 text-sm font-bold text-success">
          ₹{s.net.toLocaleString()}
        </td>
        <td className="py-3.5 pr-3">
          <span className={`badge ${cls}`}>
            <Icon size={10} /> {label}
          </span>
        </td>
        <td className="py-3.5 pr-3 text-xs text-gray-mid">
          {s.released_on || s.delivery_date || '—'}
        </td>
        <td className="py-3.5 pr-4">
          {expanded
            ? <ChevronUp   size={15} className="text-gray-mid" />
            : <ChevronDown size={15} className="text-gray-mid" />}
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr className="bg-gray-light/50">
          <td colSpan={7} className="px-4 py-3">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-gray-mid mb-1 font-medium">Gross Payout</p>
                <p className="font-bold text-gray-dark">₹{s.gross.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-mid mb-1 font-medium">TDS Deducted ({tdsRate}%)</p>
                <p className="font-bold text-danger">−₹{s.tds.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-mid mb-1 font-medium">Net Settlement</p>
                <p className="font-bold text-success">₹{s.net.toLocaleString()}</p>
              </div>
              {s.delivery_date && (
                <div>
                  <p className="text-gray-mid mb-1 font-medium">Delivery Date</p>
                  <p className="font-semibold text-gray-dark">{s.delivery_date}</p>
                </div>
              )}
              {s.released_on && (
                <div>
                  <p className="text-gray-mid mb-1 font-medium">Released On</p>
                  <p className="font-semibold text-gray-dark">{s.released_on}</p>
                </div>
              )}
              {s.notes && (
                <div className="col-span-3">
                  <p className="text-gray-mid mb-1 font-medium flex items-center gap-1">
                    <Info size={11} /> Note
                  </p>
                  <p className="text-gray-dark">{s.notes}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ── Main Page ── */
export default function Settlements() {
  const [summary,     setSummary]     = useState(null)
  const [settlements, setSettlements] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('all')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [sRes, listRes] = await Promise.allSettled([
        getSettlementSummary(),
        getSettlements(),
      ])
      setSummary(    sRes.status    === 'fulfilled' ? sRes.value.data    : FALLBACK_SUMMARY)
      setSettlements(listRes.status === 'fulfilled'
        ? (Array.isArray(listRes.value.data) ? listRes.value.data : listRes.value.data?.results || FALLBACK_SETTLEMENTS)
        : FALLBACK_SETTLEMENTS)
    } catch {
      setSummary(FALLBACK_SUMMARY)
      setSettlements(FALLBACK_SETTLEMENTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = filter === 'all' ? settlements : settlements.filter(s => s.status === filter)

  const s = summary || FALLBACK_SUMMARY

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-dark tracking-tight">Settlements</h1>
          <p className="text-sm text-gray-mid mt-0.5">Payment history & TDS tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={fetchAll} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-border rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Earned"
            value={`₹${(s.total_earned / 1000).toFixed(1)}K`}
            icon={Wallet}
            iconBg="bg-success/10" iconColor="text-success"
            subtext="All time (net of TDS)"
          />
          <StatsCard
            label="Pending Release"
            value={`₹${(s.pending_release / 1000).toFixed(1)}K`}
            icon={Clock}
            iconBg="bg-warning/10" iconColor="text-warning"
            subtext="Held by TRID"
          />
          <StatsCard
            label="This Month"
            value={`₹${(s.this_month / 1000).toFixed(1)}K`}
            change="+18.3%"
            changeUp
            icon={TrendingUp}
            iconBg="bg-info/10" iconColor="text-info"
          />
          <StatsCard
            label="TDS Deducted"
            value={`₹${(s.tds_deducted / 1000).toFixed(1)}K`}
            icon={ShieldCheck}
            iconBg="bg-danger/10" iconColor="text-danger"
            subtext="For tax compliance"
          />
        </div>
      )}

      {/* Revenue chart + How settlement works */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="card lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-bold text-gray-dark">Monthly Settlements</h2>
            <p className="text-xs text-gray-mid mt-0.5">Net amount received after TDS</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="settlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#34C759" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#34C759" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false}
                     tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#34C759" strokeWidth={2.5}
                    fill="url(#settlGrad)" dot={false} activeDot={{ r: 5, fill: '#34C759' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* How it works */}
        <div className="card bg-gray-light border-0">
          <p className="text-xs font-bold text-gray-mid uppercase tracking-wider mb-4">
            How Settlement Works
          </p>
          <div className="space-y-4">
            {[
              { icon: IndianRupee, color: 'text-info',    bg: 'bg-info/10',    title: 'Customer Pays TRID', desc: 'Full payment collected by TRID at order time.' },
              { icon: Clock,       color: 'text-warning',  bg: 'bg-warning/10', title: 'TRID Holds Payment', desc: 'Held until successful delivery confirmed.' },
              { icon: CheckCircle2,color: 'text-success',  bg: 'bg-success/10', title: 'Settlement Released', desc: 'Released after verification buffer (typically 2–3 days).' },
              { icon: ShieldCheck, color: 'text-danger',   bg: 'bg-danger/10',  title: 'TDS Deducted',       desc: '10% TDS deducted as per tax compliance.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={14} className={color} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-dark">{title}</p>
                  <p className="text-[11px] text-gray-mid leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settlement history table */}
      <div className="card p-0 overflow-hidden">
        {/* Table header with filters */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-border">
          <h2 className="font-bold text-gray-dark">Settlement History</h2>
          <div className="flex gap-1.5 bg-gray-light p-1 rounded-xl">
            {['all', 'released', 'pending', 'processing'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition-all
                  ${filter === f ? 'bg-white text-gray-dark shadow-card' : 'text-gray-mid hover:text-gray-dark'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-light rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-mid">
            <Wallet size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No settlements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-light/60 border-b border-gray-border">
                <tr>
                  {['Order ID', 'Gross Payout', 'TDS Deducted', 'Net Amount', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-mid
                                           uppercase tracking-wider py-3 pr-3 first:pl-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border">
                {filtered.map(s => <SettlementRow key={s.id} s={s} />)}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer summary */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-border bg-gray-light/40
                          flex items-center justify-between text-sm">
            <span className="text-gray-mid">{filtered.length} records</span>
            <div className="flex gap-6">
              <span className="text-gray-mid">
                Total Gross: <strong className="text-gray-dark">
                  ₹{filtered.reduce((a, s) => a + s.gross, 0).toLocaleString()}
                </strong>
              </span>
              <span className="text-gray-mid">
                Total TDS: <strong className="text-danger">
                  −₹{filtered.reduce((a, s) => a + s.tds, 0).toLocaleString()}
                </strong>
              </span>
              <span className="text-gray-mid">
                Net Received: <strong className="text-success">
                  ₹{filtered.filter(s => s.status === 'released').reduce((a, s) => a + s.net, 0).toLocaleString()}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
