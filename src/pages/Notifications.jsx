import { useState, useEffect } from 'react'
import { Bell, Clock, Package, Wallet, AlertTriangle, CheckCircle2,
         Printer, Truck, RefreshCw, Check, X } from 'lucide-react'
import { getNotifications, markNotifRead, markAllNotifsRead } from '../services/vendorApi'

const FALLBACK_NOTIFS = [
  { id: 1,  type: 'order_assigned',  title: 'New Order Assigned',         message: 'Order ORD-1041 has been assigned to you. Accept within 15 minutes.', read: false, created_at: new Date().toISOString() },
  { id: 2,  type: 'print_reminder',  title: 'Print Start Reminder',       message: 'ORD-1038 file downloaded 5 minutes ago. Please confirm printing started.', read: false, created_at: new Date(Date.now()-300000).toISOString() },
  { id: 3,  type: 'settlement',      title: 'Settlement Released',         message: 'Payment of ₹2,790 for ORD-1031 has been released to your bank.', read: false, created_at: new Date(Date.now()-3600000).toISOString() },
  { id: 4,  type: 'courier',         title: 'Courier Assigned',            message: 'Delhivery assigned for ORD-1035. Pickup window: 3–5 PM today.', read: true,  created_at: new Date(Date.now()-7200000).toISOString() },
  { id: 5,  type: 'print_complete',  title: 'Print Timer Ended',           message: 'ORD-1038 print timer has ended. Mark as completed or report delay.', read: true,  created_at: new Date(Date.now()-10800000).toISOString() },
  { id: 6,  type: 'issue_response',  title: 'TRID Response on Issue',      message: 'TRID has reviewed your issue on ORD-1022 and resolved the dispute.', read: true,  created_at: new Date(Date.now()-86400000).toISOString() },
  { id: 7,  type: 'performance',     title: 'Performance Update',          message: 'Your acceptance rate improved to 92% this week. Great work!', read: true,  created_at: new Date(Date.now()-172800000).toISOString() },
  { id: 8,  type: 'order_assigned',  title: 'Order Rejected — Reassigned', message: 'ORD-1040 was auto-reassigned due to no response within 15 minutes.', read: true,  created_at: new Date(Date.now()-259200000).toISOString() },
]

const TYPE_MAP = {
  order_assigned:  { icon: Bell,          color: 'text-info',    bg: 'bg-info/10',    label: 'Order'       },
  print_reminder:  { icon: Printer,       color: 'text-primary', bg: 'bg-primary-light', label: 'Print'    },
  print_complete:  { icon: CheckCircle2,  color: 'text-success', bg: 'bg-success/10', label: 'Print'       },
  settlement:      { icon: Wallet,        color: 'text-success', bg: 'bg-success/10', label: 'Settlement'  },
  courier:         { icon: Truck,         color: 'text-info',    bg: 'bg-info/10',    label: 'Courier'     },
  issue_response:  { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', label: 'Issue'       },
  performance:     { icon: Clock,         color: 'text-warning', bg: 'bg-warning/10', label: 'Performance' },
}

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso)
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  const fetchNotifs = async () => {
    setLoading(true)
    try {
      const res  = await getNotifications()
      const data = Array.isArray(res.data) ? res.data : res.data?.results
      setNotifs(data?.length ? data : FALLBACK_NOTIFS)
    } catch { setNotifs(FALLBACK_NOTIFS) }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetchNotifs() }, [])

  const handleMarkRead = async (id) => {
    try { await markNotifRead(id) } catch {}
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAllRead = async () => {
    try { await markAllNotifsRead() } catch {}
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifs.filter(n => !n.read).length

  const filtered = filter === 'all'
    ? notifs
    : filter === 'unread'
      ? notifs.filter(n => !n.read)
      : notifs.filter(n => TYPE_MAP[n.type]?.label.toLowerCase() === filter)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-dark tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-mid mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchNotifs} className="btn btn-outline btn-sm"><RefreshCw size={14} /></button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn btn-ghost btn-sm">
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-gray-light p-1 rounded-xl overflow-x-auto">
        {[
          { key: 'all',        label: 'All' },
          { key: 'unread',     label: `Unread (${unreadCount})` },
          { key: 'order',      label: 'Orders'      },
          { key: 'print',      label: 'Print'       },
          { key: 'settlement', label: 'Settlements' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all
              ${filter === key ? 'bg-white text-gray-dark shadow-card' : 'text-gray-mid hover:text-gray-dark'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-border rounded-xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="card text-center py-14 text-gray-mid">
            <Bell size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No notifications</p>
          </div>
        ) : (
          filtered.map(n => {
            const meta = TYPE_MAP[n.type] || TYPE_MAP['order_assigned']
            const Icon = meta.icon
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer
                  ${!n.read
                    ? 'bg-white border-primary/20 shadow-card'
                    : 'bg-white border-gray-border hover:bg-gray-light/50'}`}
                onClick={() => !n.read && handleMarkRead(n.id)}
              >
                {/* Unread dot */}
                <div className="relative shrink-0 mt-0.5">
                  <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center`}>
                    <Icon size={16} className={meta.color} />
                  </div>
                  {!n.read && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5
                                    rounded-full bg-primary ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-tight ${!n.read ? 'font-semibold text-gray-dark' : 'font-medium text-gray-dark'}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-gray-mid whitespace-nowrap shrink-0">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-mid mt-1 leading-relaxed">{n.message}</p>
                </div>

                {!n.read && (
                  <button
                    onClick={e => { e.stopPropagation(); handleMarkRead(n.id) }}
                    className="shrink-0 p-1.5 hover:bg-gray-light rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <X size={12} className="text-gray-mid" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
