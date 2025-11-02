"use client"

import { useState, useEffect } from 'react'
import axios from 'axios'

// Safe localStorage utility functions
const storage = {
  setItem: (key, value) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value)
    }
  },
  getItem: (key) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key)
    }
    return null
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key)
    }
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.clear()
    }
  }
}

// API service functions
const API_BASE_URL = 'https://smartgwiza-be-1.onrender.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = storage.getItem('authToken') || storage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log(`🔄 Making API request to: ${config.url}`)
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.url}`, response.status)
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

const adminApi = {
  getDashboardStats: async () => {
    const response = await api.get('/api/admin/dashboard/stats')
    return response.data
  },

  getFarmers: async (page = 1, limit = 10, search = '', status = 'all') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status
    })
    if (search) params.append('search', search)

    const response = await api.get(`/api/admin/farmers?${params}`)
    return response.data
  },

  getFarmerDetails: async (farmerId) => {
    const response = await api.get(`/api/admin/farmers/${farmerId}/details`)
    return response.data
  },

  getYieldTrends: async (days = 30) => {
    try {
      const response = await api.get(`/api/admin/yield-trends?days=${days}`)
      return response.data
    } catch (error) {
      console.warn('Yield trends API failed, using mock data')
      return generateMockYieldTrends(days)
    }
  },

  getRegionalStats: async () => {
    try {
      console.log('🔄 Fetching regional stats...')
      const response = await api.get('/api/admin/regional-stats')
      console.log('✅ Regional stats response:', response.data)
      return response.data
    } catch (error) {
      console.warn('❌ Regional stats API failed, using mock data', error.message)
      return {
        regions: generateMockRegionalStats(),
        message: 'Using mock data - API unavailable'
      }
    }
  },

  getRecentSubmissions: async (limit = 20) => {
    try {
      console.log('🔄 Fetching recent submissions...')
      const response = await api.get(`/api/admin/submissions/recent?limit=${limit}`)
      console.log('✅ Recent submissions response:', response.data)
      return response.data
    } catch (error) {
      console.warn('❌ Recent submissions API failed, using mock data', error.message)
      return generateMockRecentSubmissions(limit)
    }
  },

  exportFarmersData: async () => {
    const response = await api.get('/api/admin/export/farmers-data', {
      responseType: 'blob'
    })
    return response.data
  },

  getSystemHealth: async () => {
    try {
      const response = await api.get('/api/admin/system/health')
      return response.data
    } catch (error) {
      return { status: 'unavailable', message: 'Health check failed' }
    }
  },
}

// Enhanced mock data generators
const generateMockYieldTrends = (days = 30) => {
  const trends = []
  const baseDate = new Date()
  let currentYield = 2.5

  for (let i = days; i >= 0; i--) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - i)

    // Simulate realistic yield fluctuations with upward trend
    const fluctuation = (Math.random() - 0.3) * 0.4 // Slight upward bias
    currentYield = Math.max(1.5, Math.min(5.0, currentYield + fluctuation))

    trends.push({
      date: date.toISOString().split('T')[0],
      average_yield: parseFloat(currentYield.toFixed(2)),
      predictions_count: Math.floor(Math.random() * 20) + 5,
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    })
  }
  return trends
}

const generateMockRegionalStats = () => {
  const districts = [
    "Kigali City", "Gasabo", "Nyarugenge", "Kicukiro", "Bugesera",
    "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
    "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"
  ]

  return districts.map(district => {
    const avgYield = parseFloat((2 + Math.random() * 2).toFixed(2))
    let performance = 'Average'
    if (avgYield > 3.5) performance = 'Excellent'
    else if (avgYield > 2.8) performance = 'Good'
    else if (avgYield < 2.2) performance = 'Needs Improvement'

    return {
      district,
      average_yield: avgYield,
      farmers_count: Math.floor(Math.random() * 50) + 10,
      prediction_count: Math.floor(Math.random() * 100) + 20,
      performance,
      growth: parseFloat((Math.random() * 20 - 5).toFixed(1)) // -5% to +15%
    }
  }).sort((a, b) => b.average_yield - a.average_yield) // Sort by yield descending
}

const generateMockRecentSubmissions = (limit = 20) => {
  const farmers = ["Muhinzi", "Jean Baptiste", "Marie Claire", "Patrick", "Grace", "Emmanuel", "Ange", "David"]
  const districts = ["Kamonyi", "Huye", "Gasabo", "Kicukiro", "Bugesera", "Kayonza", "Musanze", "Rubavu"]

  return Array.from({ length: limit }, (_, index) => ({
    id: index + 1,
    farmer_name: farmers[Math.floor(Math.random() * farmers.length)],
    district: districts[Math.floor(Math.random() * districts.length)],
    actual_yield: parseFloat((1.5 + Math.random() * 3).toFixed(2)), // 1.5 to 4.5 t/ha
    submitted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 7 days
    crop_type: "Maize",
    season: ["Season A", "Season B", "Season C"][Math.floor(Math.random() * 3)],
    status: ["pending", "approved", "verified"][Math.floor(Math.random() * 3)]
  }))
}

// Custom hook for data management
const useAdminData = () => {
  const [dashboardStats, setDashboardStats] = useState(null)
  const [farmers, setFarmers] = useState({ farmers: [], total: 0, page: 1, total_pages: 0 })
  const [yieldTrends, setYieldTrends] = useState([])
  const [regionalStats, setRegionalStats] = useState([])
  const [recentSubmissions, setRecentSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState({
    regional: 'checking',
    yield: 'checking',
    farmers: 'checking',
    submissions: 'checking'
  })

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getDashboardStats()
      setDashboardStats(data)
    } catch (err) {
      console.error('Dashboard stats error:', err)
      // Set default stats if API fails
      setDashboardStats({
        total_farmers: 0,
        active_farmers: 0,
        total_predictions: 0,
        average_yield: 0,
        active_rate: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchFarmers = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true)
      const data = await adminApi.getFarmers(page, 10, search, status)
      console.log('📊 Farmers data received:', data)

      // Transform the API data to match our frontend structure
      const transformedFarmers = {
        farmers: data.farmers?.map(farmer => ({
          id: farmer.id || Math.random().toString(36).substr(2, 9), // Generate ID if not provided
          name: farmer.fullname,
          phone: farmer.phone_number,
          district: farmer.district,
          status: farmer.is_active ? 'active' : 'inactive',
          points: farmer.points,
          created_at: farmer.created_at,
          last_login: farmer.last_login,
          prediction_count: farmer.prediction_count,
          submission_count: farmer.submission_count,
          latest_yield: farmer.latest_yield,
          email: farmer.email || 'No email' // Add email if available
        })) || [],
        total: data.total || 0,
        page: data.page || 1,
        total_pages: data.total_pages || 1
      }

      console.log('🔄 Transformed farmers data:', transformedFarmers)
      setFarmers(transformedFarmers)
      setApiStatus(prev => ({ ...prev, farmers: 'success' }))
    } catch (err) {
      console.error('Farmers fetch error:', err)
      setApiStatus(prev => ({ ...prev, farmers: 'error' }))
      // Set empty state with mock data for development
      setFarmers({
        farmers: [
          {
            id: 1,
            name: "Muhinzi",
            phone: "+250725169531",
            district: "Kamonyi",
            status: "active",
            points: 15,
            created_at: "2025-11-01T19:14:25.021000",
            last_login: "2025-11-01T21:56:29.126000",
            prediction_count: 6,
            submission_count: 3,
            latest_yield: 2,
            email: "No email"
          },
          {
            id: 2,
            name: "Admin",
            phone: "+250791459051",
            district: "Huye",
            status: "active",
            points: 0,
            created_at: "2025-10-31T23:59:09.051000",
            last_login: "2025-10-31T23:59:52.946000",
            prediction_count: 0,
            submission_count: 0,
            latest_yield: null,
            email: "No email"
          }
        ],
        total: 2,
        page: 1,
        total_pages: 1
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchYieldTrends = async (days = 30) => {
    try {
      setLoading(true)
      const data = await adminApi.getYieldTrends(days)
      console.log('Yield trends data:', data)

      // Handle different response formats
      let trends = []
      if (Array.isArray(data)) {
        trends = data
      } else if (data.trends && Array.isArray(data.trends)) {
        trends = data.trends
      } else if (data.data && Array.isArray(data.data)) {
        trends = data.data
      } else {
        trends = generateMockYieldTrends(days)
      }

      setYieldTrends(trends)
      setApiStatus(prev => ({ ...prev, yield: 'success' }))
    } catch (err) {
      console.error('Yield trends error:', err)
      setApiStatus(prev => ({ ...prev, yield: 'error' }))
      const mockTrends = generateMockYieldTrends(days)
      setYieldTrends(mockTrends)
    } finally {
      setLoading(false)
    }
  }

  const fetchRegionalStats = async () => {
    try {
      setLoading(true)
      console.log('🔄 Starting regional stats fetch...')
      const data = await adminApi.getRegionalStats()
      console.log('📊 Regional stats data received:', data)

      // Handle different response formats
      let regions = []
      if (Array.isArray(data)) {
        regions = data
      } else if (data.regions && Array.isArray(data.regions)) {
        regions = data.regions
      } else if (data.data && Array.isArray(data.data)) {
        regions = data.data
      } else if (data.regional_stats && Array.isArray(data.regional_stats)) {
        regions = data.regional_stats
      } else {
        console.warn('Unexpected regional stats format, using mock data')
        regions = generateMockRegionalStats()
      }

      console.log('✅ Processed regional stats:', regions)
      setRegionalStats(regions)
      setApiStatus(prev => ({ ...prev, regional: 'success' }))
    } catch (err) {
      console.error('💥 Regional stats fetch failed:', err)
      setApiStatus(prev => ({ ...prev, regional: 'error' }))
      const mockRegions = generateMockRegionalStats()
      console.log('🔄 Setting mock regional stats:', mockRegions)
      setRegionalStats(mockRegions)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentSubmissions = async (limit = 20) => {
    try {
      setLoading(true)
      console.log('🔄 Fetching recent submissions...')
      const data = await adminApi.getRecentSubmissions(limit)
      console.log('📊 Recent submissions data received:', data)

      // Handle different response formats
      let submissions = []
      if (Array.isArray(data)) {
        submissions = data
      } else if (data.submissions && Array.isArray(data.submissions)) {
        submissions = data.submissions
      } else if (data.data && Array.isArray(data.data)) {
        submissions = data.data
      } else {
        console.warn('Unexpected submissions format, using mock data')
        submissions = generateMockRecentSubmissions(limit)
      }

      console.log('✅ Processed recent submissions:', submissions)
      setRecentSubmissions(submissions)
      setApiStatus(prev => ({ ...prev, submissions: 'success' }))
    } catch (err) {
      console.error('💥 Recent submissions fetch failed:', err)
      setApiStatus(prev => ({ ...prev, submissions: 'error' }))
      const mockSubmissions = generateMockRecentSubmissions(limit)
      console.log('🔄 Setting mock recent submissions:', mockSubmissions)
      setRecentSubmissions(mockSubmissions)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setLoading(true)
      const blob = await adminApi.exportFarmersData()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `farmers_data_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to export data - feature not available')
      console.error('Export error:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    dashboardStats,
    farmers,
    yieldTrends,
    regionalStats,
    recentSubmissions,
    loading,
    error,
    apiStatus,
    fetchDashboardStats,
    fetchFarmers,
    fetchYieldTrends,
    fetchRegionalStats,
    fetchRecentSubmissions,
    handleExportData,
    setError,
  }
}

