
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const API_BASE_URL = "http://localhost:8080/api";

// ✅ FIXED MONTH STRUCTURE (TARGET IMAGE)
const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec","Jan"
];

function PredictionLineChart({ getAuthHeaders }) {
  const [chartData, setChartData] = useState(null);
  const [predictedValue, setPredictedValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        if (!headers.headers) return;

        // 1️⃣ Fetch monthly expense trend
        const trendRes = await axios.get(
          `${API_BASE_URL}/reports/monthly-trend`,
          { params: { months: 12 }, ...headers }
        );

        // Initialize all months with 0
        const expenseMap = {
          Jan:0, Feb:0, Mar:0, Apr:0, May:0, Jun:0,
          Jul:0, Aug:0, Sep:0, Oct:0, Nov:0, Dec:0
        };

        Object.keys(trendRes.data).forEach(key => {
          const date = new Date(key + "-01");
          const month = date.toLocaleString("en", { month: "short" });
          expenseMap[month] += parseFloat(trendRes.data[key]?.EXPENSE || 0);
        });

        // Convert to array + predicted placeholder
        const expenseValues = MONTHS.map(m => expenseMap[m] || 0);

        // 2️⃣ Fetch prediction
        const predictionRes = await axios.get(
          `${API_BASE_URL}/ai/predict-expenses`,
          headers
        );

        const predicted =
          predictionRes.data?.total_predicted_expense || 0;

        expenseValues[expenseValues.length - 1] = predicted;
        setPredictedValue(predicted);

        setChartData({
          labels: MONTHS,
          datasets: [
            {
              label: "Expenses",
              data: expenseValues,
              borderColor: "#6366F1",
              backgroundColor: "rgba(99,102,241,0.12)",
              tension: 0.45,
              fill: true,
              pointRadius: ctx =>
                ctx.dataIndex === expenseValues.length - 1 ? 6 : 4,
              pointBackgroundColor: ctx =>
                ctx.dataIndex === expenseValues.length - 1
                  ? "#EF4444"
                  : "#6366F1",
            },
          ],
        });
      } catch (err) {
        console.error("Line chart error:", err);
      }
    };

    fetchData();
  }, [getAuthHeaders]);

  if (!chartData) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
      
      {/* 🔹 HEADER (LIKE TARGET IMAGE) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Expense History & Prediction
        </h2>

        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
          Predicted: ₹{predictedValue.toLocaleString("en-IN")}
        </div>
      </div>

      {/* 🔹 LINE CHART */}
      <div className="h-[350px]">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx =>
                    `₹ ${ctx.parsed.y.toLocaleString("en-IN")}`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  callback: value =>
                    `₹${value.toLocaleString("en-IN")}`,
                },
                grid: { borderDash: [5, 5] },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default PredictionLineChart;
