"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { format, subDays, parseISO, isValid } from 'date-fns'
import { useRouter } from "next/navigation"

// Professional Icons Component
const Icons = {
    Dashboard: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    Farmers: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Submissions: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Analytics: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    Refresh: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    Download: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Logout: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    Close: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Menu: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    User: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Chart: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    Yield: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    Prediction: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    Location: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Email: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    Phone: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    ),
    Calendar: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Time: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Check: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    Warning: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    Search: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Filter: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
    )
}

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
    }
}

const BACKEND_URL = "https://smartgwiza-be-1.onrender.com"

// Safe date formatting function
const safeFormatDate = (dateString, formatString = 'MMM d, HH:mm') => {
    if (!dateString) return 'Unknown'

    try {
        const date = new Date(dateString)
        if (isValid(date)) {
            return format(date, formatString)
        }
        return 'Invalid Date'
    } catch (error) {
        console.error('Date formatting error:', error)
        return 'Date Error'
    }
}

// Safe date parsing for trends
const safeParseTrendDate = (dateString) => {
    if (!dateString) return new Date()

    try {
        const date = parseISO(dateString)
        if (isValid(date)) {
            return date
        }
        return new Date()
    } catch (error) {
        console.error('Date parsing error:', error)
        return new Date()
    }
}

// Enhanced Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-4 border border-[#598216]/20 rounded-lg shadow-xl backdrop-blur-sm">
                <p className="font-bold text-[#598216] text-sm mb-2">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-600">Avg Yield:</span>
                        <span className="font-bold text-[#598216] text-sm">{data.average_yield} t/ha</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-600">Submissions:</span>
                        <span className="font-bold text-blue-600 text-sm">{data.submission_count}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

// Yield Comparison Tooltip
const YieldComparisonTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const improvement = ((data.actual_yield - data.yield_before) / data.yield_before * 100).toFixed(1);

        return (
            <div className="bg-white p-4 border border-[#598216]/20 rounded-lg shadow-xl backdrop-blur-sm">
                <p className="font-bold text-[#598216] text-sm mb-2">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-600">Traditional way:</span>
                        <span className="font-bold text-red-600 text-sm">{data.yield_before} t/ha</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-600">Using SmartGwiza:</span>
                        <span className="font-bold text-green-600 text-sm">{data.actual_yield} t/ha</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-600">Improvement:</span>
                        <span className="font-bold text-[#598216] text-sm">+{improvement}%</span>
                    </div>
                    {data.district && (
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-600">District:</span>
                            <span className="font-bold text-blue-600 text-sm">{data.district}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

// Bar Chart Tooltip
const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-[#598216]/20 rounded-lg shadow-lg">
                <p className="font-bold text-[#598216] text-sm">{label}</p>
                <p className="text-sm text-gray-600">
                    Farmers: <span className="font-bold text-[#598216]">{payload[0].value}</span>
                </p>
            </div>
        )
    }
    return null
}

// Yield Distribution Tooltip
const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-[#598216]/20 rounded-lg shadow-lg">
                <p className="font-bold text-[#598216] text-sm">{payload[0].name}</p>
                <p className="text-sm text-gray-600">
                    Farms: <span className="font-bold text-[#598216]">{payload[0].value}</span>
                </p>
            </div>
        )
    }
    return null
}

// Color palette for charts
const CHART_COLORS = {
    primary: '#598216',
    primaryLight: '#6B9C21',
    primaryDark: '#4A6D12',
    secondary: '#8BC34A',
    accent: '#CDDC39',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    before: '#EF4444',
    after: '#10B981'
}

const yieldRanges = [
    { name: '0-1 t/ha', min: 0, max: 1, color: CHART_COLORS.danger },
    { name: '1-2 t/ha', min: 1, max: 2, color: CHART_COLORS.warning },
    { name: '2-3 t/ha', min: 2, max: 3, color: CHART_COLORS.secondary },
    { name: '3-4 t/ha', min: 3, max: 4, color: CHART_COLORS.primaryLight },
    { name: '4+ t/ha', min: 4, max: Infinity, color: CHART_COLORS.primary }
];

