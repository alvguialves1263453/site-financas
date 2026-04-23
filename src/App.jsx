import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { formatCurrency, formatDate, formatDateInput } from './utils/formatters';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { 
  Wallet, TrendingUp, TrendingDown, Receipt, CreditCard, Calendar, 
  PieChart, History, Settings, Plus, Trash2, Edit, X,
  Briefcase, Home, Car, UtensilsCrossed, Gamepad2, Heart, BookOpen,
  MoreHorizontal, Laptop, PlusCircle, PiggyBank, DollarSign
} from 'lucide-react';
import './index.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

function TabNav() {
  const tabs = [
    { path: '/', icon: Wallet, label: 'Dashboard' },
    { path: '/entradas', icon: TrendingUp, label: 'Entradas' },
    { path: '/gastos', icon: TrendingDown, label: 'Gastos' },
    { path: '/parcelamentos', icon: CreditCard, label: 'Parcelas' },
    { path: '/categorias', icon: PieChart, label: 'Categorias' },
    { path: '/fixos', icon: Calendar, label: 'Fixos' },
    { path: '/historico', icon: History, label: 'Historico' },
    { path: '/configuracoes', icon: Settings, label: 'Config' },
  ];

  return (
    <div className="tabs">
      {tabs.map(tab => (
        <NavLink key={tab.path} to={tab.path} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <tab.icon size={18} />
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Dashboard() {
  const { transactions, installments, getBalance, categories } = useFinance();
  const balance = getBalance();

  const upcomingInstallments = useMemo(() => {
    return installments
      .filter(i => i.status === 'active')
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
      .slice(0, 5);
  }, [installments]);

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      months.push({
        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
        income: transactions
          .filter(t => t.type === 'income' && t.date.startsWith(monthKey))
          .reduce((s, t) => s + parseFloat(t.value), 0),
        expense: transactions
          .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
          .reduce((s, t) => s + parseFloat(t.value), 0)
      });
    }
    return months;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = categories.expense.find(c => c.id === t.category);
        const name = cat ? cat.name : 'Outros';
        expensesByCategory[name] = (expensesByCategory[name] || 0) + parseFloat(t.value);
      });
    return Object.entries(expensesByCategory).map(([label, value]) => ({ label, value }));
  }, [transactions, categories]);

  const pieData = {
    labels: categoryData.map(c => c.label),
    datasets: [{
      data: categoryData.map(c => c.value),
      backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
      borderWidth: 0
    }]
  };

  const barData = {
    labels: monthlyData.map(m => m.month),
    datasets: [
      { label: 'Entradas', data: monthlyData.map(m => m.income), backgroundColor: '#22c55e', borderRadius: 6 },
      { label: 'Gastos', data: monthlyData.map(m => m.expense), backgroundColor: '#ef4444', borderRadius: 6 }
    ]
  };

  const barOptions = {
    plugins: { 
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } } 
    },
    scales: { 
      y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
      x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
    }
  };

  const balanceClass = balance.balance >= 0 ? 'success' : 'danger';

  return (
    <div className="page active">
      <div className="grid grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-label">Saldo Atual</div>
          <div className={`stat-value ${balanceClass}`}>{formatCurrency(balance.balance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Entradas</div>
          <div className="stat-value success">{formatCurrency(balance.income)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Gastos</div>
          <div className="stat-value danger">{formatCurrency(balance.expense)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pendentes</div>
          <div className="stat-value">{upcomingInstallments.length}</div>
        </div>
      </div>

      <div className="grid grid-2 gap-4 mb-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gastos por Categoria</h3>
          </div>
          <div className="chart-container">
            {categoryData.length > 0 ? (
              <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } } } }} />
            ) : (
              <div className="empty-state">
                <Receipt size={48} />
                <p>Nenhum gasto registrado</p>
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Evolução Mensal</h3>
          </div>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Próximos Vencimentos</h3>
        </div>
        {upcomingInstallments.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Parcela</th>
                <th>Vencimento</th>
              </tr>
            </thead>
            <tbody>
              {upcomingInstallments.map(i => (
                <tr key={i.id}>
                  <td>{i.description}</td>
                  <td>{formatCurrency(i.value / i.totalInstallments)}</td>
                  <td>{i.paidInstallments + 1} de {i.totalInstallments}</td>
                  <td>{formatDate(i.nextDueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <CreditCard size={48} />
            <p>Nenhum parcelamento ativo</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionList({ type }) {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, categories } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ category: '', date: '' });

  const catList = categories[type === 'income' ? 'income' : 'expense'];

  const filtered = transactions
    .filter(t => t.type === type)
    .filter(t => !filter.category || t.category === filter.category)
    .filter(t => !filter.date || t.date.startsWith(filter.date))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      type,
      value: parseFloat(formData.get('value')),
      description: formData.get('description'),
      date: formData.get('date'),
      category: formData.get('category'),
      paymentMethod: formData.get('paymentMethod') || 'dinheiro'
    };
    if (editing) {
      updateTransaction(editing.id, data);
    } else {
      addTransaction(data);
    }
    setIsModalOpen(false);
    setEditing(null);
  };

  const openEdit = (t) => {
    setEditing(t);
    setIsModalOpen(true);
  };

  const total = filtered.reduce((s, t) => s + parseFloat(t.value), 0);
  const valueClass = type === 'income' ? 'text-success' : 'text-danger';
  const typeLabel = type === 'income' ? 'Entrada' : 'Despesa';
  const typeLabelPlural = type === 'income' ? 'a entrada' : 'gasto';
  const Icon = type === 'income' ? TrendingUp : TrendingDown;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{type === 'income' ? 'Entradas' : 'Gastos'}</h3>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
          <Plus size={18} /> Adicionar
        </button>
      </div>
      
      <div className="filter-bar" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <select className="select" value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
          <option value="">Todas categorias</option>
          {catList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="month" className="input" value={filter.date} onChange={e => setFilter({ ...filter, date: e.target.value })} />
      </div>

      {filtered.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Data</th>
              <th>Forma</th>
              <th>Valor</th>
              <th style={{ width: 100 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const cat = catList.find(c => c.id === t.category);
              return (
                <tr key={t.id}>
                  <td>{t.description}</td>
                  <td><span className="badge badge-info">{cat ? cat.name : '-'}</span></td>
                  <td>{formatDate(t.date)}</td>
                  <td className="text-muted">{t.paymentMethod}</td>
                  <td className={valueClass}>{formatCurrency(t.value)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="icon-btn" onClick={() => openEdit(t)} title="Editar"><Edit size={16} /></button>
                      <button className="icon-btn danger" onClick={() => deleteTransaction(t.id)} title="Excluir"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}><strong>Total</strong></td>
              <td className={valueClass}><strong>{formatCurrency(total)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <div className="empty-state">
          <Icon size={48} />
          <p>Nenhum{typeLabelPlural} registrada</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditing(null); }} title={editing ? 'Editar' : `Nova ${typeLabel}`}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-4">
              <label className="input-label">Descrição</label>
              <input name="description" className="input" required placeholder="Ex: Salário, Supermercado..." defaultValue={editing ? editing.description : ''} />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Valor</label>
                <input name="value" type="number" step="0.01" className="input" required placeholder="0,00" defaultValue={editing ? editing.value : ''} />
              </div>
              <div className="input-group">
                <label className="input-label">Data</label>
                <input name="date" type="date" className="input" required defaultValue={editing ? editing.date : formatDateInput(new Date())} />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Categoria</label>
                <select name="category" className="select" required defaultValue={editing ? editing.category : (catList[0] ? catList[0].id : '')}>
                  {catList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Forma de Pagamento</label>
                <select name="paymentMethod" className="select" defaultValue={editing ? editing.paymentMethod : 'dinheiro'}>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao-credito">Cartão de Crédito</option>
                  <option value="cartao-debito">Cartão de Débito</option>
                  <option value="pix">PIX</option>
                  <option value="transferencia">Transferência</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setEditing(null); }}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Installments() {
  const { installments, addInstallment, updateInstallment, deleteInstallment, payInstallment, categories } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const total = parseInt(formData.get('totalInstallments'));
    const value = parseFloat(formData.get('value'));
    const firstDate = formData.get('firstDate');
    
    const data = {
      description: formData.get('description'),
      value,
      totalInstallments: total,
      paidInstallments: editing ? editing.paidInstallments : 0,
      category: formData.get('category'),
      paymentMethod: formData.get('paymentMethod'),
      firstDate,
      nextDueDate: firstDate,
      status: editing ? editing.status : 'active'
    };

    if (editing) {
      updateInstallment(editing.id, data);
    } else {
      addInstallment(data);
    }
    setIsModalOpen(false);
    setEditing(null);
  };

  const activeList = installments.filter(i => i.status === 'active').sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  const paidList = installments.filter(i => i.status === 'paid').sort((a, b) => new Date(b.nextDueDate) - new Date(a.nextDueDate));
  const activeTotal = activeList.reduce((s, i) => s + (i.value / i.totalInstallments), 0);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Parcelamentos</h3>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
          <Plus size={18} /> Novo Parcelamento
        </button>
      </div>

      {activeList.length > 0 && (
        <>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
            <span className="badge badge-warning">Ativos</span>
            <span className="text-muted" style={{ marginLeft: '1rem' }}>Total pendente: {formatCurrency(activeTotal)}</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Parcela</th>
                <th>Valor Parc.</th>
                <th>Total</th>
                <th>Próximo</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {activeList.map(i => {
                const cat = categories.expense.find(c => c.id === i.category);
                const installmentValue = i.value / i.totalInstallments;
                return (
                  <tr key={i.id}>
                    <td>{i.description}</td>
                    <td><span className="badge badge-info">{cat ? cat.name : '-'}</span></td>
                    <td>{i.paidInstallments + 1}/{i.totalInstallments}</td>
                    <td>{formatCurrency(installmentValue)}</td>
                    <td>{formatCurrency(i.value)}</td>
                    <td>{formatDate(i.nextDueDate)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-primary" onClick={() => payInstallment(i.id)}>Pagar</button>
                        <button className="icon-btn danger" onClick={() => deleteInstallment(i.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {paidList.length > 0 && (
        <>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
            <span className="badge badge-success">Quitados</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Parcelas</th>
                <th>Total Pago</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {paidList.map(i => (
                <tr key={i.id}>
                  <td>{i.description}</td>
                  <td>{i.totalInstallments}/{i.totalInstallments}</td>
                  <td className="text-success">{formatCurrency(i.value)}</td>
                  <td className="text-muted">{formatDate(i.nextDueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {installments.length === 0 && (
        <div className="empty-state">
          <CreditCard size={48} />
          <p>Nenhum parcelamento</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditing(null); }} title="Novo Parcelamento">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-4">
              <label className="input-label">Descrição</label>
              <input name="description" className="input" required placeholder="Ex: Celular, Eletrodomésticos..." defaultValue={editing ? editing.description : ''} />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Valor Total</label>
                <input name="value" type="number" step="0.01" className="input" required placeholder="0,00" defaultValue={editing ? editing.value : ''} />
              </div>
              <div className="input-group">
                <label className="input-label">Total Parcelas</label>
                <input name="totalInstallments" type="number" className="input" required defaultValue={editing ? editing.totalInstallments : 12} />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Primeira Parcela</label>
                <input name="firstDate" type="date" className="input" required defaultValue={editing ? editing.firstDate : formatDateInput(new Date())} />
              </div>
              <div className="input-group">
                <label className="input-label">Categoria</label>
                <select name="category" className="select" required defaultValue={editing ? editing.category : categories.expense[0]?.id}>
                  {categories.expense.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Forma de Pagamento</label>
              <select name="paymentMethod" className="select" defaultValue={editing ? editing.paymentMethod : 'cartao-credito'}>
                <option value="cartao-credito">Cartão de Crédito</option>
                <option value="cartao-debito">Cartão de Débito</option>
                <option value="financiamento">Financiamento</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setEditing(null); }}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Categories() {
  const { categories, addCategory, deleteCategory } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState('expense');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addCategory(type, {
      name: formData.get('name'),
      icon: formData.get('icon') || 'PlusCircle',
      color: formData.get('color') || '#6366f1'
    });
    setIsModalOpen(false);
  };

  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  return (
    <div className="grid grid-2 gap-4">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Categorias de Entrada</h3>
          <button className="btn btn-sm btn-primary" onClick={() => { setType('income'); setIsModalOpen(true); }}>
            <Plus size={16} />
          </button>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {categories.income.map(c => (
            <div key={c.id} className="flex items-center gap-2" style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.color }} />
              <span style={{ fontSize: '0.9rem' }}>{c.name}</span>
              <button className="icon-btn" onClick={() => deleteCategory('income', c.id)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Categorias de Gasto</h3>
          <button className="btn btn-sm btn-primary" onClick={() => { setType('expense'); setIsModalOpen(true); }}>
            <Plus size={16} />
          </button>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {categories.expense.map(c => (
            <div key={c.id} className="flex items-center gap-2" style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.color }} />
              <span style={{ fontSize: '0.9rem' }}>{c.name}</span>
              <button className="icon-btn" onClick={() => deleteCategory('expense', c.id)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Categoria">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-4">
              <label className="input-label">Nome</label>
              <input name="name" className="input" required placeholder="Ex: Alimentação, Transporte..." />
            </div>
            <div className="input-group">
              <label className="input-label">Cor</label>
              <div className="flex gap-3" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {colors.map(c => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                    <input type="radio" name="color" value={c} defaultChecked={c === colors[0]} />
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FixedExpenses() {
  const { fixedExpenses, addFixedExpense, deleteFixedExpense } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addFixedExpense({
      description: formData.get('description'),
      value: parseFloat(formData.get('value')),
      frequency: formData.get('frequency'),
      category: formData.get('category'),
      dayOfMonth: parseInt(formData.get('dayOfMonth'))
    });
    setIsModalOpen(false);
  };

  const total = fixedExpenses.reduce((s, f) => s + f.value, 0);

  const frequencyLabel = (f) => {
    if (f.frequency === 'monthly') return 'Mensal';
    if (f.frequency === 'weekly') return 'Semanal';
    return 'Anual';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Gastos Fixos</h3>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Adicionar
        </button>
      </div>

      {fixedExpenses.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Frequência</th>
              <th>Dia</th>
              <th style={{ width: 80 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fixedExpenses.map(f => (
              <tr key={f.id}>
                <td>{f.description}</td>
                <td className="text-danger">{formatCurrency(f.value)}</td>
                <td>{frequencyLabel(f)}</td>
                <td>Dia {f.dayOfMonth}</td>
                <td>
                  <button className="icon-btn danger" onClick={() => deleteFixedExpense(f.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total Mensal</strong></td>
              <td className="text-danger"><strong>{formatCurrency(total)}</strong></td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <div className="empty-state">
          <Calendar size={48} />
          <p>Nenhum gasto fixo</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Gasto Fixo">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-4">
              <label className="input-label">Descrição</label>
              <input name="description" className="input" required placeholder="Ex: Internet, Aluguel..." />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Valor</label>
                <input name="value" type="number" step="0.01" className="input" required placeholder="0,00" />
              </div>
              <div className="input-group">
                <label className="input-label">Dia do Mês</label>
                <input name="dayOfMonth" type="number" min="1" max="31" className="input" defaultValue={5} />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Frequência</label>
                <select name="frequency" className="select">
                  <option value="monthly">Mensal</option>
                  <option value="weekly">Semanal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Categoria</label>
                <select name="category" className="select">
                  <option value="moradia">Moradia</option>
                  <option value="internet">Internet</option>
                  <option value="luz">Luz</option>
                  <option value="agua">Água</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function HistoryPage() {
  const { transactions, installments } = useFinance();
  const [filter, setFilter] = useState({ type: '', search: '' });

  const allItems = useMemo(() => {
    const items = [];
    transactions.forEach(t => {
      items.push({ type: t.type, description: t.description, value: t.value, date: t.date, category: t.category, subType: 'Transação' });
    });
    installments.forEach(i => {
      const installmentValue = i.value / i.totalInstallments;
      for (let p = 1; p <= i.paidInstallments; p++) {
        items.push({ type: 'expense', description: i.description + ' (' + p + '/' + i.totalInstallments + ')', value: installmentValue, date: i.firstDate, category: i.category, subType: 'Parcela' });
      }
    });
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, installments]);

  const filtered = allItems.filter(item => {
    if (filter.type && item.type !== filter.type) return false;
    if (filter.search && item.description.toLowerCase().indexOf(filter.search.toLowerCase()) === -1) return false;
    return true;
  });

  const valueClass = (item) => item.type === 'income' ? 'text-success' : 'text-danger';

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Histórico</h3>
        <div className="flex gap-3">
          <select className="select" value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}>
            <option value="">Todos</option>
            <option value="income">Entradas</option>
            <option value="expense">Gastos</option>
          </select>
          <input className="input" placeholder="Buscar..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} style={{ width: 180 }} />
        </div>
      </div>

      {filtered.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={idx}>
                <td>{formatDate(item.date)}</td>
                <td>
                  <div>{item.description}</div>
                  <small className="text-muted">{item.subType}</small>
                </td>
                <td>
                  <span className={`badge ${item.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                    {item.type === 'income' ? 'Entrada' : 'Gasto'}
                  </span>
                </td>
                <td className={valueClass(item)}>{formatCurrency(item.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <History size={48} />
          <p>Nenhum registro</p>
        </div>
      )}
    </div>
  );
}

function SettingsPage() {
  const { settings, updateSettings } = useFinance();

  const clearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      localStorage.removeItem('site-financas-data');
      window.location.reload();
    }
  };

  const monthOptions = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Configurações</h3>
      </div>
      <div className="card-body">
        <div className="input-group mb-4">
          <label className="input-label">Tema</label>
          <select className="select" value={settings.theme} onChange={e => updateSettings({ theme: e.target.value })}>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>
        <div className="input-group mb-4">
          <label className="input-label">Mês de Início do Ano Fiscal</label>
          <select className="select" value={settings.monthStart} onChange={e => updateSettings({ monthStart: parseInt(e.target.value) })}>
            {monthOptions.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />
        <div>
          <button className="btn btn-danger" onClick={clearData}>
            <Trash2 size={18} /> Limpar Todos os Dados
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <Wallet size={24} />
              </div>
              Finanças
            </div>
            <TabNav />
          </div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entradas" element={<TransactionList type="income" />} />
            <Route path="/gastos" element={<TransactionList type="expense" />} />
            <Route path="/parcelamentos" element={<Installments />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/fixos" element={<FixedExpenses />} />
            <Route path="/historico" element={<HistoryPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

export default App;