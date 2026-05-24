import { useState, useEffect } from 'react'
import { User, Building2, CreditCard, Bell, Lock, CheckCircle2,
         Loader2, AlertTriangle, Eye, EyeOff, ChevronRight, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getVendorProfile, updateVendorProfile,
         updateBankDetails, changePasswordApi } from '../services/vendorApi'

const TABS = [
  { key: 'profile',  label: 'Profile',       icon: User       },
  { key: 'bank',     label: 'Bank Details',   icon: CreditCard },
  { key: 'notifs',   label: 'Notifications',  icon: Bell       },
  { key: 'password', label: 'Password',       icon: Lock       },
]

/* ── Toast ── */
function Toast({ message, type }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3
                     rounded-xl shadow-card-hover animate-slide-up
                     ${type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      <span className="text-sm font-semibold">{message}</span>
    </div>
  )
}

/* ── Profile tab ── */
function ProfileTab({ vendor }) {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', address: '', city: '', pincode: '' })
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)

  useEffect(() => {
    if (vendor) setForm({ name: vendor.name || '', email: vendor.email || '',
      phone: vendor.phone || '', address: vendor.address || '',
      city: vendor.city || '', pincode: vendor.pincode || '' })
  }, [vendor])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateVendorProfile(form)
      showToast('Profile updated successfully!')
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to update.', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Vendor ID chip */}
      <div className="flex items-center gap-3 bg-primary-light border border-primary/20 rounded-xl px-4 py-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
          {(form.name || 'V').slice(0,2).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-dark">{form.name || 'Vendor'}</p>
          <p className="text-xs text-gray-mid font-mono">{vendor?.vendor_id || 'TRID-XXXX'}</p>
        </div>
        <span className="ml-auto badge badge-success">● Active</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <label className="label">Full Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Your business name" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="label">Email Address</label>
          <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" className="input" placeholder="vendor@email.com" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="label">Phone Number</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" placeholder="+91 XXXXX XXXXX" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="label">City</label>
          <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input" placeholder="Mumbai" />
        </div>
        <div className="col-span-2">
          <label className="label">Address</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input" placeholder="Shop / Warehouse address" />
        </div>
        <div>
          <label className="label">Pincode</label>
          <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} className="input" placeholder="400001" />
        </div>
      </div>

      <button onClick={handleSave} disabled={loading} className="btn btn-primary">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Profile</>}
      </button>
    </div>
  )
}

