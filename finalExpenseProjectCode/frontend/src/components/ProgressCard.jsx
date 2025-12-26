import React from 'react';

function ProgressCard({ title, target, current, icon }) {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = percentage >= 100;

  let barColor = 'bg-teal-500';
  if (isComplete) barColor = 'bg-green-500';
  else if (percentage > 80) barColor = 'bg-yellow-500';

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className="text-2xl text-teal-600">{icon}</span>
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        {current.toFixed(2)} ₹ / {target.toFixed(2)} ₹
      </p>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
        <div 
          className={`h-2.5 rounded-full ${barColor} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <p className={`text-sm font-bold mt-2 ${isComplete ? 'text-green-600' : 'text-teal-600'}`}>
        {percentage.toFixed(0)}% Complete {isComplete && '🎉'}
      </p>
    </div>
  );
}

export default ProgressCard;
