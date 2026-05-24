import { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, RefreshCw, ShoppingBag, ArrowRight,
  Clock, FileText, Box, Layers, Calendar, ChevronDown, ChevronUp
} from 'lucide-react'
import OrderStatusBadge  from '../components/OrderStatusBadge'
import AcceptRejectModal from '../components/AcceptRejectModal'
import { getAllOrders, acceptOrder, rejectOrder } from '../services/ordersApi'

/* ── Fallback ── */
const FALLBACK_ORDERS = [
  { id: 1,  order_id: 'ORD-1041', status: 'pending_acceptance', material: 'PLA',   file_format: 'STL',  vendor_payout: 1200, build_volume: '120×80×60 mm',  delivery_deadline: '28 May 2026', created_at: new Date().toISOString(),                accept_deadline: new Date(Date.now() + 8*60000).toISOString() },
  { id: 2,  order_id: 'ORD-1040', status: 'pending_acceptance', material: 'PETG',  file_format: 'STEP', vendor_payout: 2100, build_volume: '200×150×100 mm', delivery_deadline: '29 May 2026', created_at: new Date().toISOString(),                accept_deadline: new Date(Date.now() + 11*60000).toISOString() },
  { id: 3,  order_id: 'ORD-1038', status: 'printing',           material: 'ABS',   file_format: 'STEP', vendor_payout: 2400, build_volume: '95×70×45 mm',   delivery_deadline: '27 May 2026', created_at: new Date(Date.now()-7200000).toISOString() },
  { id: 4,  order_id: 'ORD-1035', status: 'completed',          material: 'PETG',  file_format: 'OBJ',  vendor_payout: 980,  build_volume: '60×40×30 mm',   delivery_deadline: '24 May 2026', created_at: new Date(Date.now()-86400000).toISOString() },
  { id: 5,  order_id: 'ORD-1031', status: 'shipped',            material: 'Resin', file_format: '3MF',  vendor_payout: 3100, build_volume: '150×100×80 mm', delivery_deadline: '23 May 2026', created_at: new Date(Date.now()-172800000).toISOString() },
  { id: 6,  order_id: 'ORD-1028', status: 'rejected',           material: 'TPU',   file_format: 'STL',  vendor_payout: 750,  build_volume: '80×50×40 mm',   delivery_deadline: '22 May 2026', created_at: new Date(Date.now()-259200000).toISOString() },
  { id: 7,  order_id: 'ORD-1025', status: 'accepted',           material: 'PLA',   file_format: 'STL',  vendor_payout: 1650, build_volume: '110×90×70 mm',  delivery_deadline: '26 May 2026', created_at: new Date(Date.now()-10800000).toISOString() },
  { id: 8,  order_id: 'ORD-1020', status: 'packaging',          material: 'ABS',   file_format: 'STEP', vendor_payout: 4200, build_volume: '250×200×150 mm',delivery_deadline: '25 May 2026', created_at: new Date(Date.now()-345600000).toISOString() },
]