// Enhanced visualization components
const YieldTrendChart = ({ data, period = '30 days' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No yield trend data available
      </div>
    )
  }

  const maxYield = Math.max(...data.map(d => d.average_yield || 0))
  const minYield = Math.min(...data.map(d => d.average_yield || 0))
  const range = maxYield - minYield

  return (
    <div className="relative h-64">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500 pr-2">
        <span>{maxYield.toFixed(1)}t</span>
        <span>{(maxYield - range * 0.25).toFixed(1)}t</span>
        <span>{(maxYield - range * 0.5).toFixed(1)}t</span>
        <span>{(maxYield - range * 0.75).toFixed(1)}t</span>
        <span>{minYield.toFixed(1)}t</span>
      </div>

      {/* Chart area */}
      <div className="ml-8 h-full flex items-end justify-between gap-2 pb-8">
        {data.slice(-15).map((point, index) => {
          const height = range > 0 ? ((point.average_yield - minYield) / range) * 100 : 50
          const date = new Date(point.date)
          const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="w-full relative" style={{ height: "180px" }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-lg transition-all duration-300 cursor-pointer hover:opacity-80"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(to top, #598216, #6fa01e)`,
                    minHeight: '4px'
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    <div>{point.average_yield?.toFixed(2)} t/ha</div>
                    <div className="text-slate-300">{displayDate}</div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-2 text-center leading-tight">
                {displayDate}
              </span>
            </div>
          )
        })}
      </div>

      {/* Statistics summary */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-slate-500">Current</div>
            <div className="text-lg font-bold" style={{ color: "#598216" }}>
              {data[data.length - 1]?.average_yield?.toFixed(2) || '0.00'}t
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Average</div>
            <div className="text-lg font-bold text-slate-700">
              {(data.reduce((sum, point) => sum + (point.average_yield || 0), 0) / data.length).toFixed(2)}t
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Trend</div>
            <div className={`text-lg font-bold ${data[data.length - 1]?.average_yield > data[0]?.average_yield ? 'text-green-600' :
                data[data.length - 1]?.average_yield < data[0]?.average_yield ? 'text-red-600' : 'text-gray-600'
              }`}>
              {data[data.length - 1]?.average_yield > data[0]?.average_yield ? '↗' :
                data[data.length - 1]?.average_yield < data[0]?.average_yield ? '↘' : '→'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RegionalPerformanceMap = ({ data, apiStatus }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No regional data available
      </div>
    )
  }

  const maxYield = Math.max(...data.map(region => region.average_yield || 0))

  return (
    <div className="space-y-4">
      {apiStatus.regional === 'error' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-yellow-700">Showing demo data - Regional stats API unavailable</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((region, index) => {
          const performancePercentage = maxYield > 0 ? ((region.average_yield || 0) / maxYield) * 100 : 0
          const getPerformanceColor = (percentage) => {
            if (percentage >= 80) return '#10b981' // green
            if (percentage >= 60) return '#598216' // brand green
            if (percentage >= 40) return '#f59e0b' // amber
            return '#ef4444' // red
          }

          return (
            <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-slate-900">{region.district}</h4>
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: getPerformanceColor(performancePercentage) }}
                >
                  {region.performance || 'Good'}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Average Yield</span>
                    <span className="font-semibold" style={{ color: "#598216" }}>
                      {region.average_yield?.toFixed(2) || '0.00'} t/ha
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${performancePercentage}%`,
                        backgroundColor: getPerformanceColor(performancePercentage)
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <div className="font-semibold text-slate-900">{region.farmers_count || 0}</div>
                    <div className="text-xs text-slate-500">Farmers</div>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <div className="font-semibold text-slate-900">{region.prediction_count || 0}</div>
                    <div className="text-xs text-slate-500">Predictions</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// New component for Recent Submissions
const RecentSubmissionsTable = ({ data, apiStatus }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No recent submissions available
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'verified':
        return 'Verified'
      case 'pending':
        return 'Pending Review'
      case 'rejected':
        return 'Rejected'
      default:
        return status || 'Unknown'
    }
  }

  return (
    <div className="space-y-4">
      {apiStatus.submissions === 'error' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-yellow-700">Showing demo data - Submissions API unavailable</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Farmer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">District</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Crop Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actual Yield</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Season</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Submitted</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((submission) => (
              <tr key={submission.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{submission.farmer_name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{submission.district}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{submission.crop_type || 'Maize'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-semibold" style={{ color: "#598216" }}>
                    {submission.actual_yield ? `${submission.actual_yield} t/ha` : 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{submission.season || 'Current'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {formatDate(submission.submitted_at)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                    {getStatusText(submission.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PerformanceMetrics = ({ stats, yieldTrends, regionalStats, apiStatus }) => {
  const calculateGrowthRate = () => {
    if (!yieldTrends || yieldTrends.length < 2) return 0
    const first = yieldTrends[0].average_yield || 0
    const last = yieldTrends[yieldTrends.length - 1].average_yield || 0
    if (first === 0) return 0
    return ((last - first) / first) * 100
  }

  const getTopPerformingRegion = () => {
    if (!regionalStats || regionalStats.length === 0) return null
    return regionalStats.reduce((top, region) =>
      (region.average_yield || 0) > (top.average_yield || 0) ? region : top
    )
  }

  const topRegion = getTopPerformingRegion()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* API Status Indicator */}
      {(apiStatus.regional === 'error' || apiStatus.submissions === 'error') && (
        <div className="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-yellow-700">Some features using demo data - APIs temporarily unavailable</span>
          </div>
        </div>
      )}

      {/* Total Farmers Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Farmers</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats?.total_farmers || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e8f3dc" }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#598216" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a3 3 0 00-5.356-1.857M17 20v-2a3 3 0 00-3-3m-6 0v2a3 3 0 005.356 1.857M7 20v-2a3 3 0 013-3m0 0a3 3 0 013-3m-3 3h6" />
            </svg>
          </div>
        </div>
        <p className="text-xs mt-2 font-medium" style={{ color: "#598216" }}>
          ↑ {stats?.active_farmers || 0} active
        </p>
      </div>

      {/* Average Yield Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Average Yield</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats?.average_yield?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">tons/hectare</p>
      </div>

      {/* Growth Rate Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Growth Rate</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {calculateGrowthRate().toFixed(1)}%
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Last 30 days</p>
      </div>

      {/* Top Performing Region Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Top Region</p>
            <p className="text-lg font-bold text-slate-900 mt-2 truncate">
              {topRegion?.district || 'N/A'}
            </p>
            <p className="text-sm" style={{ color: "#598216" }}>
              {topRegion?.average_yield?.toFixed(2) || '0.00'} t/ha
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  } catch {
    return dateString
  }
}

export default function AdminDashboard() {
  const {
    dashboardStats,
    farmers,
    yieldTrends,
    regionalStats,
    recentSubmissions,
    loading,
    error,
    apiStatus,
    fetchDashboardStats,
    fetchFarmers,
    fetchYieldTrends,
    fetchRegionalStats,
    fetchRecentSubmissions,
    handleExportData,
    setError,
  } = useAdminData()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isClient, setIsClient] = useState(false)
  const [yieldPeriod, setYieldPeriod] = useState(30)
  const [activeSection, setActiveSection] = useState('overview') // 'overview' or 'submissions'

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check authentication on component mount
  useEffect(() => {
    if (!isClient) return

    const token = storage.getItem('authToken') || storage.getItem('token')
    if (!token) {
      setError('Not authenticated. Please login first.')
      return
    }

    console.log('🔄 Fetching initial data...')
    fetchDashboardStats()
    fetchFarmers(1)
    fetchYieldTrends(yieldPeriod)
    fetchRegionalStats()
    fetchRecentSubmissions(20)
  }, [isClient])

  // Handle search and filter
  useEffect(() => {
    if (!isClient) return

    const timeoutId = setTimeout(() => {
      fetchFarmers(1, searchTerm, filterStatus)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterStatus, isClient])

  // Handle yield period change
  useEffect(() => {
    if (!isClient) return
    fetchYieldTrends(yieldPeriod)
  }, [yieldPeriod, isClient])

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    fetchFarmers(newPage, searchTerm, filterStatus)
  }

  // Handle logout
  const handleLogout = () => {
    storage.removeItem('authToken')
    storage.removeItem('token')
    storage.removeItem('userRole')
    storage.removeItem('userFullname')
    window.location.href = '/login'
  }

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!isClient) return 'A'
    const fullname = storage.getItem('userFullname')
    return fullname ? fullname.charAt(0).toUpperCase() : 'A'
  }

  // Don't render until client-side to avoid hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading Admin Dashboard...</div>
      </div>
    )
  }

  // Error handling
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {error.includes('authenticated') ? 'Authentication Error' : 'Error'}
          </h2>
          <p className="text-slate-700 mb-4">{error}</p>
          <div className="space-y-3">
            {error.includes('authenticated') ? (
              <>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Reload Page
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setError(null)
                    fetchDashboardStats()
                    fetchFarmers(1)
                    fetchYieldTrends(yieldPeriod)
                    fetchRegionalStats()
                    fetchRecentSubmissions(20)
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Reload Page
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/smartgwizalogo"
                  alt="SmartGwiza Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">SmartGwiza</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setActiveSection('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeSection === 'overview' ? 'text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              style={activeSection === 'overview' ? { backgroundColor: "#598216" } : {}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Dashboard Overview
            </button>

            <button
              onClick={() => setActiveSection('submissions')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeSection === 'submissions' ? 'text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              style={activeSection === 'submissions' ? { backgroundColor: "#598216" } : {}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Recent Submissions
            </button>

            <a
              href="/admin/farmers"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a3 3 0 00-5.356-1.857M17 20v-2a3 3 0 00-3-3m-6 0v2a3 3 0 005.356 1.857M7 20v-2a3 3 0 013-3m0 0a3 3 0 013-3m-3 3h6"
                />
              </svg>
              Farmers
            </a>

            <a
              href="/admin/predictions"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Predictions
            </a>

            <a
              href="/admin/analytics"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Analytics
            </a>

            <a
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </a>
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-slate-200">
            <a
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Home
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full mt-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {activeSection === 'overview' ? 'Dashboard Overview' : 'Recent Yield Submissions'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {activeSection === 'overview'
                      ? 'Real-time monitoring and analytics'
                      : 'Latest yield data submissions from farmers'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative">
                  <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: "#598216" }}
                >
                  {getUserInitial()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {activeSection === 'overview' ? (
            <>
              {/* Performance Metrics */}
              <PerformanceMetrics
                stats={dashboardStats}
                yieldTrends={yieldTrends}
                regionalStats={regionalStats}
                apiStatus={apiStatus}
              />

              {/* Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Yield Trends Over Time */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Yield Trends Over Time</h3>
                      <p className="text-sm text-slate-500 mt-1">Real-time yield monitoring</p>
                    </div>
                    <select
                      value={yieldPeriod}
                      onChange={(e) => setYieldPeriod(parseInt(e.target.value))}
                      className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": "#598216" }}
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </div>
                  <YieldTrendChart data={yieldTrends} period={`${yieldPeriod} days`} />
                </div>

                {/* Regional Performance */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Regional Performance</h3>
                    <p className="text-sm text-slate-500 mt-1">District-wise yield analysis</p>
                  </div>
                  <RegionalPerformanceMap data={regionalStats} apiStatus={apiStatus} />
                </div>
              </div>

              {/* Recent Submissions Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Recent Yield Submissions</h3>
                      <p className="text-sm text-slate-500 mt-1">Latest yield data from farmers</p>
                    </div>
                    <button
                      onClick={() => setActiveSection('submissions')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-90"
                      style={{ backgroundColor: "#598216", color: "white" }}
                    >
                      View All Submissions
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <RecentSubmissionsTable data={recentSubmissions.slice(0, 5)} apiStatus={apiStatus} />
                </div>
              </div>

              {/* Farmers Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Farmer List</h2>
                      <p className="text-sm text-slate-500 mt-1">Manage and monitor all registered farmers</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleExportData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 hover:opacity-90"
                        style={{ backgroundColor: "#598216" }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {loading ? 'Exporting...' : 'Export Data'}
                      </button>

                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        disabled={loading}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                        style={{ "--tw-ring-color": "#598216" }}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search farmers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          disabled={loading}
                          className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 w-64 disabled:opacity-50"
                          style={{ "--tw-ring-color": "#598216" }}
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Farmer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">District</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Predictions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Latest Yield</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {farmers.farmers?.map((farmer) => (
                        <tr key={farmer.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: "#598216" }}>
                                {farmer.name?.split(" ").map((n) => n[0]).join("") || 'F'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">{farmer.name}</div>
                                <div className="text-xs text-slate-500">{farmer.points || 0} points</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{farmer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{farmer.district}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              <div>Predictions: {farmer.prediction_count || 0}</div>
                              <div className="text-xs text-slate-500">Submissions: {farmer.submission_count || 0}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold" style={{ color: "#598216" }}>
                              {farmer.latest_yield ? `${farmer.latest_yield} t/ha` : 'No data'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${farmer.status === "active" ? "" : "bg-slate-100 text-slate-800"}`}
                              style={farmer.status === "active" ? { backgroundColor: "#e8f3dc", color: "#598216" } : {}}>
                              {farmer.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => setSelectedFarmer(farmer)}
                              className="font-medium hover:underline"
                              style={{ color: "#598216" }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading farmers data...</p>
                  </div>
                )}

                {/* Empty State */}
                {!loading && (!farmers.farmers || farmers.farmers.length === 0) && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 00-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No farmers found</h3>
                    <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter criteria.</p>
                  </div>
                )}

                {/* Table Footer */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-700">
                      Showing <span className="font-medium">{farmers.farmers?.length || 0}</span> of{" "}
                      <span className="font-medium">{farmers.total || 0}</span> farmers
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                        className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-slate-700">
                        Page {currentPage} of {farmers.total_pages || 1}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= (farmers.total_pages || 1) || loading}
                        className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Recent Submissions Full View */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Recent Yield Submissions</h2>
                    <p className="text-sm text-slate-500 mt-1">Latest yield data submissions from farmers</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveSection('overview')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Overview
                    </button>
                    <button
                      onClick={() => fetchRecentSubmissions(20)}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 hover:opacity-90"
                      style={{ backgroundColor: "#598216" }}
                    >
                      <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <RecentSubmissionsTable data={recentSubmissions} apiStatus={apiStatus} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Farmer Details Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Farmer Details</h2>
                <p className="text-sm text-slate-500 mt-1">Complete profile and prediction history</p>
              </div>
              <button
                onClick={() => setSelectedFarmer(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
                  style={{ backgroundColor: "#598216" }}
                >
                  {selectedFarmer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedFarmer.name}</h3>
                  <p className="text-sm text-slate-500">{selectedFarmer.phone}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${selectedFarmer.status === "active" ? "" : "bg-slate-100 text-slate-800"
                      }`}
                    style={selectedFarmer.status === "active" ? { backgroundColor: "#e8f3dc", color: "#598216" } : {}}
                  >
                    {selectedFarmer.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#598216" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">District</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{selectedFarmer.district}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#598216" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Points</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{selectedFarmer.points || 0}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#598216" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Joined Date</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatDate(selectedFarmer.created_at)}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#598216" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Last Login</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatDate(selectedFarmer.last_login)}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#598216" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Total Predictions</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{selectedFarmer.prediction_count || 0}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#598216" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Yield Submissions</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{selectedFarmer.submission_count || 0}</p>
                </div>

                <div className="rounded-lg p-4 border-2 col-span-2" style={{ backgroundColor: "#e8f3dc", borderColor: "#c5dba8" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#598216" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm font-medium" style={{ color: "#4a6b12" }}>
                      Latest Yield
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: "#4a6b12" }}>
                    {selectedFarmer.latest_yield ? `${selectedFarmer.latest_yield} t/ha` : 'No yield data available'}
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedFarmer(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: "#598216" }}
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}