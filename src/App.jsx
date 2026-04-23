import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { formatCurrency, formatDate, formatDateInput } from './utils/formatters';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { 
  Wallet, TrendingUp, TrendingDown, Receipt, CreditCard, Calendar, 
  PieChart, History, Settings, Plus, Trash2, Edit, X,
  Users, User, PiggyBank, LogOut, Building
} from 'lucide-react';
import './index.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const bankColors = ['#ffcc00', '#ec7000', '#ff6600', '#ec0000', '#004773', '#8a05be', '#000000', '#20a820', '#009c3b', '#ffde00', '#00aace', '#e31837'];

function UserSelector() {
  const { users, currentUser, switchUser, addUser } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  const current = users.find(u => u.id === currentUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addUser({
      name: formData.get('name'),
      color: formData.get('color') || colors[users.length % colors.length]
    });
    setIsModalOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="btn btn-secondary"
        onClick={() => setShowUserList(!showUserList)}
        style={{ gap: '0.25rem', padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
      >
        <User size={14} />
        <span>{current?.name || 'User'}</span>
        <span style={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          background: current?.color || '#6366f1',
          display: 'inline-block'
        }} />
      </button>

      {showUserList && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '0.5rem',
          minWidth: 220,
          zIndex: 1000,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
            <small className="text-muted">Selecionar Usuário</small>
          </div>
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => { switchUser(user.id); setShowUserList(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem',
                background: user.id === currentUser ? 'var(--bg-tertiary)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem'
              }}
            >
              <span style={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                background: user.color 
              }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{user.name}</span>
              {user.id === currentUser && <span className="text-success">✓</span>}
            </button>
          ))}
          <button
            onClick={() => { setIsModalOpen(true); setShowUserList(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              marginTop: '0.5rem'
            }}
          >
            <Plus size={16} />
            <span>Novo Usuário</span>
          </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Usuário">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-4">
              <label className="input-label">Nome</label>
              <input name="name" className="input" required placeholder="Ex: João, Maria..." />
            </div>
            <div className="input-group">
              <label className="input-label">Cor</label>
              <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {colors.map(c => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="radio" name="color" value={c} defaultChecked={c === colors[0]} style={{ display: 'none' }} />
                    <span style={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      background: c,
                      border: '2px solid transparent'
                    }} />
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Criar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Totalizer() {
  const { users, getUserBalance, getTotalBalance } = useFinance();
  const total = getTotalBalance();

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header">
        <h3 className="card-title">
          <PiggyBank size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Total Combinado (Casal)
        </h3>
      </div>
      <div className="card-body">
        <div className="grid grid-4">
          <div className="stat-card">
            <div className="stat-label">Saldo Total</div>
            <div className={`stat-value ${total.balance >= 0 ? 'success' : 'danger'}`}>
              {formatCurrency(total.balance)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Entradas Total</div>
            <div className="stat-value success">{formatCurrency(total.income)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Gastos Total</div>
            <div className="stat-value danger">{formatCurrency(total.expense)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Usuários</div>
            <div className="stat-value">{users.length}</div>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <small className="text-muted">Por Usuário:</small>
          <div className="grid grid-2" style={{ marginTop: '0.5rem', gap: '1rem' }}>
            {users.map(user => {
              const balance = getUserBalance(user.id);
              return (
                <div key={user.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius)'
                }}>
                  <div className="flex items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: user.color }} />
                    <span>{user.name}</span>
                  </div>
                  <span className={balance.balance >= 0 ? 'text-success' : 'text-danger'}>
                    {formatCurrency(balance.balance)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabNav() {
  const tabs = [
    { path: '/', icon: Wallet, label: 'Dash' },
    { path: '/entradas', icon: TrendingUp, label: 'Entr' },
    { path: '/gastos', icon: TrendingDown, label: 'Gast' },
    { path: '/parcelamentos', icon: CreditCard, label: 'Parc' },
    { path: '/bancos', icon: Building, label: 'Banc' },
    { path: '/categorias', icon: PieChart, label: 'Cat' },
    { path: '/fixos', icon: Calendar, label: 'Fix' },
    { path: '/historico', icon: History, label: 'Hist' },
  ];

  return (
    <div className="tabs">
      {tabs.map(tab => (
        <NavLink key={tab.path} to={tab.path} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <tab.icon size={14} />
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
  const { currentUser, users, getCurrentUserTransactions, getUserTransactions, installments, getUserBalance, categories } = useFinance();
  const current = users.find(u => u.id === currentUser);
  const balance = getUserBalance(currentUser);

  const userTransactions = getCurrentUserTransactions();

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      months.push({
        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
        income: userTransactions
          .filter(t => t.type === 'income' && t.date.startsWith(monthKey))
          .reduce((s, t) => s + parseFloat(t.value || 0), 0),
        expense: userTransactions
          .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
          .reduce((s, t) => s + parseFloat(t.value || 0), 0)
      });
    }
    return months;
  }, [userTransactions]);

  const categoryData = useMemo(() => {
    const expensesByCategory = {};
    userTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = categories.expense.find(c => c.id === t.category);
        const name = cat ? cat.name : 'Outros';
        expensesByCategory[name] = (expensesByCategory[name] || 0) + parseFloat(t.value || 0);
      });
    return Object.entries(expensesByCategory).map(([label, value]) => ({ label, value }));
  }, [userTransactions, categories]);

  const pieData = {
    labels: categoryData.map(c => c.label),
    datasets: [{
      data: categoryData.map(c => c.value),
      backgroundColor: colors,
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

  const barOptions = { plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } } }, scales: { y: { beginAtZero: true }, x: {} } };

  const balanceClass = balance.balance >= 0 ? 'success' : 'danger';

  const upcomingInstallments = useMemo(() => {
    return installments
      .filter(i => i.userId === currentUser && i.status === 'active')
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
      .slice(0, 3);
  }, [installments, currentUser]);

  return (
    <div className="page active">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: current?.color }} />
          <span>{current?.name}</span>
        </div>
      </div>

      <Totalizer />

      <div className="grid grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-label">Seu Saldo</div>
          <div className={`stat-value ${balanceClass}`}>{formatCurrency(balance.balance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Suas Entradas</div>
          <div className="stat-value success">{formatCurrency(balance.income)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Seus Gastos</div>
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
            <h3 className="card-title">Seus Gastos por Categoria</h3>
          </div>
          <div className="chart-container">
            {categoryData.length > 0 ? (
              <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <div className="empty-state"><Receipt size={48} /><p>Nenhum gasto registrado</p></div>
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
    </div>
  );
}

function TransactionList({ type }) {
  const { currentUser, banks, categories, getCurrentUserTransactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ category: '', date: '', bank: '' });

  const catList = categories[type === 'income' ? 'income' : 'expense'];
  const transactions = getCurrentUserTransactions().filter(t => t.type === type);

  const filtered = transactions
    .filter(t => !filter.category || t.category === filter.category)
    .filter(t => !filter.date || t.date.startsWith(filter.date))
    .filter(t => !filter.bank || t.bankId === filter.bank)
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
      bankId: formData.get('bankId'),
      paymentMethod: formData.get('paymentMethod') || 'dinheiro'
    };
    if (editing) updateTransaction(editing.id, data);
    else addTransaction(data);
    setIsModalOpen(false);
    setEditing(null);
  };

  const openEdit = (t) => {
    setEditing(t);
    setIsModalOpen(true);
  };

  const total = filtered.reduce((s, t) => s + parseFloat(t.value || 0), 0);
  const valueClass = type === 'income' ? 'text-success' : 'text-danger';
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
        <select className="select" value={filter.bank} onChange={e => setFilter({ ...filter, bank: e.target.value })}>
          <option value="">Todos bancos</option>
          {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <input type="month" className="input" value={filter.date} onChange={e => setFilter({ ...filter, date: e.target.value })} />
      </div>

      {filtered.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Banco</th>
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
              const bank = banks.find(b => b.id === t.bankId);
              return (
                <tr key={t.id}>
                  <td>{t.description}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: bank?.color || '#666' }} />
                      {bank?.name || '-'}
                    </div>
                  </td>
                  <td><span className="badge badge-info">{cat ? cat.name : '-'}</span></td>
                  <td>{formatDate(t.date)}</td>
                  <td className="text-muted">{t.paymentMethod}</td>
                  <td className={valueClass}>{formatCurrency(t.value)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="icon-btn" onClick={() => openEdit(t)}><Edit size={16} /></button>
                      <button className="icon-btn danger" onClick={() => deleteTransaction(t.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}><strong>Total</strong></td>
              <td className={valueClass}><strong>{formatCurrency(total)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <div className="empty-state"><Icon size={48} /><p>Nenhum registro</p></div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditing(null); }} title={editing ? 'Editar' : `Nova ${type === 'income' ? 'Entrada' : 'Despesa'}`}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-4">
              <label className="input-label">Descrição</label>
              <input name="description" className="input" required placeholder="Ex: Salário, Mercado..." defaultValue={editing?.description || ''} />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Valor</label>
                <input name="value" type="number" step="0.01" className="input" required placeholder="0,00" defaultValue={editing?.value || ''} />
              </div>
              <div className="input-group">
                <label className="input-label">Data</label>
                <input name="date" type="date" className="input" required defaultValue={editing?.date || formatDateInput(new Date())} />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Banco</label>
                <select name="bankId" className="select" required defaultValue={editing?.bankId || banks[0]?.id || ''}>
                  {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Categoria</label>
                <select name="category" className="select" required defaultValue={editing?.category || catList[0]?.id || ''}>
                  {catList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Forma de Pagamento</label>
              <select name="paymentMethod" className="select" defaultValue={editing?.paymentMethod || 'dinheiro'}>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao-credito">Cartão de Crédito</option>
                <option value="cartao-debito">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="transferencia">Transferência</option>
                <option value="boleto">Boleto</option>
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

function Installments() {
  const { currentUser, installments, categories, addInstallment, updateInstallment, deleteInstallment, payInstallment } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const userInstallments = installments.filter(i => i.userId === currentUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      description: formData.get('description'),
      value: parseFloat(formData.get('value')),
      totalInstallments: parseInt(formData.get('totalInstallments')),
      category: formData.get('category'),
      paymentMethod: formData.get('paymentMethod'),
      firstDate: formData.get('firstDate'),
      nextDueDate: formData.get('firstDate')
    };
    if (editing) updateInstallment(editing.id, data);
    else addInstallment(data);
    setIsModalOpen(false);
    setEditing(null);
  };

  const activeList = userInstallments.filter(i => i.status === 'active').sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  const paidList = userInstallments.filter(i => i.status === 'paid').sort((a, b) => new Date(b.nextDueDate) - new Date(a.nextDueDate));
  const activeTotal = activeList.reduce((s, i) => s + (parseFloat(i.value || 0) / i.totalInstallments), 0);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Parcelamentos</h3>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
          <Plus size={18} /> Novo
        </button>
      </div>

      {activeList.length > 0 && (
        <>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
            <span className="badge badge-warning">Ativos</span>
            <span className="text-muted" style={{ marginLeft: '1rem' }}>Total: {formatCurrency(activeTotal)}</span>
          </div>
          <table className="table">
            <thead>
              <tr><th>Descrição</th><th>Parcela</th><th>Valor</th><th>Total</th><th>Próximo</th><th style={{ width: 100 }}>Ações</th></tr>
            </thead>
            <tbody>
              {activeList.map(i => (
                <tr key={i.id}>
                  <td>{i.description}</td>
                  <td>{i.paidInstallments + 1}/{i.totalInstallments}</td>
                  <td>{formatCurrency(parseFloat(i.value || 0) / i.totalInstallments)}</td>
                  <td>{formatCurrency(i.value)}</td>
                  <td>{formatDate(i.nextDueDate)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-primary" onClick={() => payInstallment(i.id)}>Pagar</button>
                      <button className="icon-btn danger" onClick={() => deleteInstallment(i.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {paidList.length > 0 && (
        <>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}><span className="badge badge-success">Quitados</span></div>
          <table className="table">
            <thead>
              <tr><th>Descrição</th><th>Total</th><th>Data</th></tr>
            </thead>
            <tbody>
              {paidList.map(i => (
                <tr key={i.id}>
                  <td>{i.description}</td>
                  <td className="text-success">{formatCurrency(i.value)}</td>
                  <td className="text-muted">{formatDate(i.nextDueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {userInstallments.length === 0 && <div className="empty-state"><CreditCard size={48} /><p>Nenhum parcelamento</p></div>}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditing(null); }} title="Novo Parcelamento">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-4">
              <label className="input-label">Descrição</label>
              <input name="description" className="input" required defaultValue={editing?.description || ''} />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Valor Total</label>
                <input name="value" type="number" step="0.01" className="input" required defaultValue={editing?.value || ''} />
              </div>
              <div className="input-group">
                <label className="input-label">Parcelas</label>
                <input name="totalInstallments" type="number" className="input" required defaultValue={editing?.totalInstallments || 12} />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Primeira Parcela</label>
                <input name="firstDate" type="date" className="input" required defaultValue={editing?.firstDate || formatDateInput(new Date())} />
              </div>
              <div className="input-group">
                <label className="input-label">Categoria</label>
                <select name="category" className="select" required defaultValue={editing?.category || categories.expense[0]?.id}>
                  {categories.expense.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Forma de Pagamento</label>
              <select name="paymentMethod" className="select" defaultValue={editing?.paymentMethod || 'cartao-credito'}>
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

function Banks() {
  const { banks, addBank, updateBank, deleteBank } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      color: formData.get('color') || bankColors[0]
    };
    if (editing) updateBank(editing.id, data);
    else addBank(data);
    setIsModalOpen(false);
    setEditing(null);
  };

  const openEdit = (b) => {
    setEditing(b);
    setIsModalOpen(true);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Bancos</h3>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
          <Plus size={18} /> Novo Banco
        </button>
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {banks.map(b => (
          <div key={b.id} className="flex items-center gap-2" style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: b.color }} />
            <span>{b.name}</span>
            <button className="icon-btn" onClick={() => openEdit(b)}><Edit size={14} /></button>
            <button className="icon-btn danger" onClick={() => deleteBank(b.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditing(null); }} title={editing ? 'Editar Banco' : 'Novo Banco'}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-4">
              <label className="input-label">Nome do Banco</label>
              <input name="name" className="input" required placeholder="Ex: Nubank, Itau..." defaultValue={editing?.name || ''} />
            </div>
            <div className="input-group">
              <label className="input-label">Cor</label>
              <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {bankColors.map(c => (
                  <label key={c} style={{ display: 'flex', cursor: 'pointer' }}>
                    <input type="radio" name="color" value={c} defaultChecked={c === (editing?.color || bankColors[0])} />
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: c }} />
                  </label>
                ))}
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

function Categories() {
  const { categories, addCategory, deleteCategory } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState('expense');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addCategory(type, { name: formData.get('name'), color: formData.get('color') || '#6366f1' });
    setIsModalOpen(false);
  };

  return (
    <div className="grid grid-2 gap-4">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Categorias de Entrada</h3>
          <button className="btn btn-sm btn-primary" onClick={() => { setType('income'); setIsModalOpen(true); }}><Plus size={16} /></button>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {categories.income.map(c => (
            <div key={c.id} className="flex items-center gap-2" style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.color }} />
              <span>{c.name}</span>
              <button className="icon-btn" onClick={() => deleteCategory('income', c.id)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Categorias de Gasto</h3>
          <button className="btn btn-sm btn-primary" onClick={() => { setType('expense'); setIsModalOpen(true); }}><Plus size={16} /></button>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {categories.expense.map(c => (
            <div key={c.id} className="flex items-center gap-2" style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.color }} />
              <span>{c.name}</span>
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
              <input name="name" className="input" required />
            </div>
            <div className="input-group">
              <label className="input-label">Cor</label>
              <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {colors.map(c => (
                  <label key={c} style={{ display: 'flex', cursor: 'pointer' }}>
                    <input type="radio" name="color" value={c} defaultChecked={c === colors[0]} />
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: c }} />
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
  const { currentUser, fixedExpenses, addFixedExpense, deleteFixedExpense } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userFrequent = fixedExpenses.filter(f => f.userId === currentUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addFixedExpense({
      description: formData.get('description'),
      value: parseFloat(formData.get('value')),
      frequency: formData.get('frequency'),
      dayOfMonth: parseInt(formData.get('dayOfMonth'))
    });
    setIsModalOpen(false);
  };

  const total = userFrequent.reduce((s, f) => s + f.value, 0);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Gastos Fixos</h3>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Adicionar</button>
      </div>
      {userFrequent.length > 0 ? (
        <table className="table">
          <thead><tr><th>Descrição</th><th>Valor</th><th>Frequência</th><th>Dia</th><th style={{ width: 80 }}>Ações</th></tr></thead>
          <tbody>
            {userFrequent.map(f => (
              <tr key={f.id}>
                <td>{f.description}</td>
                <td className="text-danger">{formatCurrency(f.value)}</td>
                <td>{f.frequency === 'monthly' ? 'Mensal' : f.frequency === 'weekly' ? 'Semanal' : 'Anual'}</td>
                <td>Dia {f.dayOfMonth}</td>
                <td><button className="icon-btn danger" onClick={() => deleteFixedExpense(f.id)}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><td><strong>Total Mensal</strong></td><td className="text-danger"><strong>{formatCurrency(total)}</strong></td><td colSpan={3}></td></tr></tfoot>
        </table>
      ) : (
        <div className="empty-state"><Calendar size={48} /><p>Nenhum gasto fixo</p></div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Gasto Fixo">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-4">
              <label className="input-label">Descrição</label>
              <input name="description" className="input" required />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Valor</label>
                <input name="value" type="number" step="0.01" className="input" required />
              </div>
              <div className="input-group">
                <label className="input-label">Dia do Mês</label>
                <input name="dayOfMonth" type="number" min="1" max="31" className="input" defaultValue={5} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Frequência</label>
              <select name="frequency" className="select">
                <option value="monthly">Mensal</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
              </select>
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
  const { currentUser, getCurrentUserTransactions, getAllTransactions, users, banks } = useFinance();
  const [filter, setFilter] = useState({ type: '', search: '', user: '', bank: '' });

  const allTransactions = getAllTransactions();
  const userTransactions = getCurrentUserTransactions();
  const showAll = filter.user === 'all';

  const items = showAll ? allTransactions : userTransactions;

  const filtered = items
    .filter(item => !filter.type || item.type === filter.type)
    .filter(item => !filter.search || item.description.toLowerCase().includes(filter.search.toLowerCase()))
    .filter(item => !filter.bank || item.bankId === filter.bank)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const valueClass = (item) => item.type === 'income' ? 'text-success' : 'text-danger';

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Histórico</h3>
        <div className="flex gap-3">
          <select className="select" value={filter.user} onChange={e => setFilter({ ...filter, user: e.target.value })}>
            <option value="">Meu Histórico</option>
            <option value="all">Histórico Completo</option>
          </select>
          <select className="select" value={filter.bank} onChange={e => setFilter({ ...filter, bank: e.target.value })}>
            <option value="">Todos bancos</option>
            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
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
            <tr><th>Data</th><th>Descrição</th><th>Banco</th><th>Usuário</th><th>Tipo</th><th>Valor</th></tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => {
              const user = users.find(u => u.id === item.userId);
              const bank = banks.find(b => b.id === item.bankId);
              return (
                <tr key={idx}>
                  <td>{formatDate(item.date)}</td>
                  <td><div>{item.description}</div></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: bank?.color || '#666' }} />
                      {bank?.name || '-'}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: user?.color }} />
                      {user?.name}
                    </div>
                  </td>
                  <td><span className={`badge ${item.type === 'income' ? 'badge-success' : 'badge-danger'}`}>{item.type === 'income' ? 'Entrada' : 'Gasto'}</span></td>
                  <td className={valueClass(item)}>{formatCurrency(item.value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="empty-state"><History size={48} /><p>Nenhum registro</p></div>
      )}
    </div>
  );
}

function AppContent() {
  return (
    <HashRouter>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon"><Wallet size={18} /></div>
              Finanças
            </div>
            <TabNav />
            <UserSelector />
          </div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entradas" element={<TransactionList type="income" />} />
            <Route path="/gastos" element={<TransactionList type="expense" />} />
            <Route path="/parcelamentos" element={<Installments />} />
            <Route path="/bancos" element={<Banks />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/fixos" element={<FixedExpenses />} />
            <Route path="/historico" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
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