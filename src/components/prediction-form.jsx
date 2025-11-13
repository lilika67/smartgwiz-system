"use client"

import { useState } from "react"
import { X, AlertCircle, CheckCircle } from "lucide-react"

export default function PredictionForm({
    isOpen,
    onClose,
    onPredictionSuccess,
    initialFormData = {
        country: "Rwanda",
        crop: "Maize",
        year: "",
        pesticides_tonnes: "",
        avg_temp: "",
    }
}) {
    const [formData, setFormData] = useState(initialFormData)
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

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
            setIsSubmitting(true)

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

            const prediction = {
                value: yieldTonsHa.toFixed(3),
                category: getYieldCategory(yieldTonsHa),
                warning: result.warning || null,
                formData: { ...formData }
            }

            // Call success callback
            if (onPredictionSuccess) {
                onPredictionSuccess(prediction)
            }

            // Show success notification
            const successNotification = document.createElement("div")
            successNotification.className =
                "fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 z-50"
            successNotification.innerHTML = `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Prediction successful!`
            document.body.appendChild(successNotification)
            setTimeout(() => document.body.removeChild(successNotification), 5000)

            // Close the form modal
            onClose()

        } catch (err) {
            console.error("Fetch error:", err)
            setError(`Error predicting: ${err.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-md relative shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Close modal"
                >
                    <X className="h-6 w-6" />
                </button>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold" style={{ color: "#598216" }}>
                            Predict Maize Yield
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Enter your agricultural data for prediction
                        </p>
                    </div>

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
                            onClick={onClose}
                            className="order-2 sm:order-1 px-5 py-3 text-sm rounded-lg transition-colors flex items-center"
                            style={{ color: "#598216", borderColor: "rgba(89, 130, 22, 0.3)", backgroundColor: "transparent" }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(89, 130, 22, 0.1)")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{ background: "linear-gradient(to right, #598216, #4a6f12)" }}
                            className="order-1 sm:order-2 px-5 py-3 text-sm text-white rounded-lg transition-opacity shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                "Predict Yield"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}