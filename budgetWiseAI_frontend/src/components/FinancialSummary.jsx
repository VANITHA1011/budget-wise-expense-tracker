
import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

function FinancialSummary({ income = 0, expense = 0 }) {
  const balance = income - expense;

  const formatCurrency = (number) => {
    const numericValue = typeof number === 'number' && !isNaN(number) ? number : 0;
    return numericValue.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const Card = ({ title, value, colorClass, IconComponent }) => (
    <div className={
      `bg-white p-3 rounded-lg shadow-sm border-l-4 hover:shadow-md transition duration-150 cursor-pointer flex items-center space-x-3
      ${colorClass.includes('green') ? 'border-green-400' :
        colorClass.includes('red') ? 'border-red-400' : 'border-indigo-400'}`
    }>
      <div className={`
          p-1.5 rounded-full
          ${colorClass.includes('green') ? 'bg-green-100' :
          colorClass.includes('red') ? 'bg-red-100' :
          'bg-indigo-100'}
      `}>
        <IconComponent className={`w-4 h-4 ${colorClass}`} />
      </div>

      <div className="flex flex-col flex-1">
        <p className={`text-lg font-bold ${colorClass} order-1`}>
          {formatCurrency(value)}
        </p>
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 order-2">
          {title}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card
        title="Total Income"
        value={income}
        colorClass="text-green-600"
        IconComponent={TrendingUp}
      />

      <Card
        title="Total Expenses"
        value={expense}
        colorClass="text-red-600"
        IconComponent={TrendingDown}
      />

      <Card
        title="Net Balance"
        value={balance}
        colorClass={balance >= 0 ? "text-indigo-600" : "text-red-600"}
        IconComponent={Wallet}
      />
    </div>
  );
}

export default FinancialSummary;
