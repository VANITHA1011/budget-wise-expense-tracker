
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LayoutDashboard, Target, DollarSign } from "lucide-react";

import DashboardSummary from "../components/DashboardSummary";
import RecentTransactions from "../components/RecentTransactions";
import ProgressCard from "../components/ProgressCard";

function Dashboard() {

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:8080/api";

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const headers = getAuthHeaders();

    if (Object.keys(headers).length === 0) {
      setLoading(false);
      return;
    }

    try {
      const [
        transactionsResponse,
        budgetsResponse,
        goalsResponse
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions`, headers),
        axios.get(`${API_BASE_URL}/budgets`, headers),
        axios.get(`${API_BASE_URL}/savings-goals`, headers)
      ]);

      // ✅ SORT transactions by date (latest first)
      const sortedTransactions = [...transactionsResponse.data].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setTransactions(sortedTransactions);
      setBudgets(budgetsResponse.data);
      setGoals(goalsResponse.data);

    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🔄 Listen for transaction/goal updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'goalRefreshTrigger') {
        fetchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchData]);

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="text-center py-20 text-teal-600">
        Loading Dashboard...
      </div>
    );
  }

  const foodBudget =
    budgets.find(b => b.category?.toLowerCase() === 'food') ||
    budgets[0] ||
    { category: 'N/A', budgetAmount: 1, spentAmount: 0 };

  const vacationGoal =
    goals[0] ||
    { goalName: 'No Goal Set', targetAmount: 1, savedAmount: 0 };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
        <LayoutDashboard className="w-8 h-8 mr-3 text-indigo-600" />
        Dashboard Overview
      </h1>

      {/* SUMMARY */}
      <DashboardSummary
        income={totalIncome}
        expense={totalExpense}
      />

      {/* BUDGET + GOALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProgressCard
          title={`${foodBudget.category} Budget`}
          target={foodBudget.budgetAmount}
          current={foodBudget.spentAmount}
          icon={<DollarSign />}
        />

        <ProgressCard
          title={vacationGoal.goalName}
          target={vacationGoal.targetAmount}
          current={vacationGoal.savedAmount}
          icon={<Target />}
        />
      </div>

      {/* RECENT TRANSACTIONS */}
      <RecentTransactions transactions={transactions} />
    </div>
  );
}

export default Dashboard;
