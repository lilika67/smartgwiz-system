"use client"

import { useState } from "react"
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

// List of Rwandan districts
const rwandanDistricts = [
    "Gasabo",
    "Kicukiro",
    "Nyarugenge",
    "Bugesera",
    "Gatsibo",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Nyagatare",
    "Rwamagana",
    "Burera",
    "Gakenke",
    "Gicumbi",
    "Musanze",
    "Rulindo",
    "Gisagara",
    "Huye",
    "Kamonyi",
    "Muhanga",
    "Nyamagabe",
    "Nyanza",
    "Nyaruguru",
    "Karongi",
    "Ngororero",
    "Nyabihu",
    "Nyamasheke",
    "Rubavu",
    "Rusizi",
    "Rutsiro"
];

export function SignupForm({ onSwitchToLogin }) {
    const [fullname, setFullname] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState("farmer")
    const [district, setDistrict] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [phoneError, setPhoneError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [signupError, setSignupError] = useState("")
    const router = useRouter()

    const validateRwandanPhone = (phone) => {
        const rwandanPhoneRegex = /^(\+250|0)?7[0-9]{8}$/
        return rwandanPhoneRegex.test(phone.replace(/\s/g, ""))
    }

    const handlePhoneChange = (e) => {
        const value = e.target.value
        setPhoneNumber(value)

        if (value && !validateRwandanPhone(value)) {
            setPhoneError("Please enter a valid Rwandan phone number")
        } else {
            setPhoneError("")
        }
    }

    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)

        if (confirmPassword && value !== confirmPassword) {
            setPasswordError("Passwords do not match")
        } else {
            setPasswordError("")
        }
    }

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value
        setConfirmPassword(value)

        if (password && value !== password) {
            setPasswordError("Passwords do not match")
        } else {
            setPasswordError("")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSignupError("")
        setPhoneError("")
        setPasswordError("")

        if (!validateRwandanPhone(phoneNumber)) {
            setPhoneError("Please enter a valid Rwandan phone number")
            return
        }

        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters long")
            return
        }

        if (!district) {
            setSignupError("Please select your district")
            return
        }

        try {
            const payload = {
                fullname: fullname,
                phone_number: phoneNumber.replace(/\s/g, ""),
                password: password,
                role: role,
                district: district
            }

            const response = await fetch("https://smartgwiza-be-1.onrender.com/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (response.ok) {
                if (onSwitchToLogin) {
                    onSwitchToLogin()
                } else {
                    router.push("/login")
                }
            } else {
                setSignupError(data.detail || "Signup failed. Please try again.")
            }
        } catch (err) {
            setSignupError(`An error occurred: ${err.message}. Please check if the backend is running.`)
        }
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 grid grid-cols-1 md:grid-cols-2">
                {/* Left Side - Form */}
                <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: "#598216" }} />
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sign Up</h1>
                        </div>
                        <p className="text-gray-500 text-sm">Create your account to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="fullname"
                                type="text"
                                placeholder="Enter your full name"
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                className="w-full h-12 px-4 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="+250 7XX XXX XXX"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                className={`w-full h-12 px-4 border text-black rounded-lg focus:outline-none focus:ring-2 ${phoneError ? "border-red-500" : "border-gray-300"}`}
                                onFocus={(e) => !phoneError && (e.target.style.borderColor = "#598216")}
                                onBlur={(e) => !phoneError && (e.target.style.borderColor = "#d1d5db")}
                                required
                            />
                            {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black"
                                    onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                                    required
                                >
                                    <option value="farmer">Farmer</option>
                                    {/* <option value="admin">Admin</option> */}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                                    District
                                </label>
                                <select
                                    id="district"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black"
                                    onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                                    required
                                >
                                    <option value="">Select District</option>
                                    {rwandanDistricts.map((district) => (
                                        <option key={district} value={district}>
                                            {district}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className="w-full h-12 px-4 pr-10 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                    onFocus={(e) => (e.target.style.borderColor = "#598216")}
                                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className={`w-full h-12 px-4 pr-10 border text-black rounded-lg focus:outline-none focus:ring-2 ${passwordError ? "border-red-500" : "border-gray-300"}`}
                                    onFocus={(e) => !passwordError && (e.target.style.borderColor = "#598216")}
                                    onBlur={(e) => !passwordError && (e.target.style.borderColor = "#d1d5db")}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                        </div>

                        {signupError && <p className="text-xs text-red-500">{signupError}</p>}

                        <button
                            type="submit"
                            style={{ backgroundColor: "#598216" }}
                            className="w-full h-12 hover:opacity-90 text-white font-medium rounded-lg transition-opacity"
                        >
                            Sign Up
                        </button>

                        {onSwitchToLogin && (
                            <p className="text-center text-sm text-gray-600 mt-4">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={onSwitchToLogin}
                                    className="font-medium hover:underline"
                                    style={{ color: "#598216" }}
                                >
                                    Log in
                                </button>
                            </p>
                        )}
                    </form>
                </div>

                {/* Right Side - Image/Branding */}
                <div
                    className="hidden md:block relative order-1 md:order-2"
                    style={{ background: "linear-gradient(to bottom right, #6a9a1a, #598216, #4a6f12)" }}
                >
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                            <Image src="/images/farmer1.jpg" alt="Farmer in field" fill className="object-cover" priority />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}