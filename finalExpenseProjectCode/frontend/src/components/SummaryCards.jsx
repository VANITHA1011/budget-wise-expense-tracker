
import React from 'react';
// Note: It's best practice to use professional icons (like Lucide) instead of emojis
// but I will keep the emojis for now as they are in your original code.

const SummaryCard = ({ title, value, colorClass, icon }) => (
  // Updated styling for modern look: use border-l-4 (left) instead of border-b-4 (bottom)
  // as seen in the screenshots for a cleaner separation.
  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gray-200 hover:border-l-indigo-400 transition duration-150">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-500 uppercase">{title}</h3>
      <div className={`text-3xl ${colorClass}`}>{icon}</div>
    </div>
    
    {/* ⭐ KEY CHANGE HERE: Rupee symbol placed BEFORE the value ⭐ */}
    <p className={`mt-1 text-4xl font-extrabold ${colorClass}`}>
        ₹ {value.toFixed(2)}
    </p>
  </div>
);

function SummaryCards({ income, expense, balance }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard 
        title="Total Income" 
        value={income} 
        colorClass="text-green-600" 
        icon="💰" 
      />
      <SummaryCard 
        title="Total Expenses" 
        value={expense} 
        colorClass="text-red-600" 
        icon="🛒" 
      />
      <SummaryCard 
        title="Net Balance" 
        value={balance} 
        // Note: I recommend using a neutral color like "text-indigo-600" for Net Balance 
        // unless it's negative (you can add a ternary operator here if needed).
        colorClass="text-teal-600" 
        icon="📊" 
      />
    </div>
  );
}

export default SummaryCards;
