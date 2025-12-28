
import React from 'react';
import { Link } from 'react-router-dom';

function RecentTransactions({ transactions = [] }) {

  // ✅ SORT transactions by latest date FIRST
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Recent Transactions
        </h2>
        <Link
          to="/transactions"
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          View All
        </Link>
      </div>

      {recentTransactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No recent transactions to display.
        </p>
      ) : (
        <ul className="space-y-3">
          {recentTransactions.map((t) => {
            const isExpense = t.type === 'EXPENSE';

            return (
              <li
                key={t.id}
                className="flex justify-between items-center border-b pb-2 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {t.category}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(t.date).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`font-bold ${
                    isExpense ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {isExpense ? '-' : '+'}
                  {t.amount.toFixed(2)} ₹
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default RecentTransactions;
