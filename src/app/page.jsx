"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import {
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Database,
  ArrowRight,
  Leaf,
  Sun,
  Cloud,
  Droplets,
  Thermometer,
} from "lucide-react"
import FarmerSlideshow from "../components/farmer-slideshow"
import VisualizationSection from "../components/visualization-section"
import { LoginForm } from "../components/login-form"
import { SignupForm } from "../components/signup-form"

export default function Home() {
  // State variables
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false)
  const [isRetrainModalOpen, setIsRetrainModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    country: "Rwanda",
    crop: "Maize",
    year: "2025",
    pesticides_tonnes: "1200",
    avg_temp: "19.5",
  })
  const [prediction, setPrediction] = useState(null)
  const [retrainResult, setRetrainResult] = useState(null)
  const [activeSection, setActiveSection] = useState("hero")
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [theme, setTheme] = useState("light")
  const [animateHero, setAnimateHero] = useState(false)
  const [isRetraining, setIsRetraining] = useState(false)

  const heroRef = useRef(null)
  const howItWorksRef = useRef(null)
  const visualizationRef = useRef(null)
  const uploadRef = useRef(null)
  const formRef = useRef(null)

  // Handle initial animations
  useEffect(() => {
    setTimeout(() => {
      setAnimateHero(true)
    }, 300)
  }, [])

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      const sections = [
        { id: "hero", ref: heroRef },
        { id: "how-it-works", ref: howItWorksRef },
        { id: "visualization", ref: visualizationRef },
      ]

      for (const section of sections) {
        if (!section.ref.current) continue
        const rect = section.ref.current.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section.id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // File handling functions
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile)
      setError("")
    } else {
      setError("Please upload a CSV file")
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile)
      setError("")
    } else {
      setError("Please upload a CSV file")
    }
  }

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Convert numerical prediction to category
  const getYieldCategory = (yieldTonsHa) => {
    if (yieldTonsHa < 1.5) return "Low"
    if (yieldTonsHa <= 2.5) return "Medium"
    return "High"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError("")
      const submitButton = e.target.querySelector('button[type="submit"]')
      if (submitButton) {
        submitButton.disabled = true
        submitButton.innerHTML =
          '<svg class="animate-spin h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...'
      }

      const payload = {
        year: Number.parseInt(formData.year),
        pesticides_tonnes: Number.parseFloat(formData.pesticides_tonnes),
        avg_temp: Number.parseFloat(formData.avg_temp),
      }
      console.log("Sending payload:", payload)

      const response = await fetch("https://smartgwizas.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error ${response.status}`)
      }

      const result = await response.json()
      console.log("Response data:", result)

      const yieldTonsHa = result.predicted_yield / 10000

      setPrediction({
        value: yieldTonsHa.toFixed(3),
        category: getYieldCategory(yieldTonsHa),
        warning: result.warning || null,
      })

      setIsFormModalOpen(false)
      setIsResultsModalOpen(true)

      const successNotification = document.createElement("div")
      successNotification.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 z-50"
      successNotification.innerHTML = `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Prediction successful!`
      document.body.appendChild(successNotification)
      setTimeout(() => document.body.removeChild(successNotification), 5000)
    } catch (err) {
      console.error("Fetch error:", err)
      setError(`Error predicting: ${err.message}`)
    } finally {
      const submitButton = document.querySelector('button[type="submit"]')
      if (submitButton) {
        submitButton.disabled = false
        submitButton.innerHTML = "Predict Yield"
      }
    }
  }

  const handleRetrainWithExistingData = async () => {
    try {
      setIsRetraining(true)
      setError("")

      const response = await fetch("https://smartgwizas.onrender.com/retrain/", {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        setRetrainResult(result)
        setIsRetrainModalOpen(false)

        const successNotification = document.createElement("div")
        successNotification.className =
          "fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 z-50"
        successNotification.innerHTML = `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Model retrained successfully!`
        document.body.appendChild(successNotification)

        setTimeout(() => {
          document.body.removeChild(successNotification)
          const visualizationSection = document.getElementById("visualization")
          if (visualizationSection) {
            visualizationSection.scrollIntoView({ behavior: "smooth" })
          }
        }, 5000)
      } else {
        setError(result.detail || "Retraining failed.")
      }
    } catch (err) {
      setError("Error retraining: " + err.message)
    } finally {
      setIsRetraining(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a CSV file to upload")
      return
    }

    setIsUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("https://smartgwizas.onrender.com/upload/", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadMessage(result.message || "File uploaded and model retrained!")
        setFile(null)
        setRetrainResult(result)

        const successNotification = document.createElement("div")
        successNotification.className =
          "fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 z-50"
        successNotification.innerHTML = `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> ${result.message || "File uploaded and model retrained!"}`
        document.body.appendChild(successNotification)
        setTimeout(() => document.body.removeChild(successNotification), 5000)
      } else {
        setError(result.detail || "Upload failed.")
      }
    } catch (err) {
      setError("Error uploading file: " + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleBackToForm = () => {
    setIsResultsModalOpen(false)
    setIsFormModalOpen(true)
  }

  const openRetrainModal = () => {
    setIsRetrainModalOpen(true)
  }

  // Scroll to section function
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
    setShowMobileMenu(false)
  }

  return (
    <main className={`flex min-h-screen flex-col ${theme === "dark" ? "dark" : ""}`}>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl py-2 border-b border-green-100/20 dark:border-green-900/20"
            : "bg-transparent py-3 sm:py-4"
          }`}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
            <div className={`relative transition-all duration-700 ${isScrolled ? "scale-90" : "scale-100"}`}>
              <div className="absolute -inset-2 bg-gradient-to-r from-[#598216] via-[#6a9a1a] to-[#598216] rounded-full opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700 animate-pulse"></div>
              <img
                src="/images/smartgwizalogo.png"
                alt="SmartGwiza Logo"
                className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full object-contain relative z-10 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-2 ring-transparent group-hover:ring-[#598216]/30"
              />
            </div>
            <span
              className={`text-base sm:text-lg lg:text-xl font-bold transition-all duration-700 ${isScrolled ? "text-gray-800 dark:text-white" : "text-white"
                } group-hover:scale-105`}
            >
              Smart<span style={{ color: "#598216" }}>Gwiza</span>
            </span>
          </div>

          {/* Desktop Navigation - Enhanced with lg breakpoint */}
          <nav className="hidden lg:flex items-center gap-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl rounded-full px-3 py-2 shadow-xl border border-white/20 dark:border-gray-700/20">
            <button
              onClick={() => scrollToSection("hero")}
              className={`relative px-4 xl:px-5 py-2.5 text-sm font-medium transition-all duration-500 rounded-full ${activeSection === "hero"
                  ? "text-white scale-105"
                  : isScrolled
                    ? "text-[#598216] dark:text-[#6a9a1a] hover:text-[#4a6f12] dark:hover:text-[#598216] hover:scale-105"
                    : "text-white/90 hover:text-white hover:scale-105"
                }`}
            >
              {activeSection === "hero" && (
                <>
                  <span
                    className="absolute inset-0 rounded-full transition-all duration-500"
                    style={{
                      background: "linear-gradient(135deg, #598216 0%, #6a9a1a 50%, #598216 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 3s ease-in-out infinite",
                    }}
                  ></span>
                  <span className="absolute inset-0 bg-[#598216] rounded-full blur-lg opacity-50 animate-pulse"></span>
                </>
              )}
              <span className="relative z-10">Home</span>
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className={`relative px-4 xl:px-5 py-2.5 text-sm font-medium transition-all duration-500 rounded-full ${activeSection === "how-it-works"
                  ? "text-white scale-105"
                  : isScrolled
                    ? "text-[#598216] dark:text-[#6a9a1a] hover:text-[#4a6f12] dark:hover:text-[#598216] hover:scale-105"
                    : "text-white/90 hover:text-white hover:scale-105"
                }`}
            >
              {activeSection === "how-it-works" && (
                <>
                  <span
                    className="absolute inset-0 rounded-full transition-all duration-500"
                    style={{
                      background: "linear-gradient(135deg, #598216 0%, #6a9a1a 50%, #598216 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 3s ease-in-out infinite",
                    }}
                  ></span>
                  <span className="absolute inset-0 bg-[#598216] rounded-full blur-lg opacity-50 animate-pulse"></span>
                </>
              )}
              <span className="relative z-10">How It Works</span>
            </button>
            <button
              onClick={() => scrollToSection("visualization")}
              className={`relative px-4 xl:px-5 py-2.5 text-sm font-medium transition-all duration-500 rounded-full ${activeSection === "visualization"
                  ? "text-white scale-105"
                  : isScrolled
                    ? "text-[#598216] dark:text-[#6a9a1a] hover:text-[#4a6f12] dark:hover:text-[#598216] hover:scale-105"
                    : "text-white/90 hover:text-white hover:scale-105"
                }`}
            >
              {activeSection === "visualization" && (
                <>
                  <span
                    className="absolute inset-0 rounded-full transition-all duration-500"
                    style={{
                      background: "linear-gradient(135deg, #598216 0%, #6a9a1a 50%, #598216 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 3s ease-in-out infinite",
                    }}
                  ></span>
                  <span className="absolute inset-0 bg-[#598216] rounded-full blur-lg opacity-50 animate-pulse"></span>
                </>
              )}
              <span className="relative z-10">Visualization</span>
            </button>
            {/* CHANGE: Added Blog navigation link */}
            <Link
              href="/blog"
              className={`relative px-4 xl:px-5 py-2.5 text-sm font-medium transition-all duration-500 rounded-full ${isScrolled
                  ? "text-[#598216] dark:text-[#6a9a1a] hover:text-[#4a6f12] dark:hover:text-[#598216] hover:scale-105"
                  : "text-white/90 hover:text-white hover:scale-105"
                }`}
            >
              <span className="relative z-10">Blog</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className={`hidden sm:block px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 text-xs sm:text-sm rounded-full font-medium transition-all duration-500 hover:scale-110 active:scale-95 ${isScrolled
                  ? "text-[#598216] dark:text-[#6a9a1a] hover:bg-[#598216]/10 dark:hover:bg-[#598216]/20 ring-1 ring-[#598216]/20 hover:ring-[#598216]/40"
                  : "text-white hover:bg-white/10 ring-1 ring-white/20 hover:ring-white/40"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="hidden sm:flex group relative px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 text-xs sm:text-sm rounded-full font-medium text-white transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden shadow-lg hover:shadow-2xl items-center"
              style={{
                background: isScrolled ? "linear-gradient(135deg, #598216 0%, #4a6f12 100%)" : undefined,
                backgroundColor: isScrolled ? undefined : "white",
                color: isScrolled ? "white" : "#598216",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: "linear-gradient(135deg, #6a9a1a 0%, #598216 50%, #6a9a1a 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              ></span>
              <span className="absolute inset-0 bg-[#598216] rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></span>
              <span className="relative z-10 flex items-center">
                <span className="hidden md:inline">Predict Yield(national-level) </span>
                <span className="md:hidden">Predict</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-3 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-0 top-1 w-6 h-0.5 rounded-full transition-all duration-300 ${isScrolled ? "bg-gray-800 dark:bg-white" : "bg-white"
                    } ${showMobileMenu ? "rotate-45 top-2.5" : ""}`}
                ></span>
                <span
                  className={`absolute left-0 top-2.5 w-6 h-0.5 rounded-full transition-all duration-300 ${isScrolled ? "bg-gray-800 dark:bg-white" : "bg-white"
                    } ${showMobileMenu ? "opacity-0" : ""}`}
                ></span>
                <span
                  className={`absolute left-0 top-4 w-6 h-0.5 rounded-full transition-all duration-300 ${isScrolled ? "bg-gray-800 dark:bg-white" : "bg-white"
                    } ${showMobileMenu ? "-rotate-45 top-2.5" : ""}`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl rounded-b-2xl mt-2 py-4 px-3 sm:px-4 border-t border-green-100/20 dark:border-green-900/20 animate-slide-down">
            <nav className="flex flex-col space-y-2">
              {[
                { id: "hero", label: "Home", delay: "0ms" },
                { id: "how-it-works", label: "How It Works", delay: "75ms" },
                { id: "visualization", label: "Visualization", delay: "150ms" },
                { id: "blog", label: "Blog", delay: "225ms" }, // Added Blog link
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left px-4 py-3.5 rounded-xl font-medium transition-all duration-500 transform hover:scale-[1.02] min-h-[44px] ${activeSection === item.id
                      ? "text-white shadow-lg ring-2 ring-[#598216]/30"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  style={{
                    backgroundColor: activeSection === item.id ? "#598216" : undefined,
                    animation: `slideIn 0.5s ease-out ${item.delay} both`,
                  }}
                >
                  {item.label}
                </button>
              ))}

              <div className="sm:hidden flex flex-col gap-2 pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true)
                    setShowMobileMenu(false)
                  }}
                  className="text-left px-4 py-3.5 rounded-xl font-medium transition-all duration-500 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 min-h-[44px]"
                  style={{
                    animation: "slideIn 0.5s ease-out 300ms both",
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsFormModalOpen(true)
                    setShowMobileMenu(false)
                  }}
                  className="text-left px-4 py-3.5 rounded-xl font-medium transition-all duration-500 text-white shadow-lg min-h-[44px]"
                  style={{
                    backgroundColor: "#598216",
                    animation: "slideIn 0.5s ease-out 375ms both",
                  }}
                >
                  Predict Yield(national-level)
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="relative w-full h-screen overflow-hidden">
        <FarmerSlideshow />
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-6 bg-gradient-to-r from-black/70 via-black/50 to-black/40 text-white">
          <div className="max-w-4xl px-4 text-center relative z-10">
            <div
              className={`transition-all duration-1000 transform ${animateHero ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Predict Maize Yield with{" "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(to right, #6a9a1a, #598216)" }}
                >
                  AI
                </span>
              </h1>
            </div>
            <div
              className={`transition-all duration-1000 delay-300 transform ${animateHero ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">
                Empowering Rwandan farmers with data-driven insights for sustainable maize production
              </p>
            </div>
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-500 transform ${animateHero ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <button
                onClick={() => setIsLoginModalOpen(true)}
                style={{ background: "linear-gradient(to right, #598216, #4a6f12)" }}
                className="group flex items-center justify-center gap-2 px-8 py-4 hover:opacity-90 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span>Predict yield(farmer-level)</span>
                <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
            <div
              className={`mt-16 transition-all duration-1000 delay-700 transform ${animateHero ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-white/80 hover:text-white group relative"
              >
                <span className="flex flex-col items-center">
                  <span className="mb-2">Explore More</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 animate-bounce group-hover:animate-none group-hover:translate-y-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/5 animate-float-slow">
              <Sun className="h-8 w-8 text-yellow-400/70" />
            </div>
            <div className="absolute top-1/3 right-1/4 animate-float-slow animation-delay-1000">
              <Cloud className="h-10 w-10 text-white/50" />
            </div>
            <div className="absolute bottom-1/3 left-1/4 animate-float-slow animation-delay-2000">
              <Droplets className="h-8 w-8 text-blue-400/70" />
            </div>
            <div className="absolute bottom-1/4 right-1/5 animate-float-slow animation-delay-3000">
              <Thermometer className="h-8 w-8 text-red-400/70" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="relative mb-6">
              <h2 className="text-3xl md:text-5xl font-bold relative z-10" style={{ color: "#598216" }}>
                How It Works
              </h2>
              <div
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1.5 rounded-full"
                style={{ background: "linear-gradient(to right, #598216, #6a9a1a)" }}
              ></div>
              <div
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1.5 rounded-full blur-md opacity-50"
                style={{ backgroundColor: "#598216" }}
              ></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-lg">
              Our AI model predicts maize yield for Rwandan farmers using year, pesticide use, and temperature data.
            </p>
          </div>

          <div className="flex flex-row justify-center gap-8 overflow-x-auto pb-4">
            <div
              className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group flex-shrink-0 w-full md:w-96"
              style={{ borderWidth: "1px", borderColor: "rgba(89, 130, 22, 0.2)" }}
            >
              <div
                className="rounded-full w-24 h-24 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500"
                style={{
                  background: "linear-gradient(to bottom right, rgba(89, 130, 22, 0.2), rgba(89, 130, 22, 0.3))",
                }}
              >
                <FileText className="h-12 w-12" style={{ color: "#598216" }} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: "#598216" }}>
                Input Your Data
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Enter the year, pesticide usage, and average temperature for your maize farm in Rwanda.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setIsFormModalOpen(true)}
                  className="font-medium flex items-center hover:opacity-80 group"
                  style={{ color: "#598216" }}
                >
                  Try it now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            <div
              className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group flex-shrink-0 w-full md:w-96"
              style={{ borderWidth: "1px", borderColor: "rgba(89, 130, 22, 0.2)" }}
            >
              <div
                className="rounded-full w-24 h-24 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500"
                style={{
                  background: "linear-gradient(to bottom right, rgba(89, 130, 22, 0.2), rgba(89, 130, 22, 0.3))",
                }}
              >
                <Database className="h-12 w-12" style={{ color: "#598216" }} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: "#598216" }}>
                AI Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Our PyTorch model analyzes your inputs against historical Rwanda maize data.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => scrollToSection("visualization")}
                  className="font-medium flex items-center hover:opacity-80 group"
                  style={{ color: "#598216" }}
                >
                  View analytics
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            <div
              className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group flex-shrink-0 w-full md:w-96"
              style={{ borderWidth: "1px", borderColor: "rgba(89, 130, 22, 0.2)" }}
            >
              <div
                className="rounded-full w-24 h-24 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500"
                style={{
                  background: "linear-gradient(to bottom right, rgba(89, 130, 22, 0.2), rgba(89, 130, 22, 0.3))",
                }}
              >
                <Leaf className="h-12 w-12" style={{ color: "#598216" }} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: "#598216" }}>
                Get Predictions
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Receive maize yield predictions in tons/ha and a category (Low, Medium, High).
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setIsFormModalOpen(true)}
                  className="font-medium flex items-center hover:opacity-80 group"
                  style={{ color: "#598216" }}
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visualization Section */}
      <section
        id="visualization"
        ref={visualizationRef}
        className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="relative mb-6">
              <h2 className="text-3xl md:text-5xl font-bold relative z-10" style={{ color: "#598216" }}>
                Visualization Dashboard
              </h2>
              <div
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1.5 rounded-full"
                style={{ background: "linear-gradient(to right, #598216, #6a9a1a)" }}
              ></div>
              <div
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1.5 rounded-full blur-md opacity-50"
                style={{ backgroundColor: "#598216" }}
              ></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-lg">
              Visualize maize yield trends and model performance to optimize farming decisions in Rwanda.
            </p>
          </div>
          <VisualizationSection retrainResult={retrainResult} />
        </div>
      </section>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-md relative shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="country-input" className="block text-sm font-medium mb-1" style={{ color: "#598216" }}>
                  Country
                </label>
                <input
                  id="country-input"
                  type="text"
                  name="country"
                  value={formData.country}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                  style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                  placeholder="Rwanda"
                />
              </div>
              <div>
                <label htmlFor="crop-input" className="block text-sm font-medium mb-1" style={{ color: "#598216" }}>
                  Crop
                </label>
                <input
                  id="crop-input"
                  type="text"
                  name="crop"
                  value={formData.crop}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                  style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                  placeholder="Maize"
                />
              </div>
              <div>
                <label htmlFor="year-input" className="block text-sm font-medium mb-1" style={{ color: "#598216" }}>
                  Year
                </label>
                <input
                  id="year-input"
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#598216")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                  placeholder="e.g., 2025"
                  min="1985"
                  max="2028"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="pesticides-input"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#598216" }}
                >
                  Pesticides Used (tonnes)
                </label>
                <input
                  id="pesticides-input"
                  type="number"
                  name="pesticides_tonnes"
                  value={formData.pesticides_tonnes}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#598216")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                  placeholder="e.g., 200"
                  min="97"
                  max="3000"
                  required
                />
              </div>
              <div>
                <label htmlFor="temp-input" className="block text-sm font-medium mb-1" style={{ color: "#598216" }}>
                  Average Temperature (°C)
                </label>
                <input
                  id="temp-input"
                  type="number"
                  name="avg_temp"
                  value={formData.avg_temp}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#598216")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                  placeholder="e.g., 19.5"
                  min="19"
                  max="20.29"
                  step="0.1"
                  required
                />
              </div>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
              <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="order-2 sm:order-1 px-5 py-3 text-sm rounded-lg transition-colors flex items-center"
                  style={{ color: "#598216", borderColor: "rgba(89, 130, 22, 0.3)", backgroundColor: "transparent" }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(89, 130, 22, 0.1)")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "linear-gradient(to right, #598216, #4a6f12)" }}
                  className="order-1 sm:order-2 px-5 py-3 text-sm text-white rounded-lg transition-opacity shadow-md hover:opacity-90"
                >
                  Predict Yield
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {isResultsModalOpen && prediction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in overflow-y-auto py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-md mx-auto relative shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsResultsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="mb-6 text-center">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "linear-gradient(to bottom right, rgba(89, 130, 22, 0.2), rgba(89, 130, 22, 0.3))",
                }}
              >
                <CheckCircle size={32} style={{ color: "#598216" }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#598216" }}>
                Maize Yield Prediction
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Based on your input data for {formData.country}</p>
            </div>
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: "rgba(89, 130, 22, 0.1)" }}>
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
                      Year
                    </p>
                    <p className="font-medium" style={{ color: "#598216" }}>
                      {formData.year}
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 pb-3 border-b"
                  style={{ borderColor: "rgba(89, 130, 22, 0.2)" }}
                >
                  <div>
                    <p className="text-xs uppercase font-semibold" style={{ color: "#598216" }}>
                      Pesticides Used
                    </p>
                    <p className="font-medium" style={{ color: "#598216" }}>
                      {formData.pesticides_tonnes} tonnes
                    </p>
                  </div>
                </div>
                <div
                  className="mt-6 bg-white dark:bg-gray-700 rounded-lg p-4 border"
                  style={{ borderColor: "rgba(89, 130, 22, 0.2)" }}
                >
                  <p className="text-xs uppercase font-semibold mb-1" style={{ color: "#598216" }}>
                    Predicted Yield
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xl" style={{ color: "#598216" }}>
                      {prediction.value} tons/ha ({prediction.category})
                    </p>
                  </div>
                </div>
                {prediction.warning && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <p>{prediction.warning}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleBackToForm}
                className="px-5 py-3 text-sm rounded-lg transition-colors flex items-center"
                style={{ backgroundColor: "rgba(89, 130, 22, 0.1)", color: "#598216" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(89, 130, 22, 0.2)")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "rgba(89, 130, 22, 0.1)")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Edit Data
              </button>
              <button
                onClick={() => setIsResultsModalOpen(false)}
                style={{ background: "linear-gradient(to right, #598216, #4a6f12)" }}
                className="px-5 py-3 text-sm text-white rounded-lg transition-opacity shadow-md hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="relative w-full max-w-6xl animate-scale-in">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
              aria-label="Close login modal"
            >
              <X className="h-6 w-6" />
            </button>
            <LoginForm
              onSwitchToSignup={() => {
                setIsLoginModalOpen(false)
                setIsSignupModalOpen(true)
              }}
            />
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="relative w-full max-w-6xl animate-scale-in">
            <button
              onClick={() => setIsSignupModalOpen(false)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
              aria-label="Close signup modal"
            >
              <X className="h-6 w-6" />
            </button>
            <SignupForm
              onSwitchToLogin={() => {
                setIsSignupModalOpen(false)
                setIsLoginModalOpen(true)
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-white py-16" style={{ background: "linear-gradient(to right, #2d4010, #3d5515)" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/smartgwizalogo.png"
                    alt="SmartGwiza Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold">SmartGwiza</span>
              </div>
              <p className="text-gray-300 mb-4">
                Empowering Rwandan farmers with AI-driven maize yield predictions for sustainable agriculture.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/lilika67/SmartGwizaS"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://smartgwizas.onrender.com/docs"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="border-t mt-12 pt-8 text-center text-gray-300"
            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
          >
            <p>© {new Date().getFullYear()} SmartGwiza. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out both;
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-down {
          animation: slideDown 0.5s ease-out both;
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </main>
  )
}
