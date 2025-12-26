
import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

function DashboardSummary({ income = 0, expense = 0 }) {
  const balance = income - expense;

  const formatCurrency = (number) => {
    const numericValue = typeof number === 'number' && !isNaN(number) ? number : 0;
    return numericValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const Card = ({ title, value, colorClass, IconComponent }) => (
    <div className={`card p-4 rounded-xl shadow-lg border-l-4 ${colorClass.includes('green') ? 'border-green-400' : colorClass.includes('red') ? 'border-red-400' : 'border-indigo-400'}`}>
      <div>
        <p className={`text-2xl font-extrabold ${colorClass} mb-1`}>{formatCurrency(value)}</p>
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted">{title}</h3>
      </div>
      <div className={`p-2 rounded-full ${colorClass.includes('green') ? 'bg-green-100' : colorClass.includes('red') ? 'bg-red-100' : 'bg-indigo-100' }`}>
        <IconComponent className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card title="TOTAL INCOME" value={income} colorClass="text-green-600" IconComponent={TrendingUp} />
      <Card title="TOTAL EXPENSES" value={expense} colorClass="text-red-600" IconComponent={TrendingDown} />
      <Card title="NET BALANCE" value={balance} colorClass={balance >= 0 ? "text-indigo-600" : "text-red-600"} IconComponent={Wallet} />
    </div>
  );
}

export default DashboardSummary;
