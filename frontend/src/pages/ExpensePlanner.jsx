import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, Trash2, Edit2, X, Check, Target, BarChart3, Repeat, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'react-hot-toast';

export default function ExpensePlanner() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('expenses'); // expenses | investments
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Get current user id from localStorage
    const userId = JSON.parse(localStorage.getItem('user'))?.id || 'demo-user';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [transactionsData, statsData] = await Promise.all([
                transactionService.getAll(userId),
                transactionService.getStats(userId)
            ]);
            setTransactions(transactionsData.reverse()); // Show newest first
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            const errorMessage = error.response
                ? `Failed to load data: ${error.response.status} ${error.response.statusText}`
                : error.message.includes('Network Error')
                    ? 'Cannot connect to backend. Is the server running on http://localhost:8081?'
                    : 'Failed to load data';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const [newTransaction, setNewTransaction] = useState({ title: '', amount: '', type: 'expense', category: 'General' });

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!newTransaction.title || !newTransaction.amount) {
            toast.error('Please fill in title and amount');
            return;
        }

        const newTx = {
            ...newTransaction,
            amount: parseFloat(newTransaction.amount),
            userId: userId
            // Date will be handled by backend
        };

        try {
            const saved = await transactionService.create(newTx);
            setTransactions([saved, ...transactions]);
            setNewTransaction({ title: '', amount: '', type: 'expense', category: 'General' });
            toast.success('Transaction added successfully!');
            // Refresh stats
            const statsData = await transactionService.getStats(userId);
            setStats(statsData);
        } catch (error) {
            console.error('Error adding transaction:', error);
            const errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || (error.response
                    ? `Failed to add transaction: ${error.response.status} ${error.response.statusText}`
                    : error.message.includes('Network Error')
                        ? 'Cannot connect to backend. Is the server running?'
                        : 'Failed to add transaction');
            toast.error(errorMessage);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            await transactionService.delete(id);
            setTransactions(transactions.filter(t => t.id !== id));
            toast.success('Transaction deleted successfully!');
            // Refresh stats
            const statsData = await transactionService.getStats(userId);
            setStats(statsData);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error('Failed to delete transaction');
        }
    };

    const handleStartEdit = (transaction) => {
        setEditingId(transaction.id);
        setEditForm({
            title: transaction.title || transaction.description || '',
            amount: transaction.amount.toString(),
            type: transaction.type || 'expense',
            category: transaction.category || 'General'
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async (id) => {
        try {
            const updated = await transactionService.update(id, {
                ...editForm,
                amount: parseFloat(editForm.amount)
            });
            setTransactions(transactions.map(t => t.id === id ? updated : t));
            setEditingId(null);
            setEditForm({});
            toast.success('Transaction updated successfully!');
            // Refresh stats
            const statsData = await transactionService.getStats(userId);
            setStats(statsData);
        } catch (error) {
            console.error('Error updating transaction:', error);
            toast.error('Failed to update transaction');
        }
    };

    // Calculations - use stats if available, otherwise calculate from transactions
    const totalIncome = stats?.totalIncome || transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalExpense = stats?.totalExpense || transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalInvestment = stats?.totalInvestment || transactions.filter(t => t.type === 'investment').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const balance = stats?.balance || (totalIncome - totalExpense - totalInvestment);

    // Chart Data - use real expense breakdown from stats
    const expenseData = stats?.expenseByCategory
        ? Object.entries(stats.expenseByCategory).map(([name, value]) => ({ name, value }))
        : [];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-full">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium opacity-90 dark:opacity-95">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold flex items-center text-white">
                            <Wallet className="mr-2 h-6 w-6" /> ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500 dark:text-green-400 flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5" /> +₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500 dark:text-red-400 flex items-center">
                            <TrendingDown className="mr-2 h-5 w-5" /> -₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Investments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500 dark:text-purple-400 flex items-center">
                            <DollarSign className="mr-2 h-5 w-5" /> ₹{totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                <Card
                    className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 cursor-pointer"
                    onClick={() => navigate('/budgets')}
                >
                    <CardHeader>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                            <Target className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">Budgets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>Manage monthly budgets</CardDescription>
                        <ArrowRight className="w-4 h-4 mt-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                </Card>

                <Card
                    className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 cursor-pointer"
                    onClick={() => navigate('/analytics')}
                >
                    <CardHeader>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform duration-300">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>Financial insights</CardDescription>
                        <ArrowRight className="w-4 h-4 mt-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                </Card>

                <Card
                    className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 cursor-pointer"
                    onClick={() => navigate('/investments')}
                >
                    <CardHeader>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">Investments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>Portfolio tracker</CardDescription>
                        <ArrowRight className="w-4 h-4 mt-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                </Card>

                <Card
                    className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 cursor-pointer"
                    onClick={() => navigate('/recurring')}
                >
                    <CardHeader>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform duration-300">
                            <Repeat className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">Recurring</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>Recurring transactions</CardDescription>
                        <ArrowRight className="w-4 h-4 mt-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                </Card>

                <Card
                    className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 cursor-pointer"
                    onClick={() => navigate('/reports')}
                >
                    <CardHeader>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-pink-500/10 text-pink-500 group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>Financial reports</CardDescription>
                        <ArrowRight className="w-4 h-4 mt-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">

                {/* Left Column: Form & List */}
                <div className="lg:col-span-2 space-y-6 w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Transaction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddTransaction} className="flex flex-col md:flex-row gap-4 align-end items-end">
                                <div className="grid w-full gap-2">
                                    <Input
                                        placeholder="Title (e.g. Rent)"
                                        value={newTransaction.title}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid w-full gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={newTransaction.amount}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                    />
                                </div>
                                <div className="grid w-full gap-2">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                                        value={newTransaction.type}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                        <option value="investment">Investment</option>
                                    </select>
                                </div>
                                <div className="grid w-full gap-2">
                                    <Input
                                        placeholder="Category (e.g. Food, Transport)"
                                        value={newTransaction.category}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="w-full md:w-auto">
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Your latest financial activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {transactions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No transactions yet. Add your first transaction above!</p>
                                    </div>
                                ) : (
                                    transactions.map((t) => (
                                        <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                    t.type === 'expense' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                    }`}>
                                                    {t.type === 'income' ? <TrendingUp className="h-5 w-5" /> :
                                                        t.type === 'expense' ? <TrendingDown className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                                                </div>
                                                {editingId === t.id ? (
                                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                                        <Input
                                                            value={editForm.title}
                                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                            placeholder="Title"
                                                            className="text-sm"
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={editForm.amount}
                                                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                                            placeholder="Amount"
                                                            className="text-sm"
                                                        />
                                                        <select
                                                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                            value={editForm.type}
                                                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                                        >
                                                            <option value="expense">Expense</option>
                                                            <option value="income">Income</option>
                                                            <option value="investment">Investment</option>
                                                        </select>
                                                        <Input
                                                            value={editForm.category}
                                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                            placeholder="Category"
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex-1">
                                                        <p className="font-medium">{t.title || t.description}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {t.date ? (typeof t.date === 'string' ? new Date(t.date).toLocaleDateString() : new Date(t.date).toLocaleDateString()) : 'Today'} • {t.category || t.type}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {editingId === t.id ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleSaveEdit(t.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={handleCancelEdit}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <X className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={`font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' :
                                                            t.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
                                                            }`}>
                                                            {t.type === 'income' ? '+' : '-'}₹{(parseFloat(t.amount) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleStartEdit(t)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteTransaction(t.id)}
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Key Metrics / Graphs */}
                <div className="space-y-6 w-full min-w-0">
                    <Card className="h-full w-full min-w-0">
                        <CardHeader>
                            <CardTitle>Expense Breakdown</CardTitle>
                            <CardDescription>Where your money goes</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {expenseData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>No expense data available</p>
                                </div>
                            ) : (
                                <div className="h-full w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={expenseData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {expenseData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--popover))',
                                                    color: 'hsl(var(--popover-foreground))',
                                                    borderRadius: '8px',
                                                    border: '1px solid hsl(var(--border))',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
