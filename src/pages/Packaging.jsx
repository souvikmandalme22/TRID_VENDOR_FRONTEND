import { useState, useEffect } from 'react'
import {
  Package, Truck, CheckCircle2, Clock, MapPin, Phone,
  RefreshCw, AlertTriangle, Loader2, Copy, ExternalLink,
  Box, Hash, Calendar, ArrowRight
} from 'lucide-react'
import OrderStatusBadge from '../components/OrderStatusBadge'
import {
  getPackagingOrders, markPackagingDone,
  getCourierDetails, confirmPickupReady
} from '../services/packagingApi'

/* ── Fallback ── */
const FALLBACK = [
  {
    id: 2, order_id: 'ORD-1038', status: 'completed',
    material: 'ABS', file_format: 'STEP', vendor_payout: 2400,
    delivery_deadline: '27 May 2026',
    packaging_status: 'pending',        // pending | packed | courier_assigned | pickup_scheduled | shipped
    courier: null,
  },
  {
    id: 4, order_id: 'ORD-1035', status: 'packaging',
    material: 'PETG', file_format: 'OBJ', vendor_payout: 980,
    delivery_deadline: '28 May 2026',
    packaging_status: 'courier_assigned',
    courier: {
      partner: 'Delhivery',
      agent_name: 'Ramesh Kumar',
      agent_phone: '+91 98765 43210',
      pickup_time: '3:00 PM – 5:00 PM today',
      tracking_id: 'DLVR-8821049243',
      tracking_url: 'https://www.delhivery.com/track/DLVR-8821049243',
    },
  },
  {
    id: 5, order_id: 'ORD-1031', status: 'shipped',
    material: 'Resin', file_format: '3MF', vendor_payout: 3100,
    delivery_deadline: '23 May 2026',
    packaging_status: 'shipped',
    courier: {
      partner: 'Bluedart',
      agent_name: 'Suresh V.',
      agent_phone: '+91 87654 32109',
      pickup_time: 'Picked up 23 May, 2:15 PM',
      tracking_id: 'BD-7712340098',
      tracking_url: 'https://bluedart.com/track/BD-7712340098',
    },
  },
]

/* ── Packaging step indicator ── */
const PKG_STEPS = [
  { key: 'pending',          label: 'Pack Order',       icon: Box      },
  { key: 'courier_assigned', label: 'Courier Assigned', icon: Truck    },
  { key: 'pickup_scheduled', label: 'Pickup Ready',     icon: Clock    },
  { key: 'shipped',          label: 'Shipped',          icon: CheckCircle2 },
]

