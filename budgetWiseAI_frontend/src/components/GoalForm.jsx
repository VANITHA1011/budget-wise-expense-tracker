

// src/components/GoalForm.jsx (Final Working Code)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

// Added initialGoal prop. If it's provided, we are editing.
function GoalForm({ fetchGoals, onCancel, initialGoal }) {
    const isEditing = !!initialGoal; // CRITICAL: Correctly determine if in edit mode

    const [goalData, setGoalData] = useState({
        goalName: '',
        targetAmount: '',
        savedAmount: 0,
        targetDate: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to pre-populate form when editing
    useEffect(() => {
        if (isEditing && initialGoal) {
            setGoalData({
                goalName: initialGoal.goalName || '',
                targetAmount: initialGoal.targetAmount.toString(),
                savedAmount: initialGoal.savedAmount.toString(),
                // Date formatting for input type="date" requires YYYY-MM-DD
                targetDate: initialGoal.targetDate ? format(new Date(initialGoal.targetDate), 'yyyy-MM-dd') : ''
            });
        } else {
            // Reset for creation mode
            setGoalData({
                goalName: '',
                targetAmount: '',
                savedAmount: 0,
                targetDate: ''
            });
        }
    }, [isEditing, initialGoal]); // Depend on isEditing and initialGoal

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGoalData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!goalData.goalName || !goalData.targetAmount || !goalData.targetDate) {
            setError("All mandatory fields are required.");
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            
            const payload = {
                goalName: goalData.goalName,
                targetAmount: parseFloat(goalData.targetAmount),
                savedAmount: parseFloat(goalData.savedAmount) || 0.00,
                targetDate: goalData.targetDate // YYYY-MM-DD string
            };

            let response;
            
            if (isEditing) {
                // UPDATE operation (PUT)
                const url = `http://localhost:8080/api/savings-goals/${initialGoal.id}`;
                response = await axios.put(url, payload, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
            } else {
                // CREATE operation (POST)
                const url = 'http://localhost:8080/api/savings-goals';
                response = await axios.post(url, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            
            fetchGoals(); 
            onCancel(); 
            
        } catch (err) {
            console.error("Goal operation failed:", err.response?.data || err.message);
            setError(`Failed to ${isEditing ? 'update' : 'create'} goal. Reason: ${err.response?.data || 'Server/Token Error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-4 text-green-800">
                {/* FIX APPLIED HERE */}
                {isEditing ? 'Edit Savings Goal' : 'New Savings Goal'}
            </h3>
            
            {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm mb-4">{error}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <input 
                    type="text" 
                    name="goalName" 
                    placeholder="Goal Name (e.g., New Car Fund)"
                    value={goalData.goalName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                />
                
                <input 
                    type="number" 
                    name="targetAmount" 
                    placeholder="Target Amount"
                    value={goalData.targetAmount}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                    min="0"
                    step="0.01"
                />
                
                <input 
                    type="number" 
                    name="savedAmount" 
                    placeholder="Current Saved Amount"
                    value={goalData.savedAmount}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="0"
                    step="0.01"
                />

                <input 
                    type="date"
                    name="targetDate" 
                    value={goalData.targetDate}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    title="Target Date"
                    required
                />
                
                <div className="flex space-x-3 pt-4">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {/* FIX APPLIED HERE */}
                        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Goal' : 'Create Goal')}
                    </button>
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="bg-gray-400 text-white p-3 rounded-lg font-bold hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default GoalForm;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { format } from 'date-fns';

// function GoalForm({ fetchGoals, onCancel, initialGoal }) {
//     const isEditing = !!initialGoal;

//     const [goalData, setGoalData] = useState({
//         goalName: '',
//         targetAmount: '',
//         savedAmount: 0,
//         targetDate: ''
//     });
//     const [error, setError] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     useEffect(() => {
//         if (isEditing && initialGoal) {
//             setGoalData({
//                 goalName: initialGoal.goalName || '',
//                 targetAmount: initialGoal.targetAmount.toString(),
//                 savedAmount: initialGoal.savedAmount.toString(),
//                 targetDate: initialGoal.targetDate ? format(new Date(initialGoal.targetDate), 'yyyy-MM-dd') : ''
//             });
//         } else {
//             setGoalData({ goalName: '', targetAmount: '', savedAmount: 0, targetDate: '' });
//         }
//     }, [isEditing, initialGoal]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setGoalData(prev => ({ ...prev, [name]: value }));
//         setError('');
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setIsSubmitting(true);

//         if (!goalData.goalName || !goalData.targetAmount || !goalData.targetDate) {
//             setError("All mandatory fields are required.");
//             setIsSubmitting(false);
//             return;
//         }

//         try {
//             const token = localStorage.getItem('userToken');

//             const payload = {
//                 goalName: goalData.goalName,
//                 targetAmount: parseFloat(goalData.targetAmount),
//                 savedAmount: parseFloat(goalData.savedAmount) || 0.00,
//                 targetDate: goalData.targetDate
//             };

//             let response;

//             if (isEditing) {
//                 const url = `http://localhost:8080/api/savings-goals/${initialGoal.id}`;
//                 response = await axios.put(url, payload, { headers: { 'Authorization': `Bearer ${token}` } });
//             } else {
//                 const url = 'http://localhost:8080/api/savings-goals';
//                 response = await axios.post(url, payload, { headers: { 'Authorization': `Bearer ${token}` } });
//             }

//             fetchGoals();
//             onCancel();
//         } catch (err) {
//             console.error("Goal operation failed:", err.response?.data || err.message);
//             setError(`Failed to ${isEditing ? 'update' : 'create'} goal. Reason: ${err.response?.data || 'Server/Token Error'}`);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="card p-6 w-full max-w-md">
//             <h3 className="text-2xl font-semibold mb-4 text-teal-800">{isEditing ? 'Edit Savings Goal' : 'New Savings Goal'}</h3>

//             {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm mb-4">{error}</p>}

//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <input type="text" name="goalName" placeholder="Goal Name (e.g., New Car Fund)"
//                     value={goalData.goalName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />

//                 <input type="number" name="targetAmount" placeholder="Target Amount"
//                     value={goalData.targetAmount} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required min="0" step="0.01" />

//                 <input type="number" name="savedAmount" placeholder="Current Saved Amount"
//                     value={goalData.savedAmount} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" min="0" step="0.01" />

//                 <input type="date" name="targetDate" value={goalData.targetDate} onChange={handleChange}
//                     className="w-full p-3 border border-gray-300 rounded-lg" title="Target Date" required />

//                 <div className="flex space-x-3 pt-4">
//                     <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50">
//                         {isSubmitting ? 'Saving...' : (isEditing ? 'Update Goal' : 'Create Goal')}
//                     </button>
//                     <button type="button" onClick={onCancel} className="bg-gray-400 text-white p-3 rounded-lg font-bold hover:bg-gray-500 transition">
//                         Cancel
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }

// export default GoalForm;
