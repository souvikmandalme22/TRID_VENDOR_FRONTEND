import api from './api'

// Performance
export const getPerformanceMetrics = () => api.get('/vendor/performance')
export const getPerformanceHistory = () => api.get('/vendor/performance/history')

// Settings / Profile
export const getVendorProfile   = ()            => api.get('/vendor/profile')
export const updateVendorProfile= (data)        => api.patch('/vendor/profile', data)
export const updateBankDetails  = (data)        => api.patch('/vendor/profile/bank', data)
export const updateNotifPrefs   = (data)        => api.patch('/vendor/profile/notifications', data)
export const changePasswordApi  = (curr, nw)   => api.post('/auth/change-password', { current_password: curr, new_password: nw })

// Notifications
export const getNotifications      = ()         => api.get('/vendor/notifications')
export const markNotifRead         = (id)       => api.patch(`/vendor/notifications/${id}/read`)
export const markAllNotifsRead     = ()         => api.post('/vendor/notifications/read-all')
