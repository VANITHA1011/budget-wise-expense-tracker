
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STYLISH_PALETTE = [
    '#0F766E', '#34D399', '#3B82F6', '#FBBF24', '#9333EA', '#E11D48', '#14B8A6', '#475569',
];

function CategoryPieChart({ categorySummaryData = {}, selectedMonth }) {
    const labels = Object.keys(categorySummaryData);
    const dataValues = Object.values(categorySummaryData).map(val => parseFloat(val || 0));
    const totalSpent = dataValues.reduce((sum, value) => sum + value, 0);

    const formatTitleMonth = (monthKey) => {
        if (!monthKey) return 'Current Period';
        if (monthKey.match(/^\d{4}-\d{2}$/) || monthKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(monthKey + (monthKey.length === 7 ? '-01' : ''));
            return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
        }
        return monthKey;
    };

    const data = {
        labels: labels,
        datasets: [{
            label: 'Total Spent (₹)',
            data: dataValues,
            backgroundColor: STYLISH_PALETTE.slice(0, labels.length),
            borderColor: '#fff',
            borderWidth: 2,
            hoverOffset: 10,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: {
                position: 'right',
                align: 'start',
                labels: { usePointStyle: true, padding: 15, font: { size: 13, weight: '600' } }
            },
            title: { display: false },
            tooltip: { backgroundColor: '#333', titleFont: { size: 14 }, bodyFont: { size: 14 } }
        },
    };

    const textCenter = {
        id: 'textCenter',
        beforeDatasetsDraw(chart) {
            const { ctx, chartArea: { left, right, top, bottom } } = chart;
            ctx.save();
            const centerX = (left + right) / 2;
            const centerY = (top + bottom) / 2;

            ctx.font = 'bolder 24px sans-serif';
            ctx.fillStyle = '#0f766e';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`₹ ${totalSpent.toFixed(0).toLocaleString('en-IN')}`, centerX, centerY - 10);

            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Total Spent', centerX, centerY + 15);
            ctx.restore();
        }
    };

    if (labels.length === 0) {
        return <p className="text-gray-500 pt-10 text-center">No expense data found for {formatTitleMonth(selectedMonth)}.</p>;
    }

    return (
        <div className="h-[450px]">
            <Doughnut data={data} options={options} plugins={[textCenter]} />
        </div>
    );
}

export default CategoryPieChart;
