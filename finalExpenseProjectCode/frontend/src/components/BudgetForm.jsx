
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const defaultCategories = [
  'groceries',
  'rent',
  'shopping',
  'entertainment',
  'travel',
  'utilities',
  'others'
];

const NEW_CATEGORY_FLAG = '_ADD_NEW_CATEGORY';

function BudgetForm({ initialBudget, fetchBudgets, onCancel }) {
  const isEditing = !!initialBudget;

  const [categories, setCategories] = useState(defaultCategories);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  const [form, setForm] = useState({
    category: '',
    budgetAmount: '',
    targetDate: ''
  });

  /* ---------------- PREFILL (EDIT MODE) ---------------- */
  useEffect(() => {
    if (isEditing && initialBudget) {
      const dateValue =
        initialBudget.year && initialBudget.month
          ? `${initialBudget.year}-${String(initialBudget.month).padStart(2, '0')}-01`
          : '';

      setForm({
        category: initialBudget.category,
        budgetAmount: initialBudget.budgetAmount,
        targetDate: dateValue
      });
    } else {
      setForm({ category: '', budgetAmount: '', targetDate: '' });
    }
  }, [initialBudget, isEditing]);

  /* ---------------- SUBMIT ---------------- */
  const submit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('userToken');
    const d = new Date(form.targetDate);

    await axios.post(
      'http://localhost:8080/api/budgets',
      {
        category: form.category.trim().toLowerCase(), // 🔑 NORMALIZED
        budgetAmount: Number(form.budgetAmount),
        year: d.getFullYear(),
        month: d.getMonth() + 1
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchBudgets();
    onCancel();
  };

  return (
    <div className="bg-white p-6 rounded-lg w-96">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? 'Edit Budget' : 'New Budget'}
      </h2>

      <form onSubmit={submit} className="space-y-4">

        {/* CATEGORY */}
        {isEditing ? (
          <input
            value={form.category}
            disabled
            className="w-full p-3 border rounded bg-gray-100 cursor-not-allowed"
          />
        ) : (
          <>
            {!isAddingNewCategory ? (
              <select
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === NEW_CATEGORY_FLAG) {
                    setIsAddingNewCategory(true);
                    setForm({ ...form, category: '' });
                  } else {
                    setForm({ ...form, category: e.target.value });
                  }
                }}
                required
                className="w-full p-3 border rounded"
              >
                <option value="">Select Category</option>

                {categories.map(c => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}

                <option value={NEW_CATEGORY_FLAG} className="font-bold">
                  -- Add New Category --
                </option>
              </select>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter new category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full p-3 border rounded"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewCategory(false);
                    setForm({ ...form, category: '' });
                  }}
                  className="absolute right-2 top-2 text-sm text-teal-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}

        {/* BUDGET AMOUNT */}
        <input
          type="number"
          placeholder="Budget Amount"
          value={form.budgetAmount}
          onChange={(e) =>
            setForm({ ...form, budgetAmount: e.target.value })
          }
          required
          className="w-full p-3 border rounded"
        />

        {/* DATE */}
        <input
          type="date"
          value={form.targetDate}
          onChange={(e) =>
            setForm({ ...form, targetDate: e.target.value })
          }
          required
          className="w-full p-3 border rounded"
        />

        <div className="flex space-x-3">
          <button className="flex-1 bg-teal-600 text-white p-3 rounded">
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white p-3 rounded"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}

export default BudgetForm;
