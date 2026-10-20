import { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, AlertTriangle, CheckCircle, XCircle, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BudgetPlanning() {
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState({ warnings: [], exceeded: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [formData, setFormData] = useState({
    category: '',
    limitAmount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    period: 'monthly'
  });

  const userId = JSON.parse(localStorage.getItem('user'))?.id || 'demo-user';

  useEffect(() => {
    fetchBudgets();
    fetchAlerts();
  }, [selectedMonth, selectedYear]);

  const fetchBudgets = async () => {
    try {
      const data = await budgetService.getByMonth(userId, selectedMonth, selectedYear);
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await budgetService.getAlerts(userId);
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetData = {
        userId,
        category: formData.category,
        limitAmount: parseFloat(formData.limitAmount),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        period: formData.period
      };

      if (editingId) {
        await budgetService.update(editingId, budgetData);
        toast.success('Budget updated successfully');
      } else {
        await budgetService.create(budgetData);
        toast.success('Budget created successfully');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ category: '', limitAmount: '', month: selectedMonth, year: selectedYear, period: 'monthly' });
      fetchBudgets();
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to save budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget.id);
    setFormData({
      category: budget.category,
      limitAmount: budget.limitAmount.toString(),
      month: budget.month || selectedMonth,
      year: budget.year || selectedYear,
      period: budget.period || 'monthly'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await budgetService.delete(id);
      toast.success('Budget deleted');
      fetchBudgets();
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const getBudgetStatus = (budget) => {
    const percentage = budget.limitAmount > 0 
      ? (budget.spent / budget.limitAmount) * 100 
      : 0;
    
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-500', bg: 'bg-red-500' };
    if (percentage >= 80) return { status: 'warning', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { status: 'safe', color: 'text-green-500', bg: 'bg-green-500' };
  };

  const categories = ['Food', 'Travel', 'Rent', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budget Planning</h1>
          <p className="text-gray-600 mt-2">Manage your monthly budgets and track spending</p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(alerts.warnings?.length > 0 || alerts.exceeded?.length > 0) && (
        <div className="space-y-2">
          {alerts.exceeded?.length > 0 && (
            <Card className="border-red-500 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <strong>Budget Exceeded:</strong>
                  {alerts.exceeded.map(b => b.category).join(', ')}
                </div>
              </CardContent>
            </Card>
          )}
          {alerts.warnings?.length > 0 && (
            <Card className="border-yellow-500 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-5 h-5" />
                  <strong>Budget Warning (80%+):</strong>
                  {alerts.warnings.map(b => b.category).join(', ')}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Budget Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Budget Limit (₹)</label>
                <Input
                  type="number"
                  value={formData.limitAmount}
                  onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
                  placeholder="Enter budget limit"
                  required
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ category: '', limitAmount: '', month: selectedMonth, year: selectedYear, period: 'monthly' });
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budget List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : budgets.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No budgets set for this month. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const percentage = budget.limitAmount > 0 
              ? Math.min((budget.spent / budget.limitAmount) * 100, 100) 
              : 0;
            const remaining = budget.limitAmount - budget.spent;

            return (
              <Card key={budget.id} className={status.status === 'exceeded' ? 'border-red-500' : status.status === 'warning' ? 'border-yellow-500' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      <CardDescription>
                        {new Date(budget.year, budget.month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Spent: ₹{budget.spent.toFixed(2)}</span>
                        <span className={status.color}>{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${status.bg}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Limit: ₹{budget.limitAmount.toFixed(2)}</span>
                      <span className={remaining < 0 ? 'text-red-500' : 'text-green-500'}>
                        Remaining: ₹{remaining.toFixed(2)}
                      </span>
                    </div>
                    {status.status === 'exceeded' && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <XCircle className="w-4 h-4" />
                        Budget exceeded!
                      </div>
                    )}
                    {status.status === 'warning' && (
                      <div className="flex items-center gap-2 text-yellow-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Approaching limit
                      </div>
                    )}
                    {status.status === 'safe' && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        On track
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

