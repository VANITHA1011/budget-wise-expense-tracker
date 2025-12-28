
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import MonthlyBarChart from '../components/MonthlyBarChart';
import CategoryPieChart from '../components/CategoryPieChart';
import FinancialSummary from '../components/FinancialSummary';
import AIInsightCard from '../components/AIInsightCard';
import PredictionLineChart from '../components/PredictionLineChart';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

const API_BASE_URL = "http://localhost:8080/api";

function ReportsPage() {
  const reportRef = useRef(null);

  const [categorySummary, setCategorySummary] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState({});
  const [months, setMonths] = useState(6);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const headers = getAuthHeaders();

      const trendRes = await axios.get(
        `${API_BASE_URL}/reports/monthly-trend`,
        { params: { months }, ...headers }
      );

      setMonthlyTrend(trendRes.data);

      const keys = Object.keys(trendRes.data).sort().reverse();
      const latest = keys[0];
      if (!selectedMonth && latest) setSelectedMonth(latest);

      if (latest) {
        const categoryRes = await axios.get(
          `${API_BASE_URL}/reports/category-summary`,
          { params: { month: selectedMonth || latest }, ...headers }
        );
        setCategorySummary(categoryRes.data);
      }
    } catch (e) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [months, selectedMonth, getAuthHeaders]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totals = () => {
    let income = 0, expense = 0;
    Object.values(monthlyTrend).forEach(m => {
      income += parseFloat(m.INCOME || 0);
      expense += parseFloat(m.EXPENSE || 0);
    });
    return { income, expense };
  };

  const { income, expense } = totals();

  const exportPDF = async () => {
    setExporting(true);
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, "JPEG", 0, 0, width, height);
    pdf.save("BudgetWise_Report.pdf");
    setExporting(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8" ref={reportRef}>
      <h1 className="text-3xl font-bold mb-6">Data Visualization & Trends</h1>

      <AIInsightCard getAuthHeaders={getAuthHeaders} />

      <FinancialSummary income={income} expense={expense} />

      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mb-8">
        <div className="flex space-x-4">
          <select value={months} onChange={e => setMonths(+e.target.value)}
            className="border p-2 rounded">
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
        </div>

        <button
          onClick={exportPDF}
          disabled={exporting}
          className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          <Download size={18} className="mr-2" />
          {exporting ? "Generating..." : "Export PDF"}
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
          <MonthlyBarChart monthlyTrendData={monthlyTrend} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <CategoryPieChart
            categorySummaryData={categorySummary}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>

      {/* 🔥 NEW LINE CHART */}
      <div className="mt-8">
        <PredictionLineChart getAuthHeaders={getAuthHeaders} />
      </div>
    </div>
  );
}

export default ReportsPage;
