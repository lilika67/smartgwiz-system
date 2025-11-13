"use client"

import { X, CheckCircle, AlertCircle } from "lucide-react"

export default function PredictionResults({
    isOpen,
    onClose,
    prediction,
    onEditData
}) {
    if (!isOpen || !prediction) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in overflow-y-auto py-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-md mx-auto relative shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
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
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Based on your input data for {prediction.formData.country}
                    </p>
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
                                    {prediction.formData.country}
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
                                    {prediction.formData.crop}
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
                                    {prediction.formData.year}
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
                                    {prediction.formData.pesticides_tonnes} tonnes
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
                        onClick={onEditData}
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
                        onClick={onClose}
                        style={{ background: "linear-gradient(to right, #598216, #4a6f12)" }}
                        className="px-5 py-3 text-sm text-white rounded-lg transition-opacity shadow-md hover:opacity-90"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}