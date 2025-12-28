
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

function MonthlyBarChart({ monthlyTrendData = {} }) {

    // Get month keys and sort
    const trendLabels = Object.keys(monthlyTrendData).sort();

    const trendIncomeData = trendLabels.map(month =>
        parseFloat(monthlyTrendData[month]?.INCOME || 0)
    );

    const trendExpenseData = trendLabels.map(month =>
        parseFloat(monthlyTrendData[month]?.EXPENSE || 0)
    );

    const formattedLabels = trendLabels.map(label => {
        if (!label) return 'N/A';
        try {
            const date = new Date(label + '-01');
            return date.toLocaleDateString('en-IN', { month: 'short' });
        } catch (e) {
            return label.substring(5);
        }
    });

    const data = {
        labels: formattedLabels,
        datasets: [
            {
                label: 'Income',
                data: trendIncomeData,
                backgroundColor: 'rgba(16, 185, 129, 0.9)',
                borderRadius: 5,
            },
            {
                label: 'Expenses',
                data: trendExpenseData,
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                borderRadius: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true, padding: 20, font: { size: 14, weight: '600' } }
            },
            title: { display: false },
            tooltip: {
                backgroundColor: '#333',
                titleFont: { size: 14 },
                bodyFont: { size: 14 }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 14 } } },
            y: {
                beginAtZero: true,
                grid: { borderDash: [5, 5], color: '#e5e7eb' },
                ticks: {
                    callback: function (value) { return '₹' + value.toLocaleString('en-IN'); },
                    font: { size: 14 },
                },
            },
        },
    };

    if (trendLabels.length === 0) {
        return <p className="text-gray-500 pt-10 text-center">No monthly trend data available.</p>;
    }

    return (
        <div className="h-[450px]">
            <Bar data={data} options={options} />
        </div>
    );
}

export default MonthlyBarChart;
