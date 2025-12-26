
import React, { useState, useEffect } from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';
import axios from 'axios'; 

const defaultCategories = ['Salary', 'Freelance', 'Groceries', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Others'];
const accounts = ['Cash', 'Bank', 'Card'];
const types = ['INCOME', 'EXPENSE'];

// Used to identify the option to switch input types
const NEW_CATEGORY_FLAG = '_ADD_NEW_CATEGORY'; 

const initialFormState = {
    type: 'EXPENSE',
    category: defaultCategories[2], 
    amount: '',
    description: '',
    account: accounts[0],
    date: new Date().toISOString().substring(0, 10),
    savingsGoalId: null,
    // 🔑 NEW STATE FIELD FOR SPECIFIC SAVINGS ALLOCATION
    savingsAllocationAmount: '',
};

const TransactionForm = ({ onSave, isEditing, initialData, onCancel, authToken, API_BASE_URL }) => { 
    const [formData, setFormData] = useState(initialFormState);
    const [budgetCategories, setBudgetCategories] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    
    // NEW STATE: Tracks if the user selected 'Add New Category'
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false); 

    // --- EFFECT 1: Fetch Categories and Goals ---
    useEffect(() => {
        const fetchDependencies = async () => {
            if (!authToken || !API_BASE_URL) {
                console.error("Dependencies missing: Auth Token or API Base URL.");
                setIsError(true);
                setIsLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${authToken}` } };
            
            try {
                const budgetRes = await axios.get(`${API_BASE_URL}/budgets/summary`, config);
                const categoriesFromBudgets = Array.isArray(budgetRes.data) 
                    ? budgetRes.data.map(b => b.category) 
                    : [];
                
                const allCategories = [...new Set([...defaultCategories, ...categoriesFromBudgets])].sort();
                setBudgetCategories(allCategories);

                const goalRes = await axios.get(`${API_BASE_URL}/savings-goals`, config);
                setSavingsGoals(Array.isArray(goalRes.data) ? goalRes.data : []); 

            } catch (error) {
                console.error("Failed to fetch budgets or goals:", error);
                setIsError(true); 
            } finally {
                setIsLoading(false);
            }
        };
        fetchDependencies();
    }, [authToken, API_BASE_URL]); 
    
    // --- EFFECT 2: Handle Editing State (Including new field) ---
    useEffect(() => {
        if (isEditing && initialData && budgetCategories.length > 0) {
            const isCustomCategory = !budgetCategories.includes(initialData.category);

            setFormData({
                ...initialData,
                date: initialData.date ? new Date(initialData.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
                amount: initialData.amount.toString(),
                savingsGoalId: initialData.savingsGoalId || null,
                // 🔑 LOAD NEW FIELD
                savingsAllocationAmount: initialData.savingsAllocationAmount ? initialData.savingsAllocationAmount.toString() : '',
            });
            
            if (isCustomCategory) {
                 setIsAddingNewCategory(true);
            } else {
                 setIsAddingNewCategory(false);
            }
        } else if (!isEditing) {
            setFormData(initialFormState);
            setIsAddingNewCategory(false);
        }
    }, [isEditing, initialData, budgetCategories.length]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'category' && value === NEW_CATEGORY_FLAG) {
            setIsAddingNewCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const totalAmount = parseFloat(formData.amount);
        const allocationAmount = formData.savingsAllocationAmount ? parseFloat(formData.savingsAllocationAmount) : 0;
        
        if (!totalAmount || totalAmount <= 0 || !formData.description || !formData.category) {
             alert("Please ensure Amount, Description, and Category are filled out correctly.");
             return;
        }
        
        // 🔑 CRITICAL VALIDATION: Check if allocation exceeds total income
        if (formData.type === 'INCOME' && allocationAmount > totalAmount) {
             alert("Error: Savings allocation amount (₹" + allocationAmount.toFixed(2) + ") cannot be greater than the total income amount (₹" + totalAmount.toFixed(2) + ").");
             return;
        }


        const dataToSave = {
            ...formData,
            amount: totalAmount,
            // 🔑 SEND NEW FIELD TO BACKEND: Use null if zero or empty, as the backend expects Double
            savingsAllocationAmount: formData.savingsGoalId && allocationAmount > 0 
                ? allocationAmount
                : null,
            // Only send goal ID if type is INCOME
            savingsGoalId: formData.type === 'INCOME' && formData.savingsGoalId ? formData.savingsGoalId : null,
            ...(isEditing && initialData.id && { id: initialData.id }),
        };

        onSave(dataToSave);
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150";

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Loading categories and goals...</div>;
    }

    if (isError) {
        return (
            <div className="p-8 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                <div className="flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-3" />
                    <h3 className="font-bold text-lg">Failed to Load Form Data</h3>
                </div>
                <p className="mt-2">
                    Please ensure the **backend is running** and that the API base URL is correct.
                </p>
                <button 
                    onClick={() => onCancel()} 
                    className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                >
                    Close Form
                </button>
            </div>
        );
    }
    
    // --- Render Section ---
    return (
        <div className={`p-6 bg-white rounded-xl shadow-2xl transition-all duration-300 ${isEditing ? 'border-4 border-yellow-400' : 'border-4 border-teal-500'}`}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Transaction Type Radio Buttons */}
                <div className="grid grid-cols-2 gap-3 p-2 border border-gray-200 rounded-lg">
                    {types.map(t => (
                        <label key={t} className={`flex items-center justify-center p-2 rounded-md font-semibold cursor-pointer transition ${formData.type === t ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            <input 
                                type="radio" 
                                name="type" 
                                value={t} 
                                checked={formData.type === t} 
                                onChange={handleChange} 
                                className="hidden"
                            />
                            {t === 'INCOME' ? 'Income' : 'Expense'}
                        </label>
                    ))}
                </div>

                {/* Amount and Description */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Amount</label>
                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount (e.g., 500.00)"
                        value={formData.amount}
                        onChange={handleChange}
                        className={inputClasses}
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />
                </div>


                {/* Category, Account, and Date */}
                <div className="grid grid-cols-2 gap-4">
                    
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                        
                        {!isAddingNewCategory ? (
                            // Display Select Dropdown for pre-built categories
                            <select 
                                name="category" 
                                value={formData.category} 
                                onChange={handleChange} 
                                className={inputClasses} 
                                required
                            >
                                {budgetCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                {/* The 'Add New Category' option */}
                                <option value={NEW_CATEGORY_FLAG} className="font-bold bg-gray-100">
                                    -- Add New Category --
                                </option>
                            </select>
                        ) : (
                            // Display Text Input when 'Add New Category' is selected
                            <div className="relative">
                                <input
                                    type="text"
                                    name="category"
                                    placeholder="Type New Category Name"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingNewCategory(false);
                                        // Reset category to the first option if possible
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            category: budgetCategories.length > 0 ? budgetCategories[0] : '' 
                                        }));
                                    }}
                                    className="absolute right-0 top-0 mt-3 mr-3 text-sm text-teal-600 hover:text-teal-800 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Account Select */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Account</label>
                        <select name="account" value={formData.account} onChange={handleChange} className={inputClasses}>
                            {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                        </select>
                    </div>
                </div>

                {/* Date Input */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />
                </div>

                {/* Savings Goal Link and Allocation Input (NEW SECTION) */}
                {formData.type === 'INCOME' && savingsGoals.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Link to Savings Goal (Optional)</label>
                        <select 
                            name="savingsGoalId" 
                            value={formData.savingsGoalId || ''} 
                            onChange={handleChange} 
                            className={inputClasses + " mb-3"}
                        >
                            <option value="">-- Do not link --</option>
                            {savingsGoals.map(goal => (
                                <option key={goal.id} value={goal.id}>
                                    {goal.goalName} (Target: ₹{goal.targetAmount})
                                </option>
                            ))}
                        </select>

                        {/* 🔑 NEW: Allocation Amount Input (Only visible if a goal is selected) */}
                        {formData.savingsGoalId && (
                            <div>
                                <label className="text-sm font-medium text-teal-600 block mb-1">
                                    Specific Amount for Savings Allocation (Optional)
                                </label>
                                <input
                                    type="number"
                                    name="savingsAllocationAmount"
                                    placeholder={`Enter amount (Max: ${formData.amount || 0})`}
                                    value={formData.savingsAllocationAmount}
                                    onChange={handleChange}
                                    className={inputClasses + " border-teal-400"}
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave blank to allocate the **entire income amount** to the goal.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex space-x-4 pt-4">
                    <button 
                        type="submit" 
                        className={`flex-1 flex items-center justify-center px-4 py-2 ${isEditing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-teal-500 hover:bg-teal-600'} text-white font-semibold rounded-lg transition duration-150`}
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {isEditing ? 'Update Transaction' : 'Save Transaction'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="w-1/4 flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition duration-150"
                    >
                        <X className="w-5 h-5 mr-1" />
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;
