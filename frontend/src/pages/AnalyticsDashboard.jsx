import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, CheckCircle, Flame, Lightbulb, Target, ShieldCheck, Briefcase, Zap } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);
  const [year, setYear] = useState(new Date().getFullYear());

  const userId = JSON.parse(localStorage.getItem('user'))?.id || 'demo-user';

  useEffect(() => {
    fetchDashboard();
  }, [months, year]);

  const fetchDashboard = async () => {
    try {
      const data = await analyticsService.getDashboard(userId, months, year);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="container mx-auto p-6">No data available</div>;
  }

  const expenseTrend = dashboardData.expenseTrend || [];
  const incomeExpense = dashboardData.incomeExpenseComparison || {};
  const categoryGrowth = dashboardData.categoryGrowth || [];
  const savingsRate = dashboardData.savingsRate || 0;
  const budgetInsights = dashboardData.budgetInsights || [];
  const strategicAdvice = dashboardData.strategicAdvice || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive financial insights and trends</p>
        </div>
        <div className="flex gap-4">
          <select
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold">₹{incomeExpense.income?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expense</p>
                <p className="text-2xl font-bold">₹{incomeExpense.expense?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold">{savingsRate.toFixed(1)}%</p>
              </div>
              <Percent className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Savings</p>
                <p className="text-2xl font-bold">
                  ₹{((incomeExpense.income || 0) - (incomeExpense.expense || 0)).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle>Budget vs Actual</CardTitle>
            </div>
            <CardDescription>Comparison of budgeted vs spent per category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={budgetInsights} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" />
                <Bar dataKey="limitAmount" name="Budget" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="spent" name="Spent" radius={[0, 4, 4, 0]} barSize={20}>
                  {budgetInsights.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 'CRITICAL' ? '#f43f5e' : entry.status === 'WARNING' ? '#fbbf24' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Suggestions Card */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Lightbulb className="w-32 h-32" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-yellow-400 animate-pulse" />
              <CardTitle className="text-white text-2xl">Smart Budget Insights</CardTitle>
            </div>
            <CardDescription className="text-indigo-100">AI-powered suggestions to optimize your spending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {budgetInsights.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-indigo-100">No active budgets found for this month.</p>
                <button className="mt-4 px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors">Setup Budgets</button>
              </div>
            ) : (
              budgetInsights.map((insight, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-start gap-3 transition-transform hover:scale-[1.02] duration-200">
                  <div className="mt-1">
                    {insight.status === 'CRITICAL' ? <AlertTriangle className="w-5 h-5 text-rose-300" /> : 
                     insight.status === 'WARNING' ? <Flame className="w-5 h-5 text-amber-300" /> :
                     insight.status === 'CAUTION' ? <TrendingUp className="w-5 h-5 text-blue-300" /> :
                     <CheckCircle className="w-5 h-5 text-emerald-300" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      {insight.category}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black ${
                        insight.status === 'CRITICAL' ? 'bg-rose-500' : 
                        insight.status === 'WARNING' ? 'bg-amber-500' : 
                        insight.status === 'CAUTION' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}>
                        {insight.status}
                      </span>
                    </h4>
                    <p className="text-xs text-indigo-50 mt-1 leading-relaxed">{insight.suggestion}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Financial Coach - Strategic Advice */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          <h2 className="text-2xl font-bold">AI Financial Coach</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {strategicAdvice.map((advice, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <div className={`h-1 w-full ${
                advice.impact === 'HIGH' ? 'bg-rose-500' : 
                advice.impact === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${
                    advice.category === 'Control' ? 'bg-rose-50' : 
                    advice.category === 'Save' ? 'bg-emerald-50' : 
                    advice.category === 'Invest' ? 'bg-blue-50' : 'bg-amber-50'
                  }`}>
                    {advice.category === 'Control' ? <TrendingDown className="w-6 h-6 text-rose-600" /> :
                     advice.category === 'Save' ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> :
                     advice.category === 'Invest' ? <Briefcase className="w-6 h-6 text-blue-600" /> :
                     <Target className="w-6 h-6 text-amber-600" />}
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tighter ${
                    advice.impact === 'HIGH' ? 'bg-rose-100 text-rose-700' : 
                    advice.impact === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {advice.impact} Impact
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {advice.category} Suggestion
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {advice.message}
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Take Action <TrendingUp className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Expense Trend Line Chart */}

      {/* Income vs Expense Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expense Comparison</CardTitle>
          <CardDescription>Compare your income and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ name: 'Financial Overview', income: incomeExpense.income || 0, expense: incomeExpense.expense || 0 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#00C49F" />
              <Bar dataKey="expense" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Growth Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Category Growth Analysis</CardTitle>
          <CardDescription>Track category-wise spending changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categoryGrowth.map((item, index) => {
              const change = item.secondPeriod - item.firstPeriod;
              const changePercent = item.firstPeriod > 0 
                ? ((change / item.firstPeriod) * 100).toFixed(1) 
                : '0.0';
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.category}</span>
                      <span className={`text-sm ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(changePercent)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Previous: ₹{item.firstPeriod.toFixed(2)} → Current: ₹{item.secondPeriod.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