export default function AdminDashboard() {
    const [farmers, setFarmers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("All")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedFarmer, setSelectedFarmer] = useState(null)
    const [yieldTrends, setYieldTrends] = useState([])
    const [recentSubmissions, setRecentSubmissions] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [authToken, setAuthToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isClient, setIsClient] = useState(false)
    const [trendDays, setTrendDays] = useState(30)
    const [loadingTrends, setLoadingTrends] = useState(false)
    const [loadingSubmissions, setLoadingSubmissions] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")
    const [stats, setStats] = useState({
        total_farmers: 0,
        active_farmers: 0,
        total_predictions: 0,
        average_yield: 0,
        active_rate: 0,
        total_submissions: 0
    })
    const [loadingStats, setLoadingStats] = useState(false)
    const [yieldComparisonData, setYieldComparisonData] = useState([])
    const [platformImpactStats, setPlatformImpactStats] = useState(null)
    const [loadingComparison, setLoadingComparison] = useState(false)
    const [initialLoadComplete, setInitialLoadComplete] = useState(false)
    const router = useRouter()

    // Get auth headers
    const getAuthHeaders = () => {
        const token = authToken || getToken()
        if (!token) {
            console.warn('No auth token available')
            return {
                "Content-Type": "application/json"
            }
        }

        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }

    const getToken = () => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("authToken") || localStorage.getItem("token")
        }
        return null
    }

    // New function to fetch all data at once
    const fetchAllData = async () => {
        try {
            setLoading(true)
            await Promise.all([
                fetchFarmers(),
                fetchYieldTrends(30),
                fetchRecentSubmissions(),
                fetchStats(),
                fetchYieldComparisonData()
            ])
            setInitialLoadComplete(true)
        } catch (error) {
            console.error('Error fetching all data:', error)
            setError('Failed to load dashboard data. Please refresh the page.')
        } finally {
            setLoading(false)
        }
    }

    // Check authentication on component mount
    useEffect(() => {
        setIsClient(true)

        const token = getToken()
        const userRole = storage.getItem("userRole")
        const userFullname = storage.getItem("userFullname")
        const userPhone = storage.getItem("userPhone")

        if (!token) {
            setError("Please log in to access the dashboard")
            setLoading(false)
            router.push("/login")
            return
        }

        if (userRole !== "admin") {
            setError("Access denied. Admin privileges required.")
            setLoading(false)
            if (userRole === "farmer") {
                router.push("/userdashboard")
            } else {
                router.push("/login")
            }
            return
        }

        setAuthToken(token)
        setUser({
            name: userFullname || "Admin",
            phone: userPhone,
            role: userRole
        })

        // Fetch all data immediately
        fetchAllData()
    }, [router])

    // Fetch yield comparison data - Updated for your API
    const fetchYieldComparisonData = async () => {
        const token = authToken || getToken()
        if (!token) {
            console.warn('No auth token, skipping yield comparison fetch')
            return
        }

        setLoadingComparison(true)
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/submissions/recent?limit=50`, {
                method: "GET",
                headers: getAuthHeaders(),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch yield comparison data: ${response.status}`)
            }

            const data = await response.json()

            // Process the data for comparison charts
            const comparisonData = processYieldComparisonData(data.submissions || data)
            setYieldComparisonData(comparisonData.processedData)
            setPlatformImpactStats(comparisonData.stats)

        } catch (err) {
            console.error('❌ Fetch yield comparison error:', err)
        } finally {
            setLoadingComparison(false)
        }
    }

    // Process yield comparison data - Updated for your API structure
    const processYieldComparisonData = (submissions) => {
        if (!submissions || !Array.isArray(submissions)) {
            return { processedData: [], stats: null }
        }

        // Filter submissions that have both yield_before and actual_yield_tons_per_ha
        const validSubmissions = submissions.filter(sub =>
            sub.yield_before && sub.actual_yield_tons_per_ha &&
            sub.yield_before > 0 && sub.actual_yield_tons_per_ha > 0
        )

        if (validSubmissions.length === 0) {
            return { processedData: [], stats: null }
        }

        // Process data for charts
        const processedData = validSubmissions.map((sub, index) => {
            const yieldBefore = Number(sub.yield_before) || 0
            const yieldAfter = Number(sub.actual_yield_tons_per_ha) || 0
            const improvement = yieldBefore > 0 ? ((yieldAfter - yieldBefore) / yieldBefore * 100) : 0

            return {
                id: sub._id || index,
                farmer: sub.user_name || "Unknown Farmer",
                district: sub.district || "Unknown",
                yield_before: yieldBefore,
                actual_yield: yieldAfter,
                improvement: Number(improvement.toFixed(1)),
                submission_date: safeFormatDate(sub.submission_date, 'MMM dd'),
                rainfall: sub.rainfall_mm,
                temperature: sub.temperature_c,
                soil_ph: sub.soil_ph
            }
        })

        // Calculate platform impact statistics
        const totalImprovement = processedData.reduce((sum, item) => sum + item.improvement, 0)
        const avgImprovement = totalImprovement / processedData.length
        const avgYieldBefore = processedData.reduce((sum, item) => sum + item.yield_before, 0) / processedData.length
        const avgYieldAfter = processedData.reduce((sum, item) => sum + item.actual_yield, 0) / processedData.length

        const stats = {
            totalComparisons: processedData.length,
            avgImprovement: avgImprovement.toFixed(1),
            avgYieldBefore: avgYieldBefore.toFixed(2),
            avgYieldAfter: avgYieldAfter.toFixed(2),
            totalYieldIncrease: (avgYieldAfter - avgYieldBefore).toFixed(2),
            maxImprovement: Math.max(...processedData.map(item => item.improvement)).toFixed(1),
            minImprovement: Math.min(...processedData.map(item => item.improvement)).toFixed(1)
        }

        return { processedData, stats }
    }

    // Manual refresh function
    const refreshAllData = () => {
        fetchAllData()
    }

    // Fetch stats from the API
    const fetchStats = async () => {
        const token = authToken || getToken()
        if (!token) {
            console.warn('No auth token, skipping stats fetch')
            return
        }

        setLoadingStats(true)
        try {
            console.log("📊 Fetching stats from:", `${BACKEND_URL}/api/admin/stats`)

            const response = await fetch(`${BACKEND_URL}/api/admin/stats`, {
                method: "GET",
                headers: getAuthHeaders(),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch stats: ${response.status}`)
            }

            const data = await response.json()
            console.log("📊 Stats data received:", data)

            setStats(data)

        } catch (err) {
            console.error('❌ Fetch stats error:', err)
            // Set default stats to prevent UI breaking
            setStats({
                total_farmers: 0,
                active_farmers: 0,
                total_predictions: 0,
                average_yield: 0,
                active_rate: 0,
                total_submissions: 0
            })
        } finally {
            setLoadingStats(false)
        }
    }

    // Fetch farmers from the actual admin endpoint
    const fetchFarmers = async (pageNum = 1) => {
        const token = authToken || getToken()
        if (!token) {
            setError("Authentication required")
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            console.log(" Fetching farmers from:", `${BACKEND_URL}/api/admin/farmers?page=${pageNum}&limit=10`)

            const response = await fetch(`${BACKEND_URL}/api/admin/farmers?page=${pageNum}&limit=10`, {
                method: "GET",
                headers: getAuthHeaders(),
            })

            console.log(" Farmers API response status:", response.status)

            if (response.status === 401) {
                handleLogout()
                throw new Error("Session expired. Please log in again.")
            }

            if (response.status === 403) {
                throw new Error("Access denied. Admin privileges required.")
            }

            if (!response.ok) {
                const errorText = await response.text()
                console.error(" Server error response:", errorText)
                throw new Error(`Failed to fetch farmers: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log(" Farmers data received:", data)

            const farmersData = data.farmers || data.data || data || []
            setFarmers(farmersData)

            const total = data.total || data.count || farmersData.length
            setTotalPages(Math.ceil(total / 10))
            setPage(pageNum)

        } catch (err) {
            console.error(' Fetch farmers error:', err)
            setError(err.message)

            if (err.message.includes("Session expired") || err.message.includes("Access denied")) {
                setTimeout(() => {
                    router.push("/login")
                }, 2000)
            }
        } finally {
            setLoading(false)
        }
    }

    // Fetch yield trends from the backend
    const fetchYieldTrends = async (days = 30) => {
        const token = authToken || getToken()
        if (!token) {
            console.warn('No auth token, skipping yield trends fetch')
            return
        }

        setLoadingTrends(true)
        try {
            console.log(` Fetching yield trends for ${days} days...`)

            const response = await fetch(`${BACKEND_URL}/api/admin/yield-trends?days=${days}`, {
                method: "GET",
                headers: getAuthHeaders(),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch yield trends: ${response.status}`)
            }

            const data = await response.json()
            console.log(" Yield trends received:", data)

            const processedTrends = processYieldTrends(data.trends || data)
            setYieldTrends(processedTrends)

        } catch (err) {
            console.error(' Fetch yield trends error:', err)
        } finally {
            setLoadingTrends(false)
        }
    }

    // Fetch recent submissions
    const fetchRecentSubmissions = async () => {
        const token = authToken || getToken()
        if (!token) {
            console.warn('No auth token, skipping recent submissions fetch')
            return
        }

        setLoadingSubmissions(true)
        try {
            console.log(" Fetching recent submissions...")

            const response = await fetch(`${BACKEND_URL}/api/admin/submissions/recent?limit=20`, {
                method: "GET",
                headers: getAuthHeaders(),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch recent submissions: ${response.status}`)
            }

            const data = await response.json()
            console.log(" Recent submissions received:", data)

            const submissions = (data.submissions || data.data || data || [])
                .map(submission => ({
                    ...submission,
                    created_at: submission.created_at || submission.timestamp || submission.submitted_at || new Date().toISOString(),
                    user_name: submission.user_name || submission.fullname || "Unknown Farmer",
                    district: submission.district || "Unknown District",
                    phone: submission.phone || submission.phone_number || "N/A"
                }))

            setRecentSubmissions(submissions)

        } catch (err) {
            console.error('❌ Fetch recent submissions error:', err)
        } finally {
            setLoadingSubmissions(false)
        }
    }

    // Process yield trends data for better visualization
    const processYieldTrends = (trends) => {
        if (!trends || !Array.isArray(trends)) return []

        return trends.map(trend => ({
            ...trend,
            formattedDate: safeFormatDate(trend.date, 'MMM dd'),
            average_yield: Number(trend.average_yield) || 0,
            submission_count: Number(trend.submission_count) || 0,
            min_yield: Number(trend.min_yield) || 0,
            max_yield: Number(trend.max_yield) || 0,
            safeDate: safeParseTrendDate(trend.date)
        })).sort((a, b) => a.safeDate - b.safeDate)
    }

    // Calculate yield distribution for pie chart
    const calculateYieldDistribution = () => {
        const yieldValues = farmers
            .map(f => parseFloat(f.yield || f.average_yield || f.predicted_yield || 0))
            .filter(yieldValue => yieldValue > 0);

        const distribution = yieldRanges.map(range => {
            const count = yieldValues.filter(yieldValue => yieldValue >= range.min && yieldValue < range.max).length;
            return {
                name: range.name,
                value: count,
                color: range.color
            };
        });

        return distribution.filter(item => item.value > 0);
    }

    // Calculate yield statistics for gauge chart
    const calculateYieldStats = () => {
        const yieldValues = farmers
            .map(f => parseFloat(f.yield || f.average_yield || f.predicted_yield || 0))
            .filter(yieldValue => yieldValue > 0);

        if (yieldValues.length === 0) {
            return {
                average: 0,
                min: 0,
                max: 0,
                totalFarms: 0
            };
        }

        return {
            average: (yieldValues.reduce((a, b) => a + b, 0) / yieldValues.length).toFixed(2),
            min: Math.min(...yieldValues).toFixed(2),
            max: Math.max(...yieldValues).toFixed(2),
            totalFarms: yieldValues.length
        };
    }

    // Process submission type for display
    const getSubmissionType = (submission) => {
        if (submission.actual_yield_tons_per_ha) return "Yield Data"
        if (submission.predicted_yield) return "Prediction"
        return "Unknown"
    }

    // Get submission value for display
    const getSubmissionValue = (submission) => {
        if (submission.actual_yield_tons_per_ha) return `${submission.actual_yield_tons_per_ha} t/ha`
        if (submission.predicted_yield) return `${submission.predicted_yield} t/ha`
        return "N/A"
    }

    // Get submission color based on type
    const getSubmissionColor = (submission) => {
        if (submission.actual_yield_tons_per_ha) return "text-blue-600 bg-blue-100"
        if (submission.predicted_yield) return "text-green-600 bg-green-100"
        return "text-gray-600 bg-gray-100"
    }

    // Logout function
    const handleLogout = () => {
        storage.removeItem("authToken")
        storage.removeItem("token")
        storage.removeItem("userRole")
        storage.removeItem("userFullname")
        storage.removeItem("userPhone")
        setAuthToken(null)
        setUser(null)
        setFarmers([])
        setYieldTrends([])
        setRecentSubmissions([])
        setStats({
            total_farmers: 0,
            active_farmers: 0,
            total_predictions: 0,
            average_yield: 0,
            active_rate: 0,
            total_submissions: 0
        })
        setYieldComparisonData([])
        setPlatformImpactStats(null)
        setInitialLoadComplete(false)
        router.push("/login")
    }

    // Handle tab change
    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        setSidebarOpen(false)

        if (tabId === "farmers") {
            fetchFarmers()
        } else if (tabId === "submissions") {
            fetchRecentSubmissions()
            fetchStats()
        } else if (tabId === "overview") {
            fetchYieldTrends(trendDays)
            fetchStats()
            fetchYieldComparisonData()
        } else if (tabId === "analytics") {
            fetchStats()
            fetchYieldComparisonData()
        }
    }

    // Filter logic for farmers
    const filteredFarmers = farmers.filter(farmer => {
        const matchesSearch =
            farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.phone?.includes(searchTerm) ||
            farmer.phone_number?.includes(searchTerm) ||
            farmer.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.email?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = filterStatus === "All" || farmer.status === filterStatus
        return matchesSearch && matchesStatus
    })

    // Stats calculations - now using API data
    const totalFarmers = stats.total_farmers || farmers.length
    const activeFarmers = stats.active_farmers || farmers.filter(f => f.status === "Active" || f.is_active).length
    const avgYield = stats.average_yield || (farmers.length > 0
        ? (farmers.reduce((sum, f) => sum + parseFloat(f.yield || f.average_yield || f.predicted_yield || 0), 0) / farmers.length).toFixed(2)
        : "0.00")

    // Calculate trends statistics
    const trendsStats = yieldTrends.length > 0 ? {
        totalSubmissions: yieldTrends.reduce((sum, trend) => sum + trend.submission_count, 0),
        avgYieldAllTime: (yieldTrends.reduce((sum, trend) => sum + trend.average_yield, 0) / yieldTrends.length).toFixed(2),
        maxYield: Math.max(...yieldTrends.map(t => t.max_yield)),
        trending: yieldTrends.length > 1 ?
            (yieldTrends[yieldTrends.length - 1].average_yield - yieldTrends[0].average_yield).toFixed(2) : 0
    } : null

    // Calculate submissions statistics - now using API data
    const submissionsStats = {
        total: stats.total_submissions || recentSubmissions.length,
        yieldSubmissions: recentSubmissions.filter(s => s.actual_yield_tons_per_ha).length,
        predictions: stats.total_predictions || recentSubmissions.filter(s => s.predicted_yield).length,
        todaySubmissions: recentSubmissions.filter(s => {
            try {
                const submissionDate = new Date(s.created_at)
                const today = new Date()
                return submissionDate.toDateString() === today.toDateString()
            } catch {
                return false
            }
        }).length
    }

    // CSV Export for farmers
    const downloadCSV = () => {
        const headers = ["Name", "Phone", "Email", "Location", "Yield (t/ha)", "Status", "Last Updated"]
        const rows = filteredFarmers.map(f => [
            f.name || f.fullname || 'N/A',
            f.phone || f.phone_number || 'N/A',
            f.email || 'N/A',
            f.location || f.district || 'N/A',
            f.latest_yield || 'N/A',
            f.status || (f.is_active ? 'Active' : 'Inactive'),
            safeFormatDate(f.lastPrediction || f.updated_at || f.created_at, 'yyyy-MM-dd HH:mm')
        ])
        const csv = [headers, ...rows].map(r => r.map(field => `"${field}"`).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `smartgwiza-farmers-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const yieldDistribution = calculateYieldDistribution();
    const yieldStats = calculateYieldStats();

    // Don't render until client-side
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                <div className="animate-pulse text-[#598216]">Loading dashboard...</div>
            </div>
        )
    }

    // Show loading/error state
    if (loading && !initialLoadComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#598216] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#598216]">Loading admin dashboard...</p>
                </div>
            </div>
        )
    }

    if (error && !authToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.Warning />
                    </div>
                    <h2 className="text-xl font-bold text-red-900 mb-2">Access Required</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-6 py-3 bg-[#598216] text-white rounded-lg hover:bg-[#4a6d12] transition font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-6 border-b border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#598216] to-[#4a6d12] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            SG
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#598216]">SmartGwiza</h1>
                            <p className="text-xs text-[#598216]">Admin Portal</p>
                        </div>
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    {[
                        { id: "overview", label: "Dashboard Overview", icon: Icons.Dashboard },
                        { id: "farmers", label: "Farmers Management", icon: Icons.Farmers },
                        { id: "submissions", label: "Submissions", icon: Icons.Submissions },
                        { id: "analytics", label: "Analytics", icon: Icons.Analytics },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === item.id ? "bg-[#598216] text-white" : "text-[#598216] hover:bg-green-50"}`}
                        >
                            <item.icon />
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User info in sidebar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-200 bg-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#598216] rounded-full flex items-center justify-center text-white font-bold">
                            <Icons.User />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#598216] truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-[#598216] truncate">{user?.phone || 'Admin Account'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium flex items-center justify-center gap-2"
                    >
                        <Icons.Logout />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 lg:ml-64">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-green-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                            <Icons.Menu />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-[#598216]">
                                {activeTab === "overview" ? "Dashboard Overview" :
                                    activeTab === "farmers" ? "Farmers Management" :
                                        activeTab === "submissions" ? "Submissions Management" :
                                            "Analytics & Reports"}
                            </h1>
                            <p className="text-sm text-[#598216]">
                                {activeTab === "overview" ? "Real-time farmer management & yield analytics" :
                                    activeTab === "farmers" ? "Manage and monitor farmer accounts and data" :
                                        activeTab === "submissions" ? "View and manage farmer submissions and predictions" :
                                            "Detailed analytics and insights for platform performance"}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {authToken && (
                                <div className="hidden sm:flex items-center gap-3">
                                    <span className="text-sm text-[#598216]">
                                        {user?.name || 'Admin'}
                                    </span>
                                    <div className="w-10 h-10 bg-[#598216] rounded-full flex items-center justify-center text-white font-bold">
                                        <Icons.User />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="p-6 space-y-8">
                    {/* Stats Cards - Show on overview and submissions tabs */}
                    {(activeTab === "overview" || activeTab === "submissions") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    label: "Total Farmers",
                                    value: loading || loadingStats ? "..." : stats.total_farmers,
                                    icon: Icons.Farmers,
                                    description: "Registered farmers"
                                },
                                {
                                    label: "Active Farmers",
                                    value: loading || loadingStats ? "..." : `${stats.active_farmers} (${stats.active_rate}%)`,
                                    icon: Icons.Check,
                                    description: "Currently active"
                                },
                                {
                                    label: "Avg Yield",
                                    value: loading || loadingStats ? "..." : `${stats.average_yield} t/ha`,
                                    icon: Icons.Chart,
                                    description: "Average yield across all submissions"
                                },
                                {
                                    label: "Total Predictions",
                                    value: loading || loadingStats ? "..." : stats.total_predictions,
                                    icon: Icons.Prediction,
                                    description: "Total predictions on smartGwiza"
                                }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#598216]">{stat.label}</p>
                                            <p className="text-3xl font-bold text-[#598216] mt-2">{stat.value}</p>
                                            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                                        </div>
                                        <div className="text-4xl text-[#598216]">
                                            <stat.icon />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Icons.Warning />
                                </div>
                                <div className="flex-1">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-600 hover:text-red-800 transition"
                                >
                                    <Icons.Close />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Overview Tab Content */}
                    {activeTab === "overview" && (
                        <>
                            {/* Platform Impact Analysis Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#598216]">Platform Impact Analysis</h3>
                                        <p className="text-sm text-[#598216]">Yield improvement before vs after using SmartGwiza</p>
                                    </div>
                                    <button
                                        onClick={refreshAllData}
                                        disabled={loading}
                                        className="px-4 py-2 bg-[#598216] text-white rounded-lg hover:bg-[#4a6d12] transition text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <Icons.Refresh />
                                                Refresh
                                            </>
                                        )}
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="h-80 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-12 h-12 border-4 border-[#598216] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-[#598216]">Loading platform data...</p>
                                        </div>
                                    </div>
                                ) : loadingComparison ? (
                                    <div className="h-80 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-12 h-12 border-4 border-[#598216] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-[#598216]">Loading impact analysis...</p>
                                        </div>
                                    </div>
                                ) : !platformImpactStats || platformImpactStats.totalComparisons === 0 ? (
                                    <div className="h-80 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Icons.Chart />
                                            </div>
                                            <h4 className="text-lg font-medium text-[#598216] mb-2">No comparison data available</h4>
                                            <p className="text-[#598216]">Platform impact data will appear here as farmers submit before/after yield data.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Impact Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-red-600">{platformImpactStats.avgYieldBefore} t/ha</div>
                                                    <div className="text-sm text-red-600 mt-1">Avg Yield Before</div>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-600">{platformImpactStats.avgYieldAfter} t/ha</div>
                                                    <div className="text-sm text-green-600 mt-1">Avg Yield After</div>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-[#598216]/10 to-[#598216]/5 rounded-xl p-4 border border-[#598216]/20">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-[#598216]">+{platformImpactStats.avgImprovement}%</div>
                                                    <div className="text-sm text-[#598216] mt-1">Avg Improvement</div>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600">{platformImpactStats.totalComparisons}</div>
                                                    <div className="text-sm text-blue-600 mt-1">Farmers Compared</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Yield Comparison Charts */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Before vs After Bar Chart */}
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Yield Comparison: Before vs After</h4>
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={yieldComparisonData.slice(0, 8)}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                                                            <XAxis
                                                                dataKey="farmer"
                                                                tick={{ fontSize: 10 }}
                                                                angle={-45}
                                                                textAnchor="end"
                                                                height={60}
                                                            />
                                                            <YAxis tick={{ fontSize: 10 }} />
                                                            <Tooltip content={<YieldComparisonTooltip />} />
                                                            <Legend />
                                                            <Bar
                                                                dataKey="yield_before"
                                                                fill={CHART_COLORS.before}
                                                                radius={[2, 2, 0, 0]}
                                                                name="Traditional way"
                                                            />
                                                            <Bar
                                                                dataKey="actual_yield"
                                                                fill={CHART_COLORS.after}
                                                                radius={[2, 2, 0, 0]}
                                                                name="Using SmartGwiza"
                                                            />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {/* Improvement Trend Chart */}
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Improvement Distribution</h4>
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={yieldComparisonData.slice(0, 8)}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                                                            <XAxis
                                                                dataKey="farmer"
                                                                tick={{ fontSize: 10 }}
                                                                angle={-45}
                                                                textAnchor="end"
                                                                height={60}
                                                            />
                                                            <YAxis tick={{ fontSize: 10 }} />
                                                            <Tooltip
                                                                content={({ active, payload, label }) => {
                                                                    if (active && payload && payload.length) {
                                                                        const data = payload[0].payload;
                                                                        return (
                                                                            <div className="bg-white p-3 border border-[#598216]/20 rounded-lg shadow-lg">
                                                                                <p className="font-bold text-[#598216] text-sm">{label}</p>
                                                                                <p className="text-sm text-gray-600">
                                                                                    Improvement: <span className="font-bold text-[#598216]">+{data.improvement}%</span>
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }}
                                                            />
                                                            <Bar
                                                                dataKey="improvement"
                                                                fill={CHART_COLORS.primary}
                                                                radius={[2, 2, 0, 0]}
                                                                name="Improvement %"
                                                            />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Impact Metrics */}
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                                                <div className="text-lg font-bold text-orange-600">+{platformImpactStats.totalYieldIncrease} t/ha</div>
                                                <div className="text-sm text-orange-600 mt-1">Total Yield Increase</div>
                                            </div>
                                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                                                <div className="text-lg font-bold text-purple-600">{platformImpactStats.maxImprovement}%</div>
                                                <div className="text-sm text-purple-600 mt-1">Max Improvement</div>
                                            </div>
                                            <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl p-4 text-center">
                                                <div className="text-lg font-bold text-cyan-600">{platformImpactStats.minImprovement}%</div>
                                                <div className="text-sm text-cyan-600 mt-1">Min Improvement</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Yield Trends Over Time */}
                            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#598216]">Yield Trends Over Time</h3>
                                        <p className="text-sm text-[#598216]">Average yield progression across submissions</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 lg:mt-0">
                                        <select
                                            value={trendDays}
                                            onChange={(e) => {
                                                setTrendDays(Number(e.target.value))
                                                fetchYieldTrends(Number(e.target.value))
                                            }}
                                            className="px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-[#598216] focus:border-transparent"
                                        >
                                            <option value={7}>Last 7 days</option>
                                            <option value={30}>Last 30 days</option>
                                            <option value={90}>Last 90 days</option>
                                        </select>
                                    </div>
                                </div>

                                {loadingTrends ? (
                                    <div className="h-80 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-12 h-12 border-4 border-[#598216] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-[#598216]">Loading yield trends...</p>
                                        </div>
                                    </div>
                                ) : yieldTrends.length === 0 ? (
                                    <div className="h-80 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Icons.Chart />
                                            </div>
                                            <h4 className="text-lg font-medium text-[#598216] mb-2">No trend data available</h4>
                                            <p className="text-[#598216]">Yield trends will appear here over time.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={yieldTrends}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                                                <XAxis
                                                    dataKey="formattedDate"
                                                    tick={{ fill: '#598216', fontSize: 12 }}
                                                />
                                                <YAxis
                                                    tick={{ fill: '#598216', fontSize: 12 }}
                                                    label={{ value: 'Yield (t/ha)', angle: -90, position: 'insideLeft' }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="average_yield"
                                                    stroke="#598216"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#598216', strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, fill: '#4a6d12' }}
                                                    name="Average Yield"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Recent Submissions Preview */}
                            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#598216]">Recent Submissions</h3>
                                        <p className="text-sm text-[#598216]">Latest farmer activity and submissions</p>
                                    </div>
                                    <button
                                        onClick={() => handleTabChange("submissions")}
                                        className="px-4 py-2 text-[#598216] hover:text-[#4a6d12] font-medium text-sm hover:underline"
                                    >
                                        View All →
                                    </button>
                                </div>

                                {loadingSubmissions ? (
                                    <div className="h-40 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-8 h-8 border-2 border-[#598216] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-[#598216]">Loading submissions...</p>
                                        </div>
                                    </div>
                                ) : recentSubmissions.length === 0 ? (
                                    <div className="h-40 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Icons.Submissions />
                                            </div>
                                            <p className="text-[#598216]">No recent submissions</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentSubmissions.slice(0, 5).map((submission, index) => (
                                            <div key={submission.id || index} className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:bg-green-50 transition">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSubmissionColor(submission)}`}>
                                                        {getSubmissionType(submission) === "Yield Data" ? <Icons.Chart /> : <Icons.Prediction />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#598216]">
                                                            {submission.user_name || "Unknown Farmer"}
                                                        </p>
                                                        <p className="text-sm text-[#598216]">
                                                            {getSubmissionType(submission)} • {submission.district || "Unknown District"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-[#598216]">{getSubmissionValue(submission)}</p>
                                                    <p className="text-xs text-[#598216]">
                                                        {safeFormatDate(submission.created_at, 'MMM d, HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Farmers Tab Content */}
                    {activeTab === "farmers" && (
                        <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
                            <div className="p-6 border-b border-green-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#598216]">Farmers Management</h2>
                                        <p className="text-sm text-[#598216]">
                                            {filteredFarmers.length} farmers found • Page {page} of {totalPages}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={downloadCSV}
                                            className="px-4 py-2 bg-[#598216] text-white rounded-lg hover:bg-[#4a6d12] transition text-sm font-medium flex items-center gap-2"
                                        >
                                            <Icons.Download />
                                            Export CSV
                                        </button>
                                        <select
                                            value={filterStatus}
                                            onChange={e => setFilterStatus(e.target.value)}
                                            className="px-4 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-[#598216] focus:border-transparent"
                                        >
                                            <option value="All">All Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                        <div className="relative">
                                            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search farmers..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-green-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-[#598216] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="inline-block w-12 h-12 border-4 border-[#598216] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 text-[#598216]">Loading farmer data...</p>
                                </div>
                            ) : filteredFarmers.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icons.Farmers />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#598216] mb-2">No farmers found</h3>
                                    <p className="text-[#598216]">
                                        {searchTerm || filterStatus !== "All"
                                            ? "Try adjusting your search or filter criteria"
                                            : "No farmer data available"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-green-50">
                                                <tr>
                                                    {["Farmer", "Phone", "Location", "Yield(t/ha)", "Status", "Last Activity", "Actions"].map(h => (
                                                        <th key={h} className="px-6 py-4 text-left text-xs font-bold text-[#598216]  tracking-wider">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-green-100">
                                                {filteredFarmers.map((farmer, index) => (
                                                    <tr key={farmer.id || farmer._id || index} className="hover:bg-green-50 transition">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-[#598216] rounded-full flex items-center justify-center text-white font-bold">
                                                                    <Icons.User />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-[#598216]">{farmer.name || farmer.fullname || 'Unknown'}</div>

                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-[#598216]">
                                                            {farmer.phone || farmer.phone_number || 'N/A'}
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-[#598216]">
                                                            {farmer.location || farmer.district || 'Unknown'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-[#598216]">
                                                                {farmer.latest_yield || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${(farmer.status === "Active" || farmer.is_active)
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-600"
                                                                }`}>
                                                                {farmer.status || (farmer.is_active ? 'Active' : 'Inactive')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-[#598216]">
                                                            {safeFormatDate(farmer.lastPrediction || farmer.updated_at || farmer.created_at, 'MMM d, HH:mm')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => setSelectedFarmer(farmer)}
                                                                className="text-[#598216] hover:text-[#4a6d12] font-medium text-sm hover:underline"
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="px-6 py-4 bg-green-50 flex items-center justify-between border-t border-green-100">
                                        <p className="text-sm text-[#598216]">
                                            Showing {filteredFarmers.length} of {farmers.length} farmers
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="px-4 py-2 border text-[#598216] border-green-300 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 transition"
                                            >
                                                ← Previous
                                            </button>
                                            <span className="px-4 py-2 text-sm text-[#598216]">
                                                Page {page} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setPage(p => p + 1)}
                                                disabled={page === totalPages}
                                                className="px-4 py-2 border text-[#598216] border-green-300 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 transition"
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Submissions Tab Content */}
                    {activeTab === "submissions" && (
                        <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
                            <div className="p-6 border-b border-green-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#598216]">Submissions Management</h2>
                                        <p className="text-sm text-[#598216]">
                                            {stats.total_submissions} total submissions • {stats.total_predictions} predictions • {submissionsStats.yieldSubmissions} yield data
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={() => {
                                                fetchRecentSubmissions()
                                                fetchStats()
                                            }}
                                            disabled={loadingSubmissions}
                                            className="px-4 py-2 bg-[#598216] text-white rounded-lg hover:bg-[#4a6d12] transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loadingSubmissions ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Refreshing...
                                                </>
                                            ) : (
                                                <>
                                                    <Icons.Refresh />
                                                    Refresh
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loadingSubmissions ? (
                                <div className="p-12 text-center">
                                    <div className="inline-block w-12 h-12 border-4 border-[#598216] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 text-[#598216]">Loading submissions...</p>
                                </div>
                            ) : recentSubmissions.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icons.Submissions />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#598216] mb-2">No submissions found</h3>
                                    <p className="text-[#598216]">
                                        Farmer submissions will appear here as they submit yield data and predictions.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-green-50">
                                            <tr>
                                                {["Farmer", "Type", "District", "Yield Value", "Rainfall", "Temperature", "Date", "Status"].map(h => (
                                                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-[#598216] uppercase tracking-wider">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-green-100">
                                            {recentSubmissions.map((submission, index) => (
                                                <tr key={submission.id || index} className="hover:bg-green-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSubmissionColor(submission)}`}>
                                                                {getSubmissionType(submission) === "Yield Data" ? <Icons.Chart /> : <Icons.Prediction />}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-[#598216]">
                                                                    {submission.user_name || "Unknown Farmer"}
                                                                </div>
                                                                <div className="text-xs text-[#598216]">
                                                                    {submission.phone || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubmissionColor(submission)}`}>
                                                            {getSubmissionType(submission)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#598216]">
                                                        {submission.district || "Unknown"}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-[#598216]">
                                                            {getSubmissionValue(submission)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#598216]">
                                                        {submission.rainfall_mm ? `${submission.rainfall_mm} mm` : "N/A"}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#598216]">
                                                        {submission.temperature_c ? `${submission.temperature_c}°C` : "N/A"}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-[#598216]">
                                                        {safeFormatDate(submission.created_at, 'MMM d, HH:mm')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Completed
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab Content */}
                    {activeTab === "analytics" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                                <h3 className="text-lg font-semibold text-[#598216] mb-4">Platform Analytics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-r from-[#598216]/10 to-[#598216]/5 rounded-xl p-4 border border-[#598216]/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-[#598216] rounded-lg flex items-center justify-center text-white">
                                                <Icons.Farmers />
                                            </div>
                                            <div>
                                                <p className="text-sm text-[#598216]">Total Farmers</p>
                                                <p className="text-2xl font-bold text-[#598216]">{stats.total_farmers}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                                <Icons.Chart />
                                            </div>
                                            <div>
                                                <p className="text-sm text-blue-600">Yield Submissions</p>
                                                <p className="text-2xl font-bold text-blue-700">{stats.total_submissions}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                                                <Icons.Prediction />
                                            </div>
                                            <div>
                                                <p className="text-sm text-purple-600">Predictions</p>
                                                <p className="text-2xl font-bold text-purple-700">{stats.total_predictions}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Regional Distribution Chart */}
                            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                                <h3 className="text-lg font-semibold text-[#598216] mb-4">Regional Distribution</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={Object.entries(
                                                farmers.reduce((acc, farmer) => {
                                                    const region = farmer.location || farmer.district || 'Unknown'
                                                    acc[region] = (acc[region] || 0) + 1
                                                    return acc
                                                }, {})
                                            ).map(([region, count]) => ({ region, count })).slice(0, 8)}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#598216" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#598216" stopOpacity={0.2} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#f0fdf4"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="region"
                                                tick={{ fill: '#598216', fontSize: 11 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis
                                                tick={{ fill: '#598216', fontSize: 11 }}
                                            />
                                            <Tooltip
                                                content={<BarTooltip />}
                                                cursor={{ fill: '#598216', opacity: 0.1 }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="url(#colorCount)"
                                                radius={[4, 4, 0, 0]}
                                                opacity={0.8}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Platform Impact in Analytics */}
                            {platformImpactStats && (
                                <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                                    <h3 className="text-lg font-semibold text-[#598216] mb-4">Platform Impact Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-red-600">{platformImpactStats.avgYieldBefore} t/ha</div>
                                            <div className="text-sm text-red-600 mt-1">Before SmartGwiza</div>
                                        </div>
                                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">{platformImpactStats.avgYieldAfter} t/ha</div>
                                            <div className="text-sm text-green-600 mt-1">After SmartGwiza</div>
                                        </div>
                                        <div className="bg-gradient-to-r from-[#598216]/10 to-[#598216]/5 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-[#598216]">+{platformImpactStats.avgImprovement}%</div>
                                            <div className="text-sm text-[#598216] mt-1">Average Improvement</div>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-600">{platformImpactStats.totalComparisons}</div>
                                            <div className="text-sm text-blue-600 mt-1">Successful Cases</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Farmer Details Modal */}
            {selectedFarmer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFarmer(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-green-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#598216] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        <Icons.User />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#598216]">{selectedFarmer.name || selectedFarmer.fullname || 'Unknown Farmer'}</h2>
                                        <p className="text-[#598216]">
                                            {selectedFarmer.phone || selectedFarmer.phone_number || 'No phone'} • {selectedFarmer.location || selectedFarmer.district || 'Unknown location'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFarmer(null)}
                                    className="p-2 hover:bg-green-100 rounded-lg transition"
                                >
                                    <Icons.Close />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-6">
                            {[
                                
                                { label: "Average Yield", value: `${selectedFarmer.yield || selectedFarmer.average_yield || selectedFarmer.predicted_yield || '0'} t/ha`, icon: Icons.Yield },
            
                                { label: "Phone", value: selectedFarmer.phone || selectedFarmer.phone_number || 'N/A', icon: Icons.Phone },
                                { label: "Location", value: selectedFarmer.location || selectedFarmer.district || 'Unknown', icon: Icons.Location },
                                { label: "Status", value: selectedFarmer.status || (selectedFarmer.is_active ? 'Active' : 'Inactive'), icon: Icons.Chart },
                                { label: "Last Activity", value: safeFormatDate(selectedFarmer.lastPrediction || selectedFarmer.updated_at || selectedFarmer.created_at, 'MMM d, yyyy HH:mm'), icon: Icons.Time },
                                { label: "Account Created", value: safeFormatDate(selectedFarmer.created_at, 'MMM d, yyyy'), icon: Icons.Calendar },
                            ].map((item, i) => (
                                <div key={i} className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl text-[#598216]">
                                            <item.icon />
                                        </span>
                                        <div>
                                            <p className="text-sm text-[#598216]">{item.label}</p>
                                            <p className="text-lg font-bold text-[#598216]">{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                       
                    </div>
                </div>
            )}
        </div>
    )
}