const FILTER_TABS = [
  { key: 'all',                label: 'All Orders' },
  { key: 'pending_acceptance', label: 'Pending' },
  { key: 'accepted',           label: 'Accepted' },
  { key: 'printing',           label: 'Printing' },
  { key: 'completed',          label: 'Completed' },
  { key: 'shipped',            label: 'Shipped' },
  { key: 'rejected',           label: 'Rejected' },
]

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso)
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/* ── Expanded row detail ── */
function OrderRow({ order, onOpenModal }) {
  const [expanded, setExpanded] = useState(false)
  const isPending = order.status === 'pending_acceptance'

  return (
    <>
      <tr
        className={`hover:bg-gray-light/60 transition-colors cursor-pointer
                    ${isPending ? 'bg-warning/5' : ''}`}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Order ID */}
        <td className="py-3.5 pr-4 pl-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-sm text-info">{order.order_id}</span>
            {isPending && (
              <span className="badge badge-warning animate-pulse">● New</span>
            )}
          </div>
        </td>
        {/* Material */}
        <td className="py-3.5 pr-4 text-sm text-gray-dark font-medium">{order.material}</td>
        {/* Format */}
        <td className="py-3.5 pr-4">
          <span className="badge badge-gray uppercase font-mono text-[10px]">{order.file_format}</span>
        </td>
        {/* Build volume */}
        <td className="py-3.5 pr-4 text-xs text-gray-mid font-mono">{order.build_volume || '—'}</td>
        {/* Deadline */}
        <td className="py-3.5 pr-4 text-sm text-gray-dark">{order.delivery_deadline || '—'}</td>
        {/* Payout */}
        <td className="py-3.5 pr-4 font-bold text-success text-sm">₹{(order.vendor_payout||0).toLocaleString()}</td>
        {/* Status */}
        <td className="py-3.5 pr-4"><OrderStatusBadge status={order.status} /></td>
        {/* Time */}
        <td className="py-3.5 pr-4 text-xs text-gray-mid whitespace-nowrap">{timeAgo(order.created_at)}</td>
        {/* Expand */}
        <td className="py-3.5 pr-4">
          {expanded ? <ChevronUp size={15} className="text-gray-mid" /> : <ChevronDown size={15} className="text-gray-mid" />}
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr className="bg-gray-light/50">
          <td colSpan={9} className="px-4 pb-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">

              {/* Info pills */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 border border-gray-border text-xs">
                  <FileText size={12} className="text-gray-mid" />
                  <span className="text-gray-mid">Format:</span>
                  <span className="font-bold text-gray-dark uppercase">{order.file_format}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 border border-gray-border text-xs">
                  <Layers size={12} className="text-gray-mid" />
                  <span className="text-gray-mid">Material:</span>
                  <span className="font-bold text-gray-dark">{order.material}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 border border-gray-border text-xs">
                  <Box size={12} className="text-gray-mid" />
                  <span className="text-gray-mid">Volume:</span>
                  <span className="font-bold text-gray-dark font-mono">{order.build_volume || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 border border-gray-border text-xs">
                  <Calendar size={12} className="text-gray-mid" />
                  <span className="text-gray-mid">Deadline:</span>
                  <span className="font-bold text-gray-dark">{order.delivery_deadline || '—'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="ml-auto flex gap-2">
                {isPending && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenModal(order) }}
                    className="btn btn-primary btn-sm"
                  >
                    <Clock size={13} /> Respond Now
                  </button>
                )}
                {order.status === 'accepted' && (
                  <button className="btn btn-outline btn-sm">
                    <ArrowRight size={13} /> Go to Print Workflow
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ── Main Page ── */
export default function Orders() {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [activeTab,   setActiveTab]   = useState('all')
  const [modalOrder,  setModalOrder]  = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await getAllOrders()
      setOrders(Array.isArray(res.data) ? res.data : res.data?.results || FALLBACK_ORDERS)
    } catch {
      setOrders(FALLBACK_ORDERS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  /* ── Auto-open modal for first pending order ── */
  useEffect(() => {
    if (!modalOrder) {
      const first = orders.find(o => o.status === 'pending_acceptance')
      if (first) setModalOrder(first)
    }
  }, [orders])

  /* ── Filter + search ── */
  const filtered = orders.filter(o => {
    const matchTab    = activeTab === 'all' || o.status === activeTab
    const matchSearch = !search || o.order_id.toLowerCase().includes(search.toLowerCase())
                        || o.material?.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const tabCount = (key) =>
    key === 'all' ? orders.length : orders.filter(o => o.status === key).length

  /* ── Accept / Reject handlers ── */
  const handleAccept = useCallback(async (orderId) => {
    await acceptOrder(orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'accepted' } : o))
  }, [])

  const handleReject = useCallback(async (orderId, reason) => {
    await rejectOrder(orderId, reason)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o))
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-dark tracking-tight">Orders</h1>
          <p className="text-sm text-gray-mid mt-0.5">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-outline">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Pending alert banner */}
      {orders.filter(o => o.status === 'pending_acceptance').length > 0 && (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/30
                        rounded-xl px-4 py-3 animate-fade-in">
          <Clock size={18} className="text-warning shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-dark">
              {orders.filter(o => o.status === 'pending_acceptance').length} order(s) awaiting your response
            </p>
            <p className="text-xs text-gray-mid">You have 15 minutes per order — no response triggers auto-reassignment</p>
          </div>
          <button
            onClick={() => { const o = orders.find(o => o.status === 'pending_acceptance'); if(o) setModalOrder(o) }}
            className="btn btn-primary btn-sm shrink-0"
          >
            Respond <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Filter tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-light p-1 rounded-xl overflow-x-auto">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                          whitespace-nowrap transition-all duration-150
                          ${activeTab === key
                            ? 'bg-white text-gray-dark shadow-card'
                            : 'text-gray-mid hover:text-gray-dark'}`}
            >
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full
                ${activeTab === key ? 'bg-primary text-white' : 'bg-gray-border text-gray-mid'}`}>
                {tabCount(key)}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-border
                        rounded-xl px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-gray-mid shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order ID, material…"
            className="bg-transparent text-sm text-gray-dark placeholder-gray-mid outline-none w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-light rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-mid">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No orders found</p>
            <p className="text-sm mt-1">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-gray-border bg-gray-light/60">
                <tr>
                  {['Order ID','Material','Format','Build Volume','Deadline','Payout','Status','Time',''].map(h => (
                    <th key={h}
                        className="text-left text-[11px] font-semibold text-gray-mid uppercase
                                   tracking-wider py-3 pr-4 first:pl-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border">
                {filtered.map(order => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onOpenModal={setModalOrder}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accept/Reject Modal */}
      {modalOrder && (
        <AcceptRejectModal
          order={modalOrder}
          deadline={modalOrder.accept_deadline}
          onAccept={handleAccept}
          onReject={handleReject}
          onClose={() => setModalOrder(null)}
        />
      )}
    </div>
  )
}
