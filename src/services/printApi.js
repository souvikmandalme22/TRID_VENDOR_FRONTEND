import api from './api'

export const getFileDownloadUrl  = (orderId)             => api.get(`/vendor/orders/${orderId}/file-url`)
export const confirmDownload     = (orderId)             => api.post(`/vendor/orders/${orderId}/confirm-download`)
export const confirmPrintStarted = (orderId, estMinutes) => api.post(`/vendor/orders/${orderId}/print-started`, { estimated_minutes: estMinutes })
export const updatePrintStatus   = (orderId, payload)    => api.post(`/vendor/orders/${orderId}/print-status`, payload)
export const getActivePrintJobs  = ()                    => api.get('/vendor/orders/print-jobs')
export const markPrintComplete   = (orderId)             => api.post(`/vendor/orders/${orderId}/print-complete`)
export const reportDelay         = (orderId, extraMins, reason) =>
  api.post(`/vendor/orders/${orderId}/delay`, { extra_minutes: extraMins, reason })
