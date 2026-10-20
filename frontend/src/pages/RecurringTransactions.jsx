import { useState, useEffect } from 'react';
import { recurringTransactionService } from '../services/recurringTransactionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Pause, Play, Trash2, Edit2, Calendar, Repeat } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RecurringTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    frequency: 'monthly',
    startDate: '',
    endDate: '',
    accountId: ''
  });

  const userId = JSON.parse(localStorage.getItem('user'))?.id || 'demo-user';

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await recurringTransactionService.getAll(userId);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
      toast.error('Failed to load recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        userId,
        title: formData.title,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category || 'General',
        description: formData.description,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        accountId: formData.accountId || null,
        isActive: true
      };

      if (editingId) {
        await recurringTransactionService.update(editingId, transactionData);
        toast.success('Recurring transaction updated');
      } else {
        await recurringTransactionService.create(transactionData);
        toast.success('Recurring transaction created');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '', amount: '', type: 'expense', category: '', description: '',
        frequency: 'monthly', startDate: '', endDate: '', accountId: ''
      });
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to save recurring transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setFormData({
      title: transaction.title,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category || '',
      description: transaction.description || '',
      frequency: transaction.frequency,
      startDate: transaction.startDate || '',
      endDate: transaction.endDate || '',
      accountId: transaction.accountId || ''
    });
    setShowForm(true);
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      if (isActive) {
        await recurringTransactionService.pause(id);
        toast.success('Transaction paused');
      } else {
        await recurringTransactionService.resume(id);
        toast.success('Transaction resumed');
      }
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    try {
      await recurringTransactionService.delete(id);
      toast.success('Recurring transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const categories = ['Food', 'Travel', 'Rent', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recurring Transactions</h1>
          <p className="text-gray-600 mt-2">Manage your recurring income and expenses</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Recurring Transaction
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Monthly Rent, Netflix Subscription"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    title: '', amount: '', type: 'expense', category: '', description: '',
                    frequency: 'monthly', startDate: '', endDate: '', accountId: ''
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No recurring transactions. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction.id} className={!transaction.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{transaction.title}</CardTitle>
                    <CardDescription>
                      {transaction.type === 'expense' ? 'Expense' : 'Income'} • {transaction.frequency}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(transaction.id, transaction.isActive)}
                    >
                      {transaction.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">₹{transaction.amount.toFixed(2)}</span>
                    <span className={`px-2 py-1 rounded text-xs ${transaction.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {transaction.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  {transaction.category && (
                    <div className="text-sm text-gray-600">Category: {transaction.category}</div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Starts: {new Date(transaction.startDate).toLocaleDateString()}
                  </div>
                  {transaction.endDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Ends: {new Date(transaction.endDate).toLocaleDateString()}
                    </div>
                  )}
                  {transaction.lastGeneratedDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Repeat className="w-4 h-4" />
                      Last generated: {new Date(transaction.lastGeneratedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

