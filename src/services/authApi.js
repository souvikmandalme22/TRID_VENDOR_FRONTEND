import api from './api'

export const loginApi          = (vendorId, password) => api.post('/auth/login', { vendor_id: vendorId, password })
export const verifyTokenApi    = ()                   => api.get('/auth/verify')
export const logoutApi         = ()                   => api.post('/auth/logout')
export const changePasswordApi = (currentPw, newPw)   => api.post('/auth/change-password', { current_password: currentPw, new_password: newPw })
export const getProfileApi     = ()                   => api.get('/vendor/profile')
