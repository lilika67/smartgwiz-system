"use client"
import { useState } from "react"
import { TrendingUp, BarChart3, Activity } from "lucide-react"

export default function VisualizationSection({ retrainResult }) {
  const [activeTab, setActiveTab] = useState("trends")

  // Sample data for visualization
  const yieldTrends = [
    { year: 2019, yield: 1.8 },
    { year: 2020, yield: 2.1 },
    { year: 2021, yield: 2.3 },
    { year: 2022, yield: 2.0 },
    { year: 2023, yield: 2.4 },
    { year: 2024, yield: 2.6 },
  ]

  const maxYield = Math.max(...yieldTrends.map((d) => d.yield))

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <button
          onClick={() => setActiveTab("trends")}
          style={activeTab === "trends" ? { background: "linear-gradient(to right, #598216, #4a6f12)" } : {}}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === "trends"
              ? "text-white shadow-lg"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          onMouseEnter={(e) => activeTab !== "trends" && (e.target.style.backgroundColor = "rgba(89, 130, 22, 0.1)")}
          onMouseLeave={(e) => activeTab !== "trends" && (e.target.style.backgroundColor = "")}
        >
          <TrendingUp className="h-5 w-5" />
          Maize Yield Trends
        </button>
        {/* <button
          onClick={() => setActiveTab("performance")}
          style={activeTab === "performance" ? { background: "linear-gradient(to right, #598216, #4a6f12)" } : {}}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === "performance"
              ? "text-white shadow-lg"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          onMouseEnter={(e) =>
            activeTab !== "performance" && (e.target.style.backgroundColor = "rgba(89, 130, 22, 0.1)")
          }
          onMouseLeave={(e) => activeTab !== "performance" && (e.target.style.backgroundColor = "")}
        >
          <BarChart3 className="h-5 w-5" />
          Model Performance
        </button> */}
        <button
          onClick={() => setActiveTab("insights")}
          style={activeTab === "insights" ? { background: "linear-gradient(to right, #598216, #4a6f12)" } : {}}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === "insights"
              ? "text-white shadow-lg"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          onMouseEnter={(e) => activeTab !== "insights" && (e.target.style.backgroundColor = "rgba(89, 130, 22, 0.1)")}
          onMouseLeave={(e) => activeTab !== "insights" && (e.target.style.backgroundColor = "")}
        >
          <Activity className="h-5 w-5" />
          Insights
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
        {activeTab === "trends" && (
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: "#598216" }}>
              Maize Yield Trends in Rwanda
            </h3>
            <div className="space-y-4">
              {yieldTrends.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-gray-700 dark:text-gray-300 font-medium w-16">{data.year}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                    <div
                      style={{
                        width: `${(data.yield / maxYield) * 100}%`,
                        background: "linear-gradient(to right, #598216, #6a9a1a)",
                      }}
                      className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-1000"
                    >
                      <span className="text-white text-sm font-medium">{data.yield} t/ha</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* {activeTab === "performance" && (
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: "#598216" }}>
              Model Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="rounded-xl p-6 border"
                style={{ backgroundColor: "rgba(89, 130, 22, 0.1)", borderColor: "rgba(89, 130, 22, 0.2)" }}
              >
                <p className="text-sm font-semibold uppercase mb-2" style={{ color: "#598216" }}>
                  Accuracy
                </p>
                <p className="text-3xl font-bold" style={{ color: "#598216" }}>
                  {retrainResult?.accuracy ? `${(retrainResult.accuracy * 100).toFixed(1)}%` : "92.5%"}
                </p>
              </div>
              <div
                className="rounded-xl p-6 border"
                style={{ backgroundColor: "rgba(89, 130, 22, 0.1)", borderColor: "rgba(89, 130, 22, 0.2)" }}
              >
                <p className="text-sm font-semibold uppercase mb-2" style={{ color: "#598216" }}>
                  R² Score
                </p>
                <p className="text-3xl font-bold" style={{ color: "#598216" }}>
                  {retrainResult?.r2_score ? retrainResult.r2_score.toFixed(3) : "0.875"}
                </p>
              </div>
              <div
                className="rounded-xl p-6 border"
                style={{ backgroundColor: "rgba(89, 130, 22, 0.1)", borderColor: "rgba(89, 130, 22, 0.2)" }}
              >
                <p className="text-sm font-semibold uppercase mb-2" style={{ color: "#598216" }}>
                  MAE
                </p>
                <p className="text-3xl font-bold" style={{ color: "#598216" }}>
                  {retrainResult?.mae ? retrainResult.mae.toFixed(3) : "0.156"}
                </p>
              </div>
            </div>
          </div>
        )} */}

        {activeTab === "insights" && (
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: "#598216" }}>
              Key Insights for National level Maize Yield in Rwanda
            </h3>
            <div className="space-y-4">
              <div
                className="rounded-xl p-6 border"
                style={{ backgroundColor: "rgba(89, 130, 22, 0.1)", borderColor: "rgba(89, 130, 22, 0.2)" }}
              >
                <h4 className="font-bold mb-2" style={{ color: "#598216" }}>
                  Temperature Impact
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Optimal temperature range for maize in Rwanda is 19-20°C. Higher temperatures may reduce yield.
                </p>
              </div>
              <div
                className="rounded-xl p-6 border"
                style={{ backgroundColor: "rgba(89, 130, 22, 0.1)", borderColor: "rgba(89, 130, 22, 0.2)" }}
              >
                <h4 className="font-bold mb-2" style={{ color: "#598216" }}>
                  Pesticide Usage
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Moderate pesticide use (1000-1500 tonnes) shows optimal results for sustainable farming.
                </p>
              </div>
              <div
                className="rounded-xl p-6 border"
                style={{ backgroundColor: "rgba(89, 130, 22, 0.1)", borderColor: "rgba(89, 130, 22, 0.2)" }}
              >
                <h4 className="font-bold mb-2" style={{ color: "#598216" }}>
                  Yield Trends
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Maize yields in Rwanda have shown steady improvement over the past 5 years, averaging 2.2 tons/ha.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
