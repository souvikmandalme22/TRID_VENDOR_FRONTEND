import api from './api'

export const getPackagingOrders   = ()         => api.get('/vendor/orders/packaging')
export const markPackagingDone    = (orderId)  => api.post(`/vendor/orders/${orderId}/packaging-complete`)
export const getCourierDetails    = (orderId)  => api.get(`/vendor/orders/${orderId}/courier`)
export const getTrackingInfo      = (orderId)  => api.get(`/vendor/orders/${orderId}/tracking`)
export const confirmPickupReady   = (orderId)  => api.post(`/vendor/orders/${orderId}/pickup-ready`)