function PkgStepBar({ current }) {
  const idx = PKG_STEPS.findIndex(s => s.key === current)
  return (
    <div className="flex items-center mb-5">
      {PKG_STEPS.map(({ key, label, icon: Icon }, i) => {
        const done   = i < idx
        const active = i === idx
        return (
          <div key={key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                ${done   ? 'bg-success text-white' : ''}
                ${active ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                ${!done && !active ? 'bg-gray-light text-gray-mid' : ''}`}>
                {done ? <CheckCircle2 size={15}/> : <Icon size={15}/>}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap
                ${active ? 'text-primary' : done ? 'text-success' : 'text-gray-mid'}`}>
                {label}
              </span>
            </div>
            {i < PKG_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1.5 mb-5 rounded-full
                ${i < idx ? 'bg-success' : 'bg-gray-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Courier info card ── */
function CourierCard({ courier }) {
  const [copied, setCopied] = useState(false)

  const copyTracking = () => {
    navigator.clipboard.writeText(courier.tracking_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Partner + agent */}
      <div className="flex items-center justify-between p-4 bg-info/8 border border-info/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center">
            <Truck size={18} className="text-info" />
          </div>
          <div>
            <p className="font-bold text-gray-dark">{courier.partner}</p>
            <p className="text-xs text-gray-mid">Assigned by TRID</p>
          </div>
        </div>
        <span className="badge badge-success">● Active</span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-light rounded-xl px-4 py-3">
          <p className="text-[10px] text-gray-mid font-medium mb-1 uppercase tracking-wide">Agent</p>
          <p className="text-sm font-semibold text-gray-dark">{courier.agent_name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Phone size={11} className="text-gray-mid" />
            <p className="text-xs text-gray-mid">{courier.agent_phone}</p>
          </div>
        </div>
        <div className="bg-gray-light rounded-xl px-4 py-3">
          <p className="text-[10px] text-gray-mid font-medium mb-1 uppercase tracking-wide">Pickup Window</p>
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className="text-primary shrink-0" />
            <p className="text-sm font-semibold text-gray-dark leading-tight">{courier.pickup_time}</p>
          </div>
        </div>
      </div>

      {/* Tracking ID */}
      <div className="flex items-center gap-3 bg-gray-light rounded-xl px-4 py-3">
        <Hash size={14} className="text-gray-mid shrink-0" />
        <p className="font-mono text-sm font-bold text-gray-dark flex-1">{courier.tracking_id}</p>
        <button onClick={copyTracking} className="btn btn-ghost btn-sm py-1">
          {copied ? <CheckCircle2 size={13} className="text-success" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <a
          href={courier.tracking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm py-1"
        >
          <ExternalLink size={13} /> Track
        </a>
      </div>
    </div>
  )
}

/* ── Single packaging job card ── */
function PackagingCard({ job, onUpdate }) {
  const [pkgStatus, setPkgStatus]   = useState(job.packaging_status || 'pending')
  const [courier,   setCourier]     = useState(job.courier || null)
  const [loading,   setLoading]     = useState(false)
  const [error,     setError]       = useState('')

  /* Mark packaging done */
  const handlePackagingDone = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await markPackagingDone(job.id)
      /* Backend assigns courier automatically */
      setPkgStatus('courier_assigned')
      setCourier(res.data?.courier || {
        partner: 'Delhivery',
        agent_name: 'Assigned by TRID',
        agent_phone: 'Will be shared shortly',
        pickup_time: 'Being scheduled…',
        tracking_id: res.data?.tracking_id || 'PENDING',
        tracking_url: '#',
      })
      onUpdate?.()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to update status.')
    } finally {
      setLoading(false)
    }
  }

  /* Confirm pickup ready */
  const handlePickupReady = async () => {
    setLoading(true)
    setError('')
    try {
      await confirmPickupReady(job.id)
      setPkgStatus('shipped')
      onUpdate?.()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to confirm.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-gray-dark font-mono">{job.order_id}</p>
            <p className="text-xs text-gray-mid mt-0.5">
              {job.material} · {job.file_format} · Deliver by {job.delivery_deadline}
            </p>
          </div>
        </div>
        <div className="text-right">
          <OrderStatusBadge status={job.status} />
          <p className="text-xs text-gray-mid mt-1.5">
            Payout: <strong className="text-success">₹{job.vendor_payout?.toLocaleString()}</strong>
          </p>
        </div>
      </div>

      {/* Step bar */}
      <PkgStepBar current={pkgStatus} />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-danger text-sm bg-danger/8
                        border border-danger/20 rounded-[10px] px-3 py-2.5">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── PENDING: mark packaging done ── */}
      {pkgStatus === 'pending' && (
        <div className="space-y-3">
          <div className="bg-warning/8 border border-warning/20 rounded-xl p-4 space-y-2 text-sm text-gray-dark">
            <p className="font-semibold flex items-center gap-2">
              <Package size={15} className="text-warning" /> Packaging Checklist
            </p>
            {[
              'Item securely wrapped / bubble-wrapped',
              'TRID order label printed and attached',
              'Invoice slip included inside the box',
              'Box sealed with tape properly',
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="accent-primary w-4 h-4 rounded" />
                <span className="text-sm text-gray-dark">{item}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handlePackagingDone}
            disabled={loading}
            className="btn btn-primary btn-full"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
              : <><CheckCircle2 size={16} /> Mark Packaging Complete</>}
          </button>
        </div>
      )}

      {/* ── COURIER ASSIGNED ── */}
      {pkgStatus === 'courier_assigned' && courier && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-success text-sm bg-success/8
                          border border-success/20 rounded-[10px] px-3 py-2.5 font-semibold">
            <CheckCircle2 size={15} /> Packaging confirmed — Courier assigned by TRID
          </div>
          <CourierCard courier={courier} />
          <button
            onClick={handlePickupReady}
            disabled={loading}
            className="btn btn-primary btn-full"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Confirming…</>
              : <><Truck size={16} /> Confirm Pickup Ready</>}
          </button>
        </div>
      )}

      {/* ── SHIPPED ── */}
      {pkgStatus === 'shipped' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-success text-sm font-semibold
                          bg-success/8 border border-success/20 rounded-[10px] px-3 py-2.5">
            <Truck size={15} /> Order picked up and shipped!
          </div>
          {courier && <CourierCard courier={courier} />}
          <div className="bg-info/8 border border-info/20 rounded-xl px-4 py-3 text-xs text-gray-mid">
            <p className="font-semibold text-gray-dark mb-1">What happens next?</p>
            <p>TRID holds payment until delivery confirmation. Settlement will be released within the verification buffer period after successful delivery.</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Page ── */
export default function Packaging() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res  = await getPackagingOrders()
      const data = Array.isArray(res.data) ? res.data : res.data?.results
      setJobs(data?.length ? data : FALLBACK)
    } catch {
      setJobs(FALLBACK)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const pendingPkg = jobs.filter(j => j.packaging_status === 'pending').length
  const shipped    = jobs.filter(j => j.packaging_status === 'shipped').length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5 animate-fade-in">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-dark tracking-tight">Packaging & Courier</h1>
          <p className="text-sm text-gray-mid mt-0.5">
            {pendingPkg} to pack · {shipped} shipped
          </p>
        </div>
        <button onClick={fetchJobs} className="btn btn-outline">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {pendingPkg > 0 && (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-xl px-4 py-3">
          <Package size={18} className="text-warning shrink-0" />
          <p className="text-sm font-semibold text-gray-dark">
            {pendingPkg} order{pendingPkg > 1 ? 's' : ''} ready to be packed — complete packaging to get courier assigned
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="card h-64 animate-pulse bg-gray-light" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16">
          <Package size={40} className="mx-auto mb-3 text-gray-border" />
          <p className="font-semibold text-gray-dark">No packaging orders</p>
          <p className="text-sm text-gray-mid mt-1">Completed prints will appear here.</p>
        </div>
      ) : (
        jobs.map(job => <PackagingCard key={job.id} job={job} onUpdate={fetchJobs} />)
      )}
    </div>
  )
}
