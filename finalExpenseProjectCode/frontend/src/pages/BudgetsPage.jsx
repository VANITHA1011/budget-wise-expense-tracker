
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetForm from '../components/BudgetForm'; 
import { Trash2, Edit } from 'lucide-react'; // Import icons for actions

const getColorForProgress = (progress) => {
    if (progress >= 90) return 'border-red-500';
    if (progress >= 50) return 'border-yellow-500';
    return 'border-teal-500';
};

function BudgetsPage() {
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null); // New state to hold budget being edited
    const [error, setError] = useState('');

    const fetchBudgets = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('userToken');
            
            // Assuming this endpoint returns the full budget details including ID, spentAmount, etc.
            const response = await axios.get('http://localhost:8080/api/budgets/summary', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setBudgets(response.data); 
        } catch (err) {
            console.error("Fetch Budgets Error:", err.response?.data || err.message);
            setError("Failed to fetch budgets. Please ensure the server is running and you are logged in.");
            setBudgets([]); 
        } finally {
            setIsLoading(false);
        }
    };

    // --- CRUD Handlers ---

    const handleEditClick = (budget) => {
        setEditingBudget(budget); // Load budget data into state
        setShowForm(true);        // Open the form
    };

    const handleDelete = async (budgetId) => {
        if (!window.confirm("Are you sure you want to delete this budget?")) return;

        try {
            const token = localStorage.getItem('userToken');
            await axios.delete(`http://localhost:8080/api/budgets/${budgetId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchBudgets(); // Refresh the list
        } catch (err) {
            console.error('Delete Budget Error:', err);
            setError('Failed to delete budget.');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingBudget(null); // Clear editing state
    };
    
    useEffect(() => {
        fetchBudgets();
    }, []);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Budget Management</h1>
                <button
                    onClick={() => { setEditingBudget(null); setShowForm(true); }} // Reset and show form for creation
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition shadow-md"
                >
                    + Create New Budget
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <BudgetForm 
                        initialBudget={editingBudget} // Pass budget data for editing, or null for creation
                        fetchBudgets={fetchBudgets} 
                        onCancel={closeForm} 
                    />
                </div>
            )}

            {error && <p className="text-red-500 text-center py-4">{error}</p>}
            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Loading budgets...</div>
            ) : budgets.length === 0 ? (
                <div className="text-center py-10 text-gray-500 border-2 border-dashed p-10 mt-5 rounded-lg">
                    No budgets found. Click "Create New Budget" to start planning!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => (
                        <div key={budget.id} className={`bg-white p-6 rounded-lg shadow-xl border-l-4 ${getColorForProgress(budget.progress)}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-xl text-gray-800">{budget.category} Budget</h3>
                                <div className="space-x-2">
                                    {/* EDIT BUTTON */}
                                    <button onClick={() => handleEditClick(budget)} className="text-blue-500 hover:text-blue-700">
                                        <Edit size={18} />
                                    </button>
                                    {/* DELETE BUTTON */}
                                    <button onClick={() => handleDelete(budget.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <p className="text-gray-600">Spent: **₹{parseFloat(budget.spentAmount).toFixed(2)}**</p>
                            <p className="text-gray-800 text-lg font-semibold mb-3">Target: **₹{parseFloat(budget.budgetAmount).toFixed(2)}**</p>

                            {/* Progress Bar Visualization */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div 
                                    className={`h-2.5 rounded-full ${budget.progress >= 90 ? 'bg-red-600' : budget.progress >= 50 ? 'bg-yellow-600' : 'bg-teal-600'}`}
                                    style={{ width: `${budget.progress}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-500">Remaining: ₹{parseFloat(budget.remainingAmount).toFixed(2)}</span>
                                <span className="text-teal-600">{budget.progress.toFixed(0)}% Used</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BudgetsPage;
