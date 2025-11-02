"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

const EyeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
)

const EyeOffIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
)

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

export function LoginForm({ onSwitchToSignup }) {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [phoneError, setPhoneError] = useState("")
    const [loginError, setLoginError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const router = useRouter()

    // Set isClient to true when component mounts on client
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Backend URL - use only one consistent URL
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://smartgwiza-be-1.onrender.com"

    const validateRwandanPhone = (phone) => {
        // Remove all formatting and check if it's a valid Rwandan number
        const cleaned = phone.replace(/\s/g, "").replace(/^\+?250?/, "")
        const rwandanPhoneRegex = /^7[0-9]{8}$/
        return rwandanPhoneRegex.test(cleaned) && cleaned.length === 9
    }

    const formatPhoneForBackend = (phone) => {
        // Convert to +250 format that backend expects
        const cleaned = phone.replace(/\s/g, "").replace(/^\+?250?/, "")
        return `+250${cleaned}`
    }

    const handlePhoneChange = (e) => {
        const value = e.target.value
        setPhoneNumber(value)

        if (value && !validateRwandanPhone(value)) {
            setPhoneError("Please enter a valid Rwandan phone number (e.g., 078 123 4567)")
        } else {
            setPhoneError("")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoginError("")
        setPhoneError("")
        setIsLoading(true)

        // Final validation
        if (!validateRwandanPhone(phoneNumber)) {
            setPhoneError("Please enter a valid Rwandan phone number")
            setIsLoading(false)
            return
        }

        if (!password) {
            setLoginError("Please enter your password")
            setIsLoading(false)
            return
        }

        try {
            const formattedPhone = formatPhoneForBackend(phoneNumber)

            const payload = {
                phone_number: formattedPhone,
                password: password,
            }

            console.log("Sending login request:", {
                url: `${BACKEND_URL}/api/auth/login`,
                payload: { ...payload, password: "***" } // Hide password in logs
            })

            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()
            console.log("Login response:", { status: response.status, data })

            if (response.ok) {
                // Store authentication data
                storage.setItem("authToken", data.access_token)
                storage.setItem("token", data.access_token)
                storage.setItem("userRole", data.role)
                storage.setItem("userFullname", data.fullname || "")
                storage.setItem("userPhone", formattedPhone)

                console.log("Login successful! User role:", data.role)

                // Redirect based on role
                if (data.role === "farmer") {
                    router.push("/userdashboard")
                } else if (data.role === "admin") {
                    router.push("/admin")
                } else {
                    // Default redirect
                    router.push("/")
                }
            } else {
                // Handle different error formats from backend
                const errorMessage = data.detail || data.message || "Login failed. Please check your credentials."
                setLoginError(errorMessage)

                // Clear form on specific errors
                if (errorMessage.includes("password") || errorMessage.includes("Invalid")) {
                    setPassword("")
                }
            }
        } catch (err) {
            console.error("Login error:", err)
            setLoginError(`Network error: ${err.message}. Please check your internet connection and try again.`)
        } finally {
            setIsLoading(false)
        }
    }

    // Format phone number for display as user types - allow exactly 9 digits after cleaning
    const formatPhoneDisplay = (value) => {
        // Remove all non-digit characters
        const cleaned = value.replace(/\D/g, '')

        // Limit to 9 digits (Rwandan phone numbers without country code)
        const limited = cleaned.slice(0, 9)

        // Format: 078 123 456
        if (limited.length <= 3) {
            return limited
        } else if (limited.length <= 6) {
            return `${limited.slice(0, 3)} ${limited.slice(3)}`
        } else {
            return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`
        }
    }

    const handlePhoneInput = (e) => {
        const value = e.target.value
        const formatted = formatPhoneDisplay(value)
        setPhoneNumber(formatted)

        // Validate the cleaned number
        const cleaned = value.replace(/\D/g, '')
        if (cleaned && !validateRwandanPhone(cleaned)) {
            setPhoneError("Please enter a valid Rwandan phone number (e.g., 0781234567)")
        } else {
            setPhoneError("")
        }
    }

    // Test credentials button for development
    const fillTestCredentials = (role) => {
        if (role === 'farmer') {
            setPhoneNumber("0781234567")
            setPassword("password123")
        } else if (role === 'admin') {
            setPhoneNumber("0798765432")
            setPassword("admin123")
        }
        setLoginError("")
        setPhoneError("")
    }

    // Don't render form until client-side to avoid hydration issues
    if (!isClient) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4">
                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 flex items-center justify-center">
                        <div className="animate-pulse text-gray-500">Loading...</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100"></div>

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 grid grid-cols-1 md:grid-cols-2">
                {/* Left Side - Form */}
                <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                                <img
                                    src="/images/smartgwizalogo"
                                    alt="SmartGwiza Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SmartGwiza</h1>
                                <p className="text-sm text-slate-500">Agricultural Intelligence Platform</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: "#598216" }} />
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h2>
                        </div>
                        <p className="text-gray-500 text-sm">Log in to your account to continue</p>
                    </div>


                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="078 123 4567"
                                value={phoneNumber}
                                onChange={handlePhoneInput}
                                maxLength={12} // 3 + space + 3 + space + 3 = 11 characters max
                                className={`w-full h-12 px-4 border text-black rounded-lg focus:outline-none focus:ring-2 transition-colors ${phoneError ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-green-500 focus:ring-green-200"
                                    }`}
                                required
                            />
                            {phoneError && <p className="text-xs text-red-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                {phoneError}
                            </p>}
                            <p className="text-xs text-gray-500">
                                Enter your 10-digit Rwandan phone number (e.g., 0781234567)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 px-4 pr-10 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-green-500 focus:ring-green-200 transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-600 flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    {loginError}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{ backgroundColor: "#598216" }}
                            className="w-full h-12 hover:opacity-90 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </>
                            ) : (
                                "Log In"
                            )}
                        </button>

                        {onSwitchToSignup && (
                            <p className="text-center text-sm text-gray-600 mt-4">
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    onClick={onSwitchToSignup}
                                    className="font-medium hover:underline transition-colors"
                                    style={{ color: "#598216" }}
                                >
                                    Sign up
                                </button>
                            </p>
                        )}
                    </form>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Secure login
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Data protected
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Image/Branding */}
                <div
                    className="hidden md:block relative"
                    style={{ background: "linear-gradient(to bottom right, #6a9a1a, #598216, #4a6f12)" }}
                >
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="/images/fam.jpg"
                                alt="Farmer in field"
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/20"></div>

                            {/* Content on image */}
                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <h3 className="text-2xl font-bold mb-2">Smart Agriculture</h3>
                                <p className="text-sm opacity-90">
                                    Empowering farmers with AI-powered yield predictions and insights for better harvests.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-8 left-8 w-16 h-16 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-8 right-8 w-12 h-12 bg-white/10 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full"></div>
                </div>
            </div>
        </div>
    )
}

export default LoginForm