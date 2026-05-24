import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Printer, Wallet, Activity,
  ArrowRight, RefreshCw, Clock, CheckCircle2, XCircle, TrendingUp
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { useAuth }               from '../context/AuthContext'
import StatsCard                  from '../components/StatsCard'
import OrderStatusBadge           from '../components/OrderStatusBadge'
import { getDashboardStats, getRecentOrders, getRevenueChart } from '../services/dashboardApi'

/* ── Fallback data (used when backend not connected) ── */
const FALLBACK_STATS = {
  total_orders: 48, orders_change: 12.5,
  active_prints: 3,
  total_revenue: 94200, revenue_change: 8.3,
  acceptance_rate: 92,
}

const FALLBACK_ORDERS = [
  { id: 1, order_id: 'ORD-1041', status: 'pending_acceptance', material: 'PLA', file_format: 'STL', vendor_payout: 1200, created_at: new Date().toISOString(), accept_deadline: new Date(Date.now() + 8 * 60000).toISOString() },
  { id: 2, order_id: 'ORD-1038', status: 'printing',           material: 'ABS', file_format: 'STEP', vendor_payout: 2400, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, order_id: 'ORD-1035', status: 'completed',          material: 'PETG', file_format: 'OBJ', vendor_payout: 980,  created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, order_id: 'ORD-1031', status: 'shipped',            material: 'Resin', file_format: '3MF', vendor_payout: 3100, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 5, order_id: 'ORD-1028', status: 'rejected',           material: 'TPU',  file_format: 'STL', vendor_payout: 750,  created_at: new Date(Date.now() - 259200000).toISOString() },
]

const FALLBACK_REVENUE = [
  { label: 'Mon', amount: 8400  },
  { label: 'Tue', amount: 11200 },
  { label: 'Wed', amount: 9800  },
  { label: 'Thu', amount: 15600 },
  { label: 'Fri', amount: 13200 },
  { label: 'Sat', amount: 18900 },
  { label: 'Sun', amount: 17100 },
]

