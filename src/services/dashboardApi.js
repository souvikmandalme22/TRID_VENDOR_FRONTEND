import api from './api'

export const getDashboardStats  = ()              => api.get('/vendor/dashboard/stats')
export const getRecentOrders    = (limit = 5)     => api.get(`/vendor/orders/recent?limit=${limit}`)
export const getRevenueChart    = (period = '7d') => api.get(`/vendor/analytics/revenue?period=${period}`)
export const getPerformanceSummary = ()           => api.get('/vendor/performance/summary')
