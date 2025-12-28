
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoalForm from '../components/GoalForm'; 
import { format } from 'date-fns';
import { Trash2, Edit } from 'lucide-react'; // Import icons

function SavingsGoalsPage() {
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null); // New state for editing
    const [error, setError] = useState('');

    const fetchGoals = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.get('http://localhost:8080/api/savings-goals', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setGoals(response.data);
        } catch (err) {
            console.error("Fetch Goals Error:", err.response?.data || err.message);
            setError("Failed to fetch goals. Please ensure the server is running and you are logged in.");
        } finally {
            setIsLoading(false);
        }
    };

    // 1. Initial Load Effect
    useEffect(() => {
        fetchGoals();
    }, []);

    // 🔑 NEW EFFECT: Listen for the refresh signal from the Transaction page
    useEffect(() => {
        // Function to handle the storage event
        const handleStorageChange = (e) => {
            // Check if the specific 'goalRefreshTrigger' key was changed
            if (e.key === 'goalRefreshTrigger') {
                console.log('Detected goal update signal. Re-fetching goals...');
                fetchGoals(); // Refresh the list
            }
        };

        // Attach the listener when the component mounts
        window.addEventListener('storage', handleStorageChange);

        // Clean up the listener when the component unmounts
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
        
    }, []); // Empty dependency array ensures it runs only once on mount


    const calculateProgress = (current, target) => {
        const targetNum = parseFloat(target || 0);
        const currentNum = parseFloat(current || 0);
        if (targetNum <= 0) return 0;
        return Math.min(100, (currentNum / targetNum) * 100).toFixed(0);
    };

    // --- CRUD Handlers ---

    const handleEditClick = (goal) => {
        setEditingGoal(goal); // Load goal data into state
        setShowForm(true);    // Open the form
    };

    const handleDelete = async (goalId) => {
        if (!window.confirm("Are you sure you want to delete this savings goal?")) return;

        try {
            const token = localStorage.getItem('userToken');
            await axios.delete(`http://localhost:8080/api/savings-goals/${goalId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Trigger refresh signal on successful delete
            localStorage.setItem('goalRefreshTrigger', Date.now().toString());

            fetchGoals(); // Refresh the list
        } catch (err) {
            console.error('Delete Goal Error:', err);
            setError('Failed to delete goal.');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingGoal(null); // Clear editing state
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Savings Goals</h1>
                <button
                    onClick={() => { setEditingGoal(null); setShowForm(true); }} // Reset and show form for creation
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
                >
                    + Set New Goal
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <GoalForm 
                        initialGoal={editingGoal} // Pass data for editing
                        fetchGoals={fetchGoals} 
                        onCancel={closeForm} 
                    />
                </div>
            )}

            {error && <p className="text-red-500 text-center py-4">{error}</p>}
            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Loading goals...</div>
            ) : goals.length === 0 ? (
                <div className="text-center py-10 text-gray-500 border-2 border-dashed p-10 mt-5 rounded-lg">
                    No savings goals set. Time to start saving!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const progress = calculateProgress(goal.savedAmount, goal.targetAmount);
                        let targetDateDisplay = goal.targetDate ? format(new Date(goal.targetDate), 'MMM dd, yyyy') : 'N/A';
                        
                        return (
                            <div key={goal.id} className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-green-500">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-xl text-green-800">{goal.goalName}</h3>
                                    <div className="space-x-2">
                                        {/* EDIT/CONTRIBUTE BUTTON */}
                                        <button onClick={() => handleEditClick(goal)} className="text-blue-500 hover:text-blue-700">
                                            <Edit size={18} />
                                        </button>
                                        {/* DELETE BUTTON */}
                                        <button onClick={() => handleDelete(goal.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mb-3">Target Date: {targetDateDisplay}</p>

                                <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span>Saved: ₹{parseFloat(goal.savedAmount || 0).toFixed(2)}</span>
                                    <span>Target: ₹{parseFloat(goal.targetAmount || 0).toFixed(2)}</span>
                                </div>
                                
                                {/* Progress Bar Visualization */}
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                    <div 
                                        className="bg-green-600 h-2.5 rounded-full" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-center text-sm font-bold text-green-600">{progress}% Complete</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default SavingsGoalsPage;
