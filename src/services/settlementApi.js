import api from './api'

export const getSettlementSummary = ()                    => api.get('/vendor/settlements/summary')
export const getSettlements       = (params = {})         => api.get('/vendor/settlements', { params })
export const getSettlementDetail  = (settlementId)        => api.get(`/vendor/settlements/${settlementId}`)
export const getTdsHistory        = ()                    => api.get('/vendor/settlements/tds')
