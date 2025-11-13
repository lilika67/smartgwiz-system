"use client"

import { useState } from "react"

export default function FarmerPrediction({
    districts = [],
    loadingDistricts = false,
    onPredictionSubmit,
    isSubmitting = false,
    error = "",
    prediction = null,
    onNewPrediction
}) {
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

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onPredictionSubmit(formData)
    }

    const handleReset = () => {
        setFormData({
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
        onNewPrediction()
    }

    const getConfidenceColor = (confidence) => {
        switch (confidence) {
            case 'high': return 'text-green-600'
            case 'medium': return 'text-yellow-600'
            case 'low': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                        <label htmlFor="district-input" className="block text-sm font-medium mb-2" style={{ color: "#598216" }}>
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
                            <option className="text-black" disabled value="">Select District</option>
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
                            placeholder="enter value between 300-700mm"
                            min="300"
                            max="700"
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
                            placeholder="enter value between 15-30°C"
                            min="15"
                            max="30"
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
                            style={{ borderColor: "rgba(89, 130, 22, 0.3)" }}
                            onFocus={(e) => (e.target.style.borderColor = "#598216")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(89, 130, 22, 0.3)")}
                            placeholder="enter value between 5.5-6.5"
                            min="5.5"
                            max="6.5"
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
                            onClick={handleReset}
                            className="w-full mt-6 py-3 px-6 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: "#598216" }}
                        >
                            Make Another Prediction
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}