import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { defaultCategories } from '../utils/formatters';

const FinanceContext = createContext();

const STORAGE_KEY = 'site-financas-data';

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar dados:', e);
  }
};

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [settings, setSettings] = useState({
    theme: 'light',
    currency: 'BRL',
    monthStart: 1
  });
  
  const initialized = useRef(false);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setTransactions(saved.transactions || []);
      setInstallments(saved.installments || []);
      setFixedExpenses(saved.fixedExpenses || []);
      setCategories(saved.categories || defaultCategories);
      setSettings(saved.settings || { theme: 'light', currency: 'BRL', monthStart: 1 });
    }
    initialized.current = true;
  }, []);

  useEffect(() => {
    if (initialized.current) {
      saveToStorage({ transactions, installments, fixedExpenses, categories, settings });
    }
  }, [transactions, installments, fixedExpenses, categories, settings]);

  const addTransaction = (transaction) => {
    setTransactions(prev => [...prev, { ...transaction, id: Date.now().toString() }]);
  };

  const updateTransaction = (id, data) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addInstallment = (installment) => {
    const newInstallment = {
      ...installment,
      id: Date.now().toString(),
      paidInstallments: 0,
      status: 'active'
    };
    setInstallments(prev => [...prev, newInstallment]);
    return newInstallment;
  };

  const updateInstallment = (id, data) => {
    setInstallments(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const deleteInstallment = (id) => {
    setInstallments(prev => prev.filter(i => i.id !== id));
  };

  const payInstallment = (id) => {
    setInstallments(prev => prev.map(i => {
      if (i.id === id) {
        const newPaid = i.paidInstallments + 1;
        return {
          ...i,
          paidInstallments: newPaid,
          status: newPaid >= i.totalInstallments ? 'paid' : 'active'
        };
      }
      return i;
    }));
  };

  const addFixedExpense = (expense) => {
    setFixedExpenses(prev => [...prev, { ...expense, id: Date.now().toString() }]);
  };

  const updateFixedExpense = (id, data) => {
    setFixedExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteFixedExpense = (id) => {
    setFixedExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addCategory = (type, category) => {
    setCategories(prev => ({
      ...prev,
      [type]: [...prev[type], { ...category, id: Date.now().toString() }]
    }));
  };

  const updateCategory = (type, id, data) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].map(c => c.id === id ? { ...c, ...data } : c)
    }));
  };

  const deleteCategory = (type, id) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].filter(c => c.id !== id)
    }));
  };

  const updateSettings = (data) => {
    setSettings(prev => ({ ...prev, ...data }));
  };

  const getBalance = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.value), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.value), 0);

    const paidInstallments = installments
      .filter(i => i.status === 'paid' || i.status === 'active')
      .reduce((sum, i) => sum + (i.value / i.totalInstallments) * i.paidInstallments, 0);

    return {
      income: totalIncome,
      expense: totalExpense + paidInstallments,
      balance: totalIncome - totalExpense - paidInstallments
    };
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      installments,
      fixedExpenses,
      categories,
      settings,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addInstallment,
      updateInstallment,
      deleteInstallment,
      payInstallment,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      addCategory,
      updateCategory,
      deleteCategory,
      updateSettings,
      getBalance
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};