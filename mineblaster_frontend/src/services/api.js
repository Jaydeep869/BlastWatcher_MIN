import axios from 'axios'

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Production URLs - hardcoded
  if (window.location.hostname === 'blastwatcher2429.vercel.app') {
    return 'https://blastwatcher869.onrender.com/api/v1'  
  }
  
  // Development
  return 'http://localhost:5000/api/v1'
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('firebaseToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('firebaseToken')
      localStorage.removeItem('userData')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  // Firebase login - send Firebase ID token to backend
  firebaseLogin: async (idToken) => {
    const response = await api.post('/auth/firebase-login', {
      idToken
    })
    return response.data
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  }
}

// Mines API endpoints
export const minesAPI = {
  getAllMines: async () => {
    const response = await api.get('/mines')
    return response.data
  },

  getMineById: async (id) => {
    const response = await api.get(`/mines/${id}`)
    return response.data
  },

  createMine: async (mineData) => {
    const response = await api.post('/mines', mineData)
    return response.data
  },

  updateMine: async (id, mineData) => {
    const response = await api.put(`/mines/${id}`, mineData)
    return response.data
  },

  deleteMine: async (id) => {
    const response = await api.delete(`/mines/${id}`)
    return response.data
  }
}

// Blast Data API endpoints
export const blastDataAPI = {
  getBlastDataByMine: async (mineId) => {
    const response = await api.get(`/blastdata/${mineId}`)
    return response.data
  },

  getBlastDataById: async (id) => {
    const response = await api.get(`/blastdata/single/${id}`)
    return response.data
  },

  create: async (blastData) => {
    const response = await api.post('/blastdata', blastData)
    return response.data
  },

  createBlastData: async (blastData) => {
    const response = await api.post('/blastdata', blastData)
    return response.data
  },

  updateBlastData: async (id, blastData) => {
    const response = await api.put(`/blastdata/${id}`, blastData)
    return response.data
  },

  deleteBlastData: async (id) => {
    const response = await api.delete(`/blastdata/${id}`)
    return response.data
  }
}

// Predictions API endpoints
export const predictionsAPI = {
  createPrediction: async (predictionData) => {
    const response = await api.post('/predict', predictionData)
    return response.data
  },

  getPredictionHistory: async () => {
    const response = await api.get('/predict/history')
    return response.data
  },

  getPredictionById: async (id) => {
    const response = await api.get(`/predict/${id}`)
    return response.data
  }
}

export default api