/* ── Custom chart tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-dark text-white text-xs rounded-xl px-3 py-2 shadow-lg">
      <p className="text-gray-mid mb-0.5">{label}</p>
      <p className="font-bold">₹{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

/* ── Relative time ── */
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso)
  const m    = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Dashboard() {
  const { vendor }   = useAuth()
  const navigate     = useNavigate()

  const [stats,   setStats]   = useState(null)
  const [orders,  setOrders]  = useState([])
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState('7d')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [sRes, oRes, rRes] = await Promise.allSettled([
        getDashboardStats(),
        getRecentOrders(5),
        getRevenueChart(period),
      ])
      setStats(  sRes.status  === 'fulfilled' ? sRes.value.data  : FALLBACK_STATS)
      setOrders( oRes.status  === 'fulfilled' ? oRes.value.data  : FALLBACK_ORDERS)
      setRevenue(rRes.status  === 'fulfilled' ? rRes.value.data  : FALLBACK_REVENUE)
    } catch {
      setStats(FALLBACK_STATS)
      setOrders(FALLBACK_ORDERS)
      setRevenue(FALLBACK_REVENUE)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [period])

  const pendingCount = orders.filter(o => o.status === 'pending_acceptance').length

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-border rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-border rounded-xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 h-64 bg-gray-border rounded-xl" />
        <div className="h-64 bg-gray-border rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-dark tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
            {' '}{vendor?.name?.split(' ')[0] || 'Vendor'} 👋
          </h1>
          <p className="text-sm text-gray-mid mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={() => navigate('/orders')}
              className="btn btn-primary animate-pulse"
            >
              <Clock size={15} />
              {pendingCount} Pending {pendingCount === 1 ? 'Order' : 'Orders'}
            </button>
          )}
          <button onClick={fetchAll} className="btn btn-outline">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Orders"
          value={stats?.total_orders ?? '—'}
          change={stats?.orders_change ? `+${stats.orders_change}%` : undefined}
          changeUp
          icon={ShoppingBag}
          iconBg="bg-info/10"
          iconColor="text-info"
          subtext="All time"
        />
        <StatsCard
          label="Active Prints"
          value={stats?.active_prints ?? '—'}
          icon={Printer}
          iconBg="bg-primary-light"
          iconColor="text-primary"
          subtext="Currently printing"
        />
        <StatsCard
          label="Total Revenue"
          value={stats?.total_revenue ? `₹${(stats.total_revenue / 1000).toFixed(1)}K` : '—'}
          change={stats?.revenue_change ? `+${stats.revenue_change}%` : undefined}
          changeUp
          icon={Wallet}
          iconBg="bg-success/10"
          iconColor="text-success"
          subtext="This month"
        />
        <StatsCard
          label="Acceptance Rate"
          value={stats?.acceptance_rate ? `${stats.acceptance_rate}%` : '—'}
          change={stats?.acceptance_rate >= 90 ? 'Good' : 'Needs improvement'}
          changeUp={stats?.acceptance_rate >= 90}
          icon={Activity}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          subtext="Last 30 days"
        />
      </div>

      {/* ── Revenue chart + Quick stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-dark">Revenue Overview</h2>
              <p className="text-xs text-gray-mid mt-0.5">Vendor payout earned</p>
            </div>
            <div className="flex gap-1.5">
              {[['7d','7 Days'],['30d','30 Days'],['90d','3 Months']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setPeriod(val)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all
                    ${period === val ? 'bg-primary text-white' : 'bg-gray-light text-gray-mid hover:text-gray-dark'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#FF9500" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#FF9500" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false}
                     tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#FF9500" strokeWidth={2.5}
                    fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#FF9500' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick performance snapshot */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-dark">Performance</h2>

          {[
            { label: 'Acceptance Rate',   value: stats?.acceptance_rate   ?? 92, color: 'bg-success', suffix: '%' },
            { label: 'On-Time Delivery',  value: stats?.on_time_delivery  ?? 88, color: 'bg-info',    suffix: '%' },
            { label: 'Customer Rating',   value: (stats?.customer_rating  ?? 4.6) * 20, color: 'bg-warning', suffix: '', display: `${stats?.customer_rating ?? 4.6} / 5` },
            { label: 'Response Speed',    value: stats?.response_speed    ?? 78, color: 'bg-primary',  suffix: '%' },
          ].map(({ label, value, color, suffix, display }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-mid font-medium">{label}</span>
                <span className="font-bold text-gray-dark">{display ?? `${value}${suffix}`}</span>
              </div>
              <div className="h-1.5 bg-gray-light rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-700`}
                     style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}

          <button
            onClick={() => navigate('/performance')}
            className="btn btn-ghost btn-sm w-full justify-center mt-2"
          >
            Full report <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-dark">Recent Orders</h2>
          <button onClick={() => navigate('/orders')} className="btn btn-ghost btn-sm">
            View all <ArrowRight size={13} />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-mid">
            <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No orders yet</p>
            <p className="text-sm">New orders will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-border">
                  {['Order ID','Material','Format','Payout','Status','Time',''].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-mid
                                           uppercase tracking-wider pb-2.5 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-light/50 transition-colors group">
                    <td className="py-3 pr-4">
                      <span className="font-mono font-semibold text-sm text-info">
                        {order.order_id}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-dark">{order.material || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className="badge badge-gray uppercase font-mono text-[10px]">
                        {order.file_format || '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm font-bold text-success">
                      ₹{(order.vendor_payout || 0).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-mid whitespace-nowrap">
                      {timeAgo(order.created_at)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate('/orders')}
                        className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-sm transition-opacity"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Status summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Orders Accepted', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', count: orders.filter(o => ['accepted','printing','completed','shipped'].includes(o.status)).length },
          { label: 'In Progress',     icon: Printer,      color: 'text-primary',  bg: 'bg-primary-light', count: orders.filter(o => ['printing','packaging'].includes(o.status)).length },
          { label: 'Rejected',        icon: XCircle,      color: 'text-danger',   bg: 'bg-danger/10', count: orders.filter(o => o.status === 'rejected').length },
        ].map(({ label, icon: Icon, color, bg, count }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-dark">{count}</p>
              <p className="text-xs text-gray-mid font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
