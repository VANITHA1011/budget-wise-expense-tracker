

import React from 'react';
import { Trash2, Edit2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const TransactionCard = ({ transaction, onEdit, onDelete }) => {
    const isIncome = transaction.type === 'INCOME';
    const colorClass = isIncome ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = isIncome ? 'text-green-600' : 'text-red-600';
    const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;

    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(transaction.amount);

    return (
        <div className={`flex items-center justify-between p-4 ${colorClass} rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300`}>
            
            {/* Icon and Main Info */}
            <div className="flex items-center">
                <Icon className={`w-8 h-8 mr-4 ${textColor}`} />
                <div>
                    <p className={`text-lg font-semibold ${textColor}`}>{transaction.category}</p>
                    <p className="text-sm text-gray-500">{transaction.description}</p>
                </div>
            </div>

            {/* Amount and Date */}
            <div className="text-right">
                <p className={`text-xl font-bold ${textColor}`}>
                    {formattedAmount}
                </p>
                <p className="text-xs text-gray-400">{transaction.date.split('T')[0]} | {transaction.account}</p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
                <button 
                    onClick={() => onEdit(transaction)}
                    className="p-2 text-blue-500 hover:text-blue-700 bg-blue-100 rounded-full transition-colors"
                    title="Edit"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => onDelete(transaction.id)}
                    className="p-2 text-red-500 hover:text-red-700 bg-red-100 rounded-full transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const TransactionList = ({ transactions, onEdit, onDelete }) => {
    return (
        <div className="space-y-4">
            {transactions.map(t => (
                <TransactionCard 
                    key={t.id} 
                    transaction={t} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                />
            ))}
        </div>
    );
};

export default TransactionList;
