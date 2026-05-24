import api from './api'

export const getIssues       = (params = {})        => api.get('/vendor/issues', { params })
export const reportIssue     = (formData)           => api.post('/vendor/issues', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getIssueDetail  = (issueId)            => api.get(`/vendor/issues/${issueId}`)
export const addIssueComment = (issueId, message)   => api.post(`/vendor/issues/${issueId}/comments`, { message })
