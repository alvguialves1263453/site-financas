export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

export const formatDateInput = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const getMonthName = (monthIndex) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const defaultCategories = {
  income: [
    { id: 'salario', name: 'Salário', icon: 'Briefcase', color: '#22c55e' },
    { id: 'freelance', name: 'Freelance', icon: 'Laptop', color: '#3b82f6' },
    { id: 'investimentos', name: 'Investimentos', icon: 'TrendingUp', color: '#8b5cf6' },
    { id: 'outros-income', name: 'Outros', icon: 'PlusCircle', color: '#6b7280' }
  ],
  expense: [
    { id: 'alimentacao', name: 'Alimentação', icon: 'UtensilsCrossed', color: '#f59e0b' },
    { id: 'transporte', name: 'Transporte', icon: 'Car', color: '#3b82f6' },
    { id: 'moradia', name: 'Moradia', icon: 'Home', color: '#8b5cf6' },
    { id: 'lazer', name: 'Lazer', icon: 'Gamepad2', color: '#ec4899' },
    { id: 'saude', name: 'Saúde', icon: 'Heart', color: '#ef4444' },
    { id: 'educacao', name: 'Educação', icon: 'BookOpen', color: '#06b6d4' },
    { id: 'outros-expense', name: 'Outros', icon: 'MoreHorizontal', color: '#6b7280' }
  ]
};