/* ── Bank details tab ── */
function BankTab() {
  const [form,    setForm]    = useState({ account_name: '', account_number: '', ifsc: '', bank_name: '', upi: '' })
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const handleSave = async () => {
    setLoading(true)
    try { await updateBankDetails(form); showToast('Bank details updated!') }
    catch (e) { showToast(e?.response?.data?.detail || 'Failed.', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <div className="bg-info/8 border border-info/20 rounded-xl px-4 py-3 text-sm text-gray-mid">
        <p className="font-semibold text-gray-dark mb-0.5">Settlement payments go here</p>
        <p>Ensure your bank details are accurate. Changes require verification by TRID.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Account Holder Name</label>
          <input value={form.account_name} onChange={e => setForm(f=>({...f,account_name:e.target.value}))} className="input" placeholder="As per bank records" />
        </div>
        <div>
          <label className="label">Account Number</label>
          <input value={form.account_number} onChange={e => setForm(f=>({...f,account_number:e.target.value}))} className="input font-mono" placeholder="XXXXXXXXXXXX" />
        </div>
        <div>
          <label className="label">IFSC Code</label>
          <input value={form.ifsc} onChange={e => setForm(f=>({...f,ifsc:e.target.value.toUpperCase()}))} className="input font-mono" placeholder="SBIN0001234" />
        </div>
        <div>
          <label className="label">Bank Name</label>
          <input value={form.bank_name} onChange={e => setForm(f=>({...f,bank_name:e.target.value}))} className="input" placeholder="State Bank of India" />
        </div>
        <div>
          <label className="label">UPI ID (optional)</label>
          <input value={form.upi} onChange={e => setForm(f=>({...f,upi:e.target.value}))} className="input" placeholder="vendor@upi" />
        </div>
      </div>
      <button onClick={handleSave} disabled={loading} className="btn btn-primary">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Bank Details</>}
      </button>
    </div>
  )
}

/* ── Notifications prefs tab ── */
function NotifsTab() {
  const [prefs, setPrefs] = useState({
    order_assigned: true, print_reminders: true,  settlement_released: true,
    courier_updates: true, issue_updates: true,    performance_alerts: false,
    email_notifs: true,   sms_notifs: false,
  })
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const handleSave = async () => {
    setLoading(true)
    try { await import('../services/vendorApi').then(m => m.updateNotifPrefs(prefs)); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    catch {}
    finally { setLoading(false) }
  }

  const Toggle = ({ k, label, desc }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-border last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-dark">{label}</p>
        {desc && <p className="text-xs text-gray-mid mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => toggle(k)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200
          ${prefs[k] ? 'bg-primary' : 'bg-gray-border'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${prefs[k] ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-gray-mid uppercase tracking-wider mb-2">In-App Notifications</p>
        <div className="card p-0 divide-y divide-gray-border overflow-hidden">
          <div className="px-5"><Toggle k="order_assigned"     label="New Order Assigned"     desc="Alert when TRID assigns you an order" /></div>
          <div className="px-5"><Toggle k="print_reminders"    label="Print Reminders"        desc="5-min post-download alert" /></div>
          <div className="px-5"><Toggle k="settlement_released"label="Settlement Released"    desc="When TRID releases your payment" /></div>
          <div className="px-5"><Toggle k="courier_updates"    label="Courier Updates"        desc="Pickup scheduling & tracking" /></div>
          <div className="px-5"><Toggle k="issue_updates"      label="Issue / Dispute Updates"desc="Responses from TRID team" /></div>
          <div className="px-5"><Toggle k="performance_alerts" label="Performance Alerts"     desc="Weekly performance summary" /></div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-mid uppercase tracking-wider mb-2">Channels</p>
        <div className="card p-0 divide-y divide-gray-border overflow-hidden">
          <div className="px-5"><Toggle k="email_notifs" label="Email Notifications" desc="Send alerts to your registered email" /></div>
          <div className="px-5"><Toggle k="sms_notifs"   label="SMS Notifications"   desc="Critical alerts via SMS" /></div>
        </div>
      </div>
      <button onClick={handleSave} disabled={loading} className="btn btn-primary">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                 : saved ? <><CheckCircle2 size={15} /> Saved!</>
                 : <><Save size={15} /> Save Preferences</>}
      </button>
    </div>
  )
}

/* ── Change password tab ── */
function PasswordTab() {
  const [curr,    setCurr]    = useState('')
  const [newPw,   setNewPw]   = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurr,setShowCurr]= useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const rules = [
    { test: p => p.length >= 8,          label: 'At least 8 characters' },
    { test: p => /[A-Z]/.test(p),        label: 'One uppercase letter'  },
    { test: p => /[0-9]/.test(p),        label: 'One number'            },
    { test: p => /[^a-zA-Z0-9]/.test(p), label: 'One special character' },
  ]
  const allGood = rules.every(r => r.test(newPw)) && newPw === confirm

  const handleChange = async () => {
    if (!allGood) return
    setLoading(true)
    try { await changePasswordApi(curr, newPw); showToast('Password changed successfully!'); setCurr(''); setNewPw(''); setConfirm('') }
    catch (e) { showToast(e?.response?.data?.detail || 'Incorrect current password.', 'error') }
    finally { setLoading(false) }
  }

  const PwInput = ({ value, onChange, show, onToggle, placeholder, id }) => (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder={placeholder} className="input pr-11" />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid hover:text-gray-dark transition-colors">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )

  return (
    <div className="space-y-5 max-w-sm">
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <div>
        <label className="label">Current Password</label>
        <PwInput value={curr} onChange={e => setCurr(e.target.value)} show={showCurr} onToggle={() => setShowCurr(v=>!v)} placeholder="Your current password" />
      </div>
      <div>
        <label className="label">New Password</label>
        <PwInput value={newPw} onChange={e => setNewPw(e.target.value)} show={showNew} onToggle={() => setShowNew(v=>!v)} placeholder="Create strong password" />
        {newPw && (
          <div className="mt-2.5 space-y-1.5">
            {rules.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 size={12} className={r.test(newPw) ? 'text-success' : 'text-gray-border'} />
                <span className={`text-xs ${r.test(newPw) ? 'text-success' : 'text-gray-mid'}`}>{r.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="label">Confirm New Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder="Re-enter new password"
          className={`input ${confirm && newPw !== confirm ? 'input-error' : ''}`} />
        {confirm && newPw !== confirm && <p className="text-xs text-danger mt-1.5">Passwords do not match</p>}
      </div>
      <button onClick={handleChange} disabled={loading || !allGood} className="btn btn-primary">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Updating…</> : <><Lock size={15} /> Change Password</>}
      </button>
    </div>
  )
}

/* ── Main Page ── */
export default function Settings() {
  const { vendor }          = useAuth()
  const [activeTab, setTab] = useState('profile')

  const ActiveComp = { profile: ProfileTab, bank: BankTab, notifs: NotifsTab, password: PasswordTab }[activeTab]

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-dark tracking-tight">Settings</h1>
        <p className="text-sm text-gray-mid mt-0.5">Manage your vendor account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
        {/* Tab sidebar */}
        <div className="space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px]
                          text-sm font-medium transition-all text-left
                          ${activeTab === key
                            ? 'bg-primary-light text-primary'
                            : 'text-gray-mid hover:bg-gray-light hover:text-gray-dark'}`}
            >
              <Icon size={16} /> {label}
              {activeTab === key && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card">
          <ActiveComp vendor={vendor} />
        </div>
      </div>
    </div>
  )
}
