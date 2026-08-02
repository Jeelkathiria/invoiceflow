import api from './axios'

export const authService = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials)
  },
  signup: async (payload) => {
    return api.post('/auth/signup', payload)
  },
  logout: async () => {
    return api.post('/auth/logout')
  },
}
