

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm'; 
import TransactionList from '../components/TransactionList'; 
import SummaryCards from '../components/SummaryCards'; 
import axios from 'axios';

const TransactionPage = () => {
    const location = useLocation(); 
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null);
    
    // Define the base URL once
    const API_BASE_URL = "http://localhost:8080/api";

    // --- Form Visibility Logic ---
    const initialShowForm = new URLSearchParams(location.search).get('action') === 'add';
    const [showForm, setShowForm] = useState(initialShowForm); 

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('action') === 'add') {
            setShowForm(true);
            setIsEditing(false);
            setCurrentTransaction(null);
        } else if (!isEditing) {
            setShowForm(false);
        }
    }, [location.search, isEditing]);
    // -----------------------------

    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem("userToken");
        return token;
    }, []); 

    const getAuthHeaders = useCallback(() => {
        const token = getAuthToken();
        if (!token) return {};
        return { headers: { Authorization: `Bearer ${token}` } };
    }, [getAuthToken]);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        const authToken = getAuthToken(); 
        if (!authToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/transactions`, getAuthHeaders());
            const sortedTransactions = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(sortedTransactions);
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            if (error.response?.status === 401) {
                alert("Session expired or unauthorized. Please log in again.");
            }
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [getAuthToken, getAuthHeaders]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleFormClose = () => {
        setIsEditing(false);
        setCurrentTransaction(null);
        setShowForm(false); 
    };

    const handleSaveTransaction = async (transactionData) => {
        setLoading(true);
        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/transactions/${transactionData.id}`, transactionData, getAuthHeaders());
            } else {
                await axios.post(`${API_BASE_URL}/transactions`, transactionData, getAuthHeaders());
            }
            
            fetchTransactions(); 
            handleFormClose(); 
            
            // 🔑 NEW LINE: Trigger refresh signal for Savings Goals page
            localStorage.setItem('goalRefreshTrigger', Date.now().toString());
            
        } catch (error) {
            console.error("Failed to save transaction:", error);
            alert("Failed to save transaction. Please check your input and ensure you are logged in.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (transaction) => {
        setIsEditing(true);
        setCurrentTransaction(transaction);
        setShowForm(true); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            setLoading(true);
            try {
                await axios.delete(`${API_BASE_URL}/transactions/${id}`, getAuthHeaders());
                
                // 🔑 NEW LINE: Trigger refresh signal on delete as well
                localStorage.setItem('goalRefreshTrigger', Date.now().toString());

                fetchTransactions(); 
            } catch (error) {
                console.error("Failed to delete transaction:", error);
                alert("Failed to delete transaction. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };
    
    // Total calculations
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    const isFormVisible = showForm || isEditing;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-800 border-b pb-2">
                Transaction Dashboard
            </h1>

            <SummaryCards 
                income={totalIncome} 
                expense={totalExpense} 
                balance={netBalance} 
            />

            <div className={`grid grid-cols-1 ${isFormVisible ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
                
                {/* Add/Edit Transaction Section (Left Column) */}
                {isFormVisible && (
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
                        </h2>
                        <TransactionForm 
                            onSave={handleSaveTransaction} 
                            isEditing={isEditing}
                            initialData={currentTransaction}
                            onCancel={handleFormClose} 
                            authToken={getAuthToken()} 
                            API_BASE_URL={API_BASE_URL} 
                        />
                    </div>
                )}

                {/* Transaction List (Right Column) */}
                <div className={`${isFormVisible ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Transaction History
                    </h2>
                    {loading && (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                        </div>
                    )}
                    {!loading && transactions.length === 0 && (
                        <p className="text-gray-500 text-center py-10">
                            No transactions found. Add one now! 💸
                        </p>
                    )}
                    {!loading && transactions.length > 0 && (
                        <TransactionList 
                            transactions={transactions} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionPage;
