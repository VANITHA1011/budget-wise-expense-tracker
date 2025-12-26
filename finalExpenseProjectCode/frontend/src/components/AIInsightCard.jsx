
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, CornerDownRight, Lightbulb, Bell } from 'lucide-react';

function AIInsightCard({ getAuthHeaders }) {
    const [prediction, setPrediction] = useState(null);
    const [insights, setInsights] = useState({ savingTips: [], savingAlerts: [] });
    const [message, setMessage] = useState("Loading AI data...");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const headers = getAuthHeaders();

            if (Object.keys(headers).length === 0) {
                setMessage("Please log in to view AI data.");
                setLoading(false);
                return;
            }

            // ✅ FIXED URLs (MAIN FIX)
            const results = await Promise.allSettled([
                axios.get(`http://localhost:8080/api/ai/predict-expenses`, headers),
                axios.get(`http://localhost:8080/api/advisor/insights`, headers),
            ]);

            let predictionSuccess = false;
            let insightsSuccess = false;

            // ----------------------------------------------------
            // 1. Prediction result
            // ----------------------------------------------------
            const predictionResult = results[0];

            if (predictionResult.status === "fulfilled") {
                setPrediction(predictionResult.value.data.total_predicted_expense);
                predictionSuccess = true;
            } else {
                console.error("Prediction API failed:", predictionResult.reason);
                setPrediction(0.0);
            }

            // ----------------------------------------------------
            // 2. Insights result (Saving Tips + Alerts)
            // ----------------------------------------------------
            const insightsResult = results[1];

            if (insightsResult.status === "fulfilled") {
                setInsights(insightsResult.value.data || { savingTips: [], savingAlerts: [] });
                insightsSuccess = true;
            } else {
                console.error("Insights API failed:", insightsResult.reason);
                setInsights({ savingTips: [], savingAlerts: [] });
            }

            // ----------------------------------------------------
            // 3. Status messages
            // ----------------------------------------------------
            if (predictionSuccess && insightsSuccess) {
                setMessage("AI data loaded successfully.");
            } else if (predictionSuccess) {
                setMessage("Prediction loaded. Insights unavailable.");
            } else if (insightsSuccess) {
                setMessage("Insights loaded. Prediction unavailable.");
            } else {
                setMessage("AI services offline or unauthorized.");
            }

            setLoading(false);
        };

        fetchData();
    }, [getAuthHeaders]);

    // Number Format
    const formatCurrency = (amount) => {
        if (amount === null || isNaN(amount)) return 'N/A';
        return amount.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const { savingTips, savingAlerts } = insights;
    const hasInsights = savingTips.length > 0 || savingAlerts.length > 0;

    return (
        <div className="bg-gradient-to-br from-indigo-700 to-blue-700 text-white p-5 rounded-xl shadow-2xl mb-6 relative overflow-hidden">

            {/* Forecast Section */}
            <div className="flex justify-between items-start z-10 relative mb-4">
                <div>
                    <h3 className="flex items-center text-sm font-semibold mb-1">
                        <Zap className="w-4 h-4 mr-2 text-yellow-300" />
                        AI Spending Forecast
                    </h3>

                    <p className="text-xs opacity-80">{message}</p>

                    {loading ? (
                        <p className="text-3xl font-extrabold mt-3 animate-pulse">...</p>
                    ) : (
                        <p className="text-3xl font-black mt-2 tracking-tight">
                            {formatCurrency(prediction)}
                        </p>
                    )}

                    <p className="text-xs opacity-70 mt-1">
                        Predicted Next Month Total Expense
                    </p>
                </div>

                <div className="p-2 bg-white/20 rounded-md shadow-inner">
                    <CornerDownRight className="w-5 h-5 text-white" />
                </div>
            </div>

            {hasInsights && <hr className="border-indigo-400 my-4" />}

            {/* Alerts */}
            {savingAlerts.length > 0 && (
                <div className="mt-2 p-3 bg-red-800/50 border border-red-500 rounded-lg space-y-2 shadow-inner">
                    <h4 className="flex items-center text-sm font-bold text-red-300">
                        <Bell className="w-4 h-4 mr-2" />
                        CRITICAL SAVING ALERTS:
                    </h4>

                    <ul className="list-disc ml-5 space-y-1 text-sm">
                        {savingAlerts.map((alert, index) => (
                            <li key={index} className="text-red-100">{alert}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Tips */}
            {savingTips.length > 0 && (
                <div className="mt-4 p-3 bg-teal-800/50 border border-teal-500 rounded-lg space-y-2 shadow-inner">
                    <h4 className="flex items-center text-sm font-bold text-teal-300">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        PROACTIVE SAVING TIPS:
                    </h4>

                    <ul className="list-disc ml-5 space-y-1 text-sm">
                        {savingTips.map((tip, index) => (
                            <li key={index} className="text-gray-100">{tip}</li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    );
}

export default AIInsightCard;
