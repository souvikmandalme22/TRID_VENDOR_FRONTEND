import api from './api'

export const getAllOrders       = (params = {})          => api.get('/vendor/orders', { params })
export const getOrderDetails    = (orderId)              => api.get(`/vendor/orders/${orderId}`)
export const acceptOrder        = (orderId)              => api.post(`/vendor/orders/${orderId}/accept`)
export const rejectOrder        = (orderId, reason)      => api.post(`/vendor/orders/${orderId}/reject`, { reason })
export const getOrderFile       = (orderId)              => api.get(`/vendor/orders/${orderId}/file-url`)
export const downloadOrderFile  = (orderId)              => api.post(`/vendor/orders/${orderId}/download`)
