"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function UserDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("predict")
    const [districts, setDistricts] = useState([])
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [user, setUser] = useState(null)

    const [formData, setFormData] = useState({
        country: "Rwanda",
        crop: "Maize",
        district: "",
        rainfall_mm: "",
        temperature_c: "",
        soil_ph: "",
        fertilizer_used_kg_per_ha: "",
        pesticide_l_per_ha: "",
        irrigation_type: "",
    })

    const [yieldForm, setYieldForm] = useState({
        district: "",
        rainfall_mm: "",
        temperature_c: "",
        soil_ph: "",
        fertilizer_kg_per_ha: "",
        pesticide_l_per_ha: "",
        irrigation_type: "",
        actual_yield_tons_per_ha: "",
        yield_before: "",
        planting_date: "",
        harvest_date: "",
        notes: "",
        dataConsent: false,
    })

    const [prediction, setPrediction] = useState(null)
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [yieldError, setYieldError] = useState("")
    const [yieldSuccess, setYieldSuccess] = useState("")

    // History states
    const [predictionHistory, setPredictionHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [historyError, setHistoryError] = useState("")

    // Backend URL
    const BACKEND_URL = "https://smartgwiza-be-1.onrender.com"

    // Get user data and token from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = {
                fullname: localStorage.getItem('userFullname') || 'Farmer',
                role: localStorage.getItem('userRole') || 'farmer',
                phone: localStorage.getItem('userPhone') || ''
            }
            setUser(userData)
        }
    }, [])

    // Get token from localStorage
    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken') || localStorage.getItem('token')
        }
        return null
    }

    // Auth headers utility function
    const getAuthHeaders = () => {
        const token = getToken()
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }

    // Fetch Rwanda districts
    useEffect(() => {
        const fetchDistricts = async () => {
            setLoadingDistricts(true)
            try {
                const rwandaDistricts = [
                    "Gasabo", "Nyarugenge", "Kicukiro",
                    "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
                    "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
                    "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango",
                    "Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"
                ]
                setDistricts(rwandaDistricts.sort())
            } catch (error) {
                console.error("Error fetching districts:", error)
                const fallbackDistricts = [
                    "Kigali City", "Gasabo", "Nyarugenge", "Kicukiro",
                    "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
                    "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
                    "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango",
                    "Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"
                ]
                setDistricts(fallbackDistricts.sort())
            } finally {
                setLoadingDistricts(false)
            }
        }

        fetchDistricts()
    }, [])

    // Fetch prediction history
    const fetchPredictionHistory = async () => {
        setLoadingHistory(true)
        setHistoryError("")

        try {
            const token = getToken()
            if (!token) {
                setHistoryError("Please login to view prediction history")
                setLoadingHistory(false)
                return
            }

            const response = await fetch(`${BACKEND_URL}/api/predictions/history?limit=10`, {
                method: "GET",
                headers: getAuthHeaders(),
            })

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`)
            }

            const historyData = await response.json()

            // Handle both array and object response formats
            if (Array.isArray(historyData)) {
                setPredictionHistory(historyData)
            } else if (historyData.predictions && Array.isArray(historyData.predictions)) {
                setPredictionHistory(historyData.predictions)
            } else if (historyData.data && Array.isArray(historyData.data)) {
                setPredictionHistory(historyData.data)
            } else {
                setPredictionHistory([])
            }
        } catch (err) {
            setHistoryError(`Failed to load prediction history: ${err.message}`)
        } finally {
            setLoadingHistory(false)
        }
    }

    // Load history when history tab is active
    useEffect(() => {
        if (activeTab === "history") {
            fetchPredictionHistory()
        }
    }, [activeTab])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleYieldInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setYieldForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handlePredictionSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")
        setPrediction(null)

        try {
            // Check if user is authenticated
            const token = getToken()
            if (!token) {
                setError("Please login first to make predictions")
                setIsSubmitting(false)
                return
            }

            // Validate required fields
            if (!formData.district || !formData.rainfall_mm || !formData.temperature_c ||
                !formData.soil_ph || !formData.fertilizer_used_kg_per_ha || !formData.pesticide_l_per_ha) {
                setError("Please fill in all required fields")
                setIsSubmitting(false)
                return
            }

            // Prepare payload matching API requirements
            const payload = {
                district: formData.district,
                rainfall_mm: Number.parseFloat(formData.rainfall_mm),
                temperature_c: Number.parseFloat(formData.temperature_c),
                soil_ph: Number.parseFloat(formData.soil_ph),
                fertilizer_used_kg_per_ha: Number.parseFloat(formData.fertilizer_used_kg_per_ha),
                pesticide_l_per_ha: Number.parseFloat(formData.pesticide_l_per_ha),
                irrigation_type: formData.irrigation_type,
            }

            const response = await fetch(`${BACKEND_URL}/api/predict`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                let errorMessage = `HTTP error ${response.status}`
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData)
                } catch (parseError) {
                    const errorText = await response.text()
                    errorMessage = errorText || errorMessage
                }
                throw new Error(errorMessage)
            }

            const result = await response.json()

            // The API returns predicted_yield directly in tons/ha
            setPrediction({
                predicted_yield: result.predicted_yield,
                confidence: result.confidence,
                interpretation: result.interpretation,
                prediction_id: result.prediction_id,
                timestamp: result.timestamp
            })

            // Refresh history after new prediction
            if (activeTab === "history") {
                fetchPredictionHistory()
            }
        } catch (err) {
            setError(`Error predicting yield: ${err.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleYieldSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setYieldError("")
        setYieldSuccess("")

        try {
            // Check if user is authenticated
            const token = getToken()
            if (!token) {
                setYieldError("Please login first to submit yield data")
                setIsSubmitting(false)
                return
            }

            // Validate required fields
            const requiredFields = [
                'district', 'rainfall_mm', 'temperature_c', 'soil_ph',
                'irrigation_type', 'actual_yield_tons_per_ha'
            ]

            const missingFields = requiredFields.filter(field => !yieldForm[field])
            if (missingFields.length > 0) {
                setYieldError(`Please fill in all required fields: ${missingFields.join(', ')}`)
                setIsSubmitting(false)
                return
            }

            // Check data consent (frontend-only validation)
            if (!yieldForm.dataConsent) {
                setYieldError("Please agree to allow SmartGwiza to use your data for model improvement")
                setIsSubmitting(false)
                return
            }

            // Prepare payload matching API requirements (exclude dataConsent from backend payload)
            const payload = {
                district: yieldForm.district,
                rainfall_mm: Number.parseFloat(yieldForm.rainfall_mm),
                temperature_c: Number.parseFloat(yieldForm.temperature_c),
                soil_ph: Number.parseFloat(yieldForm.soil_ph),
                fertilizer_kg_per_ha: yieldForm.fertilizer_kg_per_ha ? Number.parseFloat(yieldForm.fertilizer_kg_per_ha) : 0,
                pesticide_l_per_ha: yieldForm.pesticide_l_per_ha ? Number.parseFloat(yieldForm.pesticide_l_per_ha) : 0,
                irrigation_type: yieldForm.irrigation_type,
                actual_yield_tons_per_ha: Number.parseFloat(yieldForm.actual_yield_tons_per_ha),
                yield_before: yieldForm.yield_before ? Number.parseFloat(yieldForm.yield_before) : 0,
                planting_date: yieldForm.planting_date || "",
                harvest_date: yieldForm.harvest_date || "",
                notes: yieldForm.notes || "",
            }

            const response = await fetch(`${BACKEND_URL}/api/data/submit`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                let errorMessage = `HTTP error ${response.status}`
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData)
                } catch (parseError) {
                    const errorText = await response.text()
                    errorMessage = errorText || errorMessage
                }
                throw new Error(errorMessage)
            }

            const result = await response.json()

            // Success - show message and reset form
            setYieldSuccess(result.message || "Yield data submitted successfully! Thank you for contributing.")

            // Reset form
            setYieldForm({
                district: "",
                rainfall_mm: "",
                temperature_c: "",
                soil_ph: "",
                fertilizer_kg_per_ha: "",
                pesticide_l_per_ha: "",
                irrigation_type: "",
                actual_yield_tons_per_ha: "",
                yield_before: "",
                planting_date: "",
                harvest_date: "",
                notes: "",
                dataConsent: false,
            })

            // Clear success message after 5 seconds
            setTimeout(() => {
                setYieldSuccess("")
            }, 5000)

        } catch (err) {
            const errorMessage = err.message || err.toString() || "Unknown error occurred"
            setYieldError(`Error submitting yield data: ${errorMessage}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Get confidence color
    const getConfidenceColor = (confidence) => {
        switch (confidence) {
            case 'high': return 'text-green-600'
            case 'medium': return 'text-yellow-600'
            case 'low': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateString
        }
    }

    // Handle logout
    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            localStorage.removeItem('token')
            localStorage.removeItem('userRole')
            localStorage.removeItem('userFullname')
            localStorage.removeItem('userPhone')
            window.location.href = '/'
        }
    }

    // Calculate statistics for visualization
    const calculateStats = () => {
        if (predictionHistory.length === 0) return null

        const yields = predictionHistory.map(p => p.predicted_yield || p.yield).filter(y => y != null)
        const avgYield = yields.length > 0 ? yields.reduce((a, b) => a + b, 0) / yields.length : 0
        const maxYield = Math.max(...yields)
        const minYield = Math.min(...yields)

        return { avgYield, maxYield, minYield, totalPredictions: predictionHistory.length }
    }

    const stats = calculateStats()

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
                            <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden">
                                <img
                                    src="/images/smartgwizalogo.png"
                                    alt="logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">SmartGwiza</h1>
                                <p className="text-xs text-slate-500">Farmer Dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: "#598216" }}>
                                {user?.fullname?.charAt(0) || 'F'}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{user?.fullname || 'Farmer'}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role || 'farmer'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab("predict")}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === "predict" ? "text-white" : "text-slate-700 hover:bg-slate-100"
                                }`}
                            style={activeTab === "predict" ? { backgroundColor: "#598216" } : {}}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            Predict Yield
                        </button>

                        <button
                            onClick={() => setActiveTab("feedback")}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === "feedback" ? "text-white" : "text-slate-700 hover:bg-slate-100"
                                }`}
                            style={activeTab === "feedback" ? { backgroundColor: "#598216" } : {}}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            Submit Actual Yield
                        </button>

                        <button
                            onClick={() => setActiveTab("history")}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === "history" ? "text-white" : "text-slate-700 hover:bg-slate-100"
                                }`}
                            style={activeTab === "history" ? { backgroundColor: "#598216" } : {}}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Prediction History
                        </button>
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-slate-200">
                        <Link
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
                        </Link>
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
                                        {activeTab === "predict" ? "Maize Crop Yield Prediction" :
                                            activeTab === "feedback" ? "Submit Actual Yield" :
                                                "Prediction History"}
                                    </h1>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {activeTab === "predict"
                                            ? "Get AI-powered predictions for your Maize yield"
                                            : activeTab === "feedback"
                                                ? "Help improve our model with your harvest data"
                                                : "View your prediction history and insights"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                                    style={{ backgroundColor: "#598216" }}
                                >
                                    {user?.fullname?.charAt(0) || 'F'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
                    {activeTab === "predict" && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <form onSubmit={handlePredictionSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            htmlFor="country-input"
                                            className="block text-sm font-medium mb-2"
                                            style={{ color: "#598216" }}
                                        >
                                            Country
                                        </label>
                                        <input
                                            id="country-input"
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            disabled
                                            className="w-full p-3 border rounded-lg bg-gray-100 text-gray-900 cursor-not-allowed"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                                            placeholder="Rwanda"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="crop-input" className="block text-sm font-medium mb-2" style={{ color: "#598216" }}>
                                            Crop
                                        </label>
                                        <input
                                            id="crop-input"
                                            type="text"
                                            name="crop"
                                            value={formData.crop}
                                            disabled
                                            className="w-full p-3 border rounded-lg bg-gray-100 text-gray-900 cursor-not-allowed"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                                            placeholder="Maize"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="district-input" className="blocktext-sm font-medium mb-2" style={{ color: "#598216" }}>
                                            District *
                                        </label>
                                        <select
                                            id="district-input"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                                            onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                                            required
                                        >
                                            <option className="text-black"  disabled value="">Select District</option>
                                            {loadingDistricts ? (
                                                <option disabled>Loading districts...</option>
                                            ) : (
                                                districts.map((district) => (
                                                    <option key={district} value={district}>
                                                        {district}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="rainfall-input" className="block text-sm font-medium mb-2" style={{ color: "#598216" }}>
                                            Rainfall (mm) *
                                        </label>
                                        <input
                                            id="rainfall-input"
                                            type="number"
                                            name="rainfall_mm"
                                            value={formData.rainfall_mm}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                                            onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                                            placeholder="enter value between 500-1400mm"
                                            min="500"
                                            max="1400"
                                            step="0.1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="temp-input" className="block text-sm font-medium mb-2" style={{ color: "#598216" }}>
                                            Temperature (°C) *
                                        </label>
                                        <input
                                            id="temp-input"
                                            type="number"
                                            name="temperature_c"
                                            value={formData.temperature_c}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                                            onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                                            placeholder="enter value between 18-21°C"
                                            min="18"
                                            max="21"
                                            step="0.1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="soil-ph-input" className="block text-sm font-medium mb-2" style={{ color: "#598216" }}>
                                            Soil pH *
                                        </label>
                                        <input
                                            id="soil-ph-input"
                                            type="number"
                                            name="soil_ph"
                                            value={formData.soil_ph}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900"
                                            style={{ borderColor: "rgau(89, 130, 22, 0.3)" }}
                                            onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                                            placeholder="enter value between 6.0-7.0"
                                            min="6.0"
                                            max="7.0"
                                            step="0.1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="fertilizer-input"
                                            className="block text-sm font-medium mb-2"
                                            style={{ color: "#598216" }}
                                        >
                                            NPK Fertilizer Used (kg/ha) *
                                        </label>
                                        <input
                                            id="fertilizer-input"
                                            type="number"
                                            name="fertilizer_used_kg_per_ha"
                                            value={formData.fertilizer_used_kg_per_ha}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                                            onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                                            placeholder="enter value between 60-80kg/ha"
                                            min="60"
                                            max="80"
                                            step="0.1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="pesticide-input"
                                            className="block text-sm font-medium mb-2"
                                            style={{ color: "#598216" }}
                                        >
                                            Pesticide Used (L/ha) *
                                        </label>
                                        <input
                                            id="pesticide-input"
                                            type="number"
                                            name="pesticide_l_per_ha"
                                            value={formData.pesticide_l_per_ha}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                                            onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                                            placeholder="enter value between 7-12l/ha"
                                            min="7"
                                            max="12"
                                            step="0.1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="irrigation-input" className="block text-sm font-medium mb-2" style={{ color: "#598216" }}>
                                            Irrigation Type *
                                        </label>
                                        <select
                                            id="irrigation-input"
                                            name="irrigation_type"
                                            value={formData.irrigation_type}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                                            onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                                            required
                                        >
                                            <option value="Rainfed">Rainfed</option>
                                            <option value="Irrigated">Irrigated</option>
                                        </select>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        <div className="flex items-start gap-2">
                                            <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-6 text-white font-medium rounded-lg transition-opacity disabled:opacity-50 hover:opacity-90"
                                    style={{ backgroundColor: "#598216" }}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </div>
                                    ) : "Predict Yield"}
                                </button>
                            </form>

                            {prediction && (
                                <div className="mt-8 rounded-xl p-6" style={{ backgroundColor: "rgba(89, 130, 22, 0.1)" }}>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Prediction Result</h3>
                                    <div className="space-y-4">
                                        <div
                                            className="flex items-center gap-3 pb-3 border-b"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.2)" }}
                                        >
                                            <div>
                                                <p className="text-xs uppercase font-semibold" style={{ color: "#598216" }}>
                                                    Country
                                                </p>
                                                <p className="font-medium" style={{ color: "#598216" }}>
                                                    {formData.country}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center gap-3 pb-3 border-b"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.2)" }}
                                        >
                                            <div>
                                                <p className="text-xs uppercase font-semibold" style={{ color: "#598216" }}>
                                                    Crop
                                                </p>
                                                <p className="font-medium" style={{ color: "#598216" }}>
                                                    {formData.crop}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center gap-3 pb-3 border-b"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.2)" }}
                                        >
                                            <div>
                                                <p className="text-xs uppercase font-semibold" style={{ color: "#598216" }}>
                                                    District
                                                </p>
                                                <p className="font-medium" style={{ color: "#598216" }}>
                                                    {formData.district}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center gap-3 pb-3 border-b"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.2)" }}
                                        >
                                            <div>
                                                <p className="text-xs uppercase font-semibold" style={{ color: "#598216" }}>
                                                    Rainfall
                                                </p>
                                                <p className="font-medium" style={{ color: "#598216" }}>
                                                    {formData.rainfall_mm} mm
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center gap-3 pb-3 border-b"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.2)" }}
                                        >
                                            <div>
                                                <p className="text-xs uppercase font-semibold" style={{ color: "#598216" }}>
                                                    Irrigation Type
                                                </p>
                                                <p className="font-medium" style={{ color: "#598216" }}>
                                                    {formData.irrigation_type}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="mt-6 bg-white rounded-lg p-4 border"
                                            style={{ borderColor: "rgba(89, 130, 22, 0.2)" }}
                                        >
                                            <p className="text-xs uppercase font-semibold mb-1" style={{ color: "#598216" }}>
                                                Predicted Yield
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-xl" style={{ color: "#598216" }}>
                                                    {prediction.predicted_yield} tons/ha
                                                </p>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Category: </span>
                                                    <span className={`capitalize ${getConfidenceColor(prediction.confidence)}`}>
                                                        {prediction.confidence}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Interpretation: </span>
                                                    {prediction.interpretation}
                                                </p>

                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setPrediction(null)}
                                            className="w-full mt-6 py-3 px-6 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                                            style={{ backgroundColor: "#598216" }}
                                        >
                                            Make Another Prediction
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "feedback" && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Submit Your Actual Yield Data</h2>
                                <p className="text-slate-600">Help improve our prediction model by sharing your actual harvest results.</p>
                            </div>

                            {yieldSuccess && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-green-700 font-medium">{yieldSuccess}</p>
                                    </div>
                                </div>
                            )}

                            {yieldError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <div className="flex items-start gap-2">
                                        <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <p>{yieldError}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleYieldSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Required Fields */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            District <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="district"
                                            value={yieldForm.district}
                                            onChange={handleYieldInputChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                            required
                                        >
                                            <option value="">Select District</option>
                                            {loadingDistricts ? (
                                                <option disabled>Loading districts...</option>
                                            ) : (
                                                districts.map((district) => (
                                                    <option key={district} value={district}>
                                                        {district}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">
                                            Rainfall (mm) 
                                        </label>
                                        <input
                                            type="number"
                                            name="rainfall_mm"
                                            value={yieldForm.rainfall_mm}
                                            onChange={handleYieldInputChange}
                                            placeholder="e.g., 1200"
                                            min="500"
                                            max="2000"
                                            step="0.1"
                                            className="w-full px-4 py-2 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                           
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Temperature (°C) 
                                        </label>
                                        <input
                                            type="number"
                                            name="temperature_c"
                                            value={yieldForm.temperature_c}
                                            onChange={handleYieldInputChange}
                                            placeholder="e.g., 19.5"
                                            min="15"
                                            max="30"
                                            step="0.1"
                                            className="w-full px-4 py-2 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                          
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Soil pH 
                                        </label>
                                        <input
                                            type="number"
                                            name="soil_ph"
                                            value={yieldForm.soil_ph}
                                            onChange={handleYieldInputChange}
                                            placeholder="e.g., 6.5"
                                            min="0"
                                            max="14"
                                            step="0.1"
                                            className="w-full text-black px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                            
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Irrigation Type 
                                        </label>
                                        <select
                                            name="irrigation_type"
                                            value={yieldForm.irrigation_type}
                                            onChange={handleYieldInputChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                            
                                        >
                                            <option value="Rainfed">Rainfed</option>
                                            <option value="Irrigated">Irrigated</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Actual Yield (tons/ha) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            name="actual_yield_tons_per_ha"
                                            value={yieldForm.actual_yield_tons_per_ha}
                                            onChange={handleYieldInputChange}
                                            placeholder="e.g., 1.501"
                                            min="0"
                                            step="0.001"
                                            className="w-full text-black px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                            required
                                        />
                                    </div>

                                    {/* New Yield Before Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Previous Season Yield (tons/ha) 
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            name="yield_before"
                                            value={yieldForm.yield_before}
                                            onChange={handleYieldInputChange}
                                            placeholder="e.g., 1.200"
                                            min="0"
                                            step="0.001"
                                            className="w-full text-black px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Optional Fields */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Fertilizer Used (kg/ha)
                                        </label>
                                        <input
                                            type="number"
                                            name="fertilizer_kg_per_ha"
                                            value={yieldForm.fertilizer_kg_per_ha}
                                            onChange={handleYieldInputChange}
                                            placeholder="e.g., 150"
                                            min="0"
                                            step="0.1"
                                            className="w-full text-black px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Pesticide Used (L/ha) 
                                        </label>
                                        <input
                                            type="number"
                                            name="pesticide_l_per_ha"
                                            value={yieldForm.pesticide_l_per_ha}
                                            onChange={handleYieldInputChange}
                                            placeholder="e.g., 2.5"
                                            min="0"
                                            step="0.1"
                                            className="w-full text-black px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Planting Date <span className="text-gray-400 text-xs">(Optional)</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="planting_date"
                                            value={yieldForm.planting_date}
                                            onChange={handleYieldInputChange}
                                            className="w-full text-black px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Harvest Date <span className="text-gray-400 text-xs">(Optional)</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="harvest_date"
                                            value={yieldForm.harvest_date}
                                            onChange={handleYieldInputChange}
                                            className="w-full px-4 py-2 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Additional Notes <span className="text-gray-400 text-xs">(Optional)</span>
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={yieldForm.notes}
                                            onChange={handleYieldInputChange}
                                            placeholder="Any challenges faced, weather conditions, or other observations..."
                                            rows={4}
                                            className="w-full px-4 text-black py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Data Usage Consent Checkbox - Frontend Only */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h4 className="text-sm font-medium text-green-900">Data Usage Consent</h4>
                                            <p className="text-sm text-green-700 mt-1">Your data helps improve the SmartGwiza AI model for better maize yield prediction in Rwanda. By checking this box, you agree to share your data for model improvement purposes.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <input
                                        type="checkbox"
                                        id="data-consent"
                                        name="dataConsent"
                                        checked={yieldForm.dataConsent || false}
                                        onChange={handleYieldInputChange}
                                        className="mt-1 w-4 h-4 text-green-600 bg-white border-slate-300 rounded focus:ring-green-500 focus:ring-2"
                                        required
                                    />
                                    <label htmlFor="data-consent" className="text-sm text-slate-700">
                                        I agree to allow SmartGwiza to use my submitted data to improve the AI model performance and accuracy for maize yield prediction in Rwanda. *
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !yieldForm.dataConsent}
                                    className="w-full py-3 px-6 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: "#598216" }}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </div>
                                    ) : "Submit Yield Data"}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            {stats && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(89, 130, 22, 0.1)" }}>
                                                <svg className="w-5 h-5" style={{ color: "#598216" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Total Predictions</p>
                                                <p className="text-xl font-bold text-slate-900">{stats.totalPredictions}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(89, 130, 22, 0.1)" }}>
                                                <svg className="w-5 h-5" style={{ color: "#598216" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Average Yield</p>
                                                <p className="text-xl font-bold text-slate-900">{stats.avgYield.toFixed(2)} tons/ha</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(89, 130, 22, 0.1)" }}>
                                                <svg className="w-5 h-5" style={{ color: "#598216" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Highest Yield</p>
                                                <p className="text-xl font-bold text-slate-900">{stats.maxYield.toFixed(2)} tons/ha</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(89, 130, 22, 0.1)" }}>
                                                <svg className="w-5 h-5" style={{ color: "#598216" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Lowest Yield</p>
                                                <p className="text-xl font-bold text-slate-900">{stats.minYield.toFixed(2)} tons/ha</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Prediction History Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900">Recent Predictions</h3>
                                        <button
                                            onClick={fetchPredictionHistory}
                                            disabled={loadingHistory}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-80 disabled:opacity-50"
                                            style={{ backgroundColor: "#598216", color: "white" }}
                                        >
                                            <svg className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            {loadingHistory ? 'Refreshing...' : 'Refresh'}
                                        </button>
                                    </div>
                                </div>

                                {loadingHistory ? (
                                    <div className="p-8 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <p className="text-slate-600">Loading prediction history...</p>
                                        </div>
                                    </div>
                                ) : historyError ? (
                                    <div className="p-6 text-center">
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-700">{historyError}</p>
                                        </div>
                                    </div>
                                ) : predictionHistory.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <h4 className="text-lg font-medium text-slate-900 mb-2">No predictions yet</h4>
                                        <p className="text-slate-600 mb-4">Make your first prediction to see it here!</p>
                                        <button
                                            onClick={() => setActiveTab("predict")}
                                            className="px-6 py-2 text-white font-medium rounded-lg transition-opacity hover:opacity-80"
                                            style={{ backgroundColor: "#598216" }}
                                        >
                                            Make Prediction
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">District</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Predicted Yield</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Confidence</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Irrigation</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {predictionHistory.map((prediction, index) => (
                                                    <tr key={prediction.id || index} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                            {formatDate(prediction.timestamp || prediction.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                            {prediction.inputs.district || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                            {(prediction.predicted_yield || prediction.yield || 0).toFixed(2)} tons/ha
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getConfidenceColor(prediction.confidence)}`}>
                                                                {prediction.interpretation.confidence}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                            {prediction.inputs.irrigation_type || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}