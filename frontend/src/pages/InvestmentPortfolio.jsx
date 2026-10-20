import { useState, useEffect } from 'react';
import { investmentService } from '../services/investmentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'react-hot-toast';

export default function InvestmentPortfolio() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [investments, setInvestments] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [liveStocks, setLiveStocks] = useState([]);
  const [fetchingStocks, setFetchingStocks] = useState(false);
  const [buyStockData, setBuyStockData] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  
  const [formData, setFormData] = useState({
    assetType: 'mutual_fund',
    assetName: '',
    investedAmount: '',
    currentValue: '',
    quantity: '',
    averagePrice: '',
    currentPrice: '',
    purchaseDate: '',
    notes: ''
  });

  const userId = JSON.parse(localStorage.getItem('user'))?.id || 'demo-user';

  useEffect(() => {
    fetchInvestments();
    fetchPortfolioSummary();
    fetchLiveStocks();
  }, []);

  const fetchInvestments = async () => {
    try {
      const data = await investmentService.getAll(userId);
      setInvestments(data);
    } catch (error) {
      console.error('Error fetching investments:', error);
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioSummary = async () => {
    try {
      const data = await investmentService.getPortfolioSummary(userId);
      setPortfolioSummary(data);
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
    }
  };

  const fetchLiveStocks = async () => {
    setFetchingStocks(true);
    try {
      const data = await investmentService.getLiveStockPrices();
      setLiveStocks(data);
    } catch (error) {
      console.error('Error fetching live stocks:', error);
    } finally {
      setFetchingStocks(false);
    }
  };

  const handleBuyStock = async () => {
    if (!buyStockData || buyQuantity <= 0) return;
    
    try {
      const result = await investmentService.buyStock(userId, buyStockData.symbol, buyQuantity);
      toast.success(result.message || 'Stock purchased successfully!');
      setBuyStockData(null);
      setBuyQuantity(1);
      fetchInvestments();
      fetchPortfolioSummary();
    } catch (error) {
      toast.error('Failed to purchase stock');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const investmentData = {
        userId,
        assetType: formData.assetType,
        assetName: formData.assetName,
        investedAmount: parseFloat(formData.investedAmount),
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        averagePrice: formData.averagePrice ? parseFloat(formData.averagePrice) : null,
        currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : null,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
        notes: formData.notes || null
      };

      if (editingId) {
        await investmentService.update(editingId, investmentData);
        toast.success('Investment updated');
      } else {
        await investmentService.create(investmentData);
        toast.success('Investment added');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        assetType: 'mutual_fund', assetName: '', investedAmount: '', currentValue: '',
        quantity: '', averagePrice: '', currentPrice: '', purchaseDate: '', notes: ''
      });
      fetchInvestments();
      fetchPortfolioSummary();
    } catch (error) {
      toast.error('Failed to save investment');
    }
  };

  const handleEdit = (investment) => {
    setEditingId(investment.id);
    setFormData({
      assetType: investment.assetType,
      assetName: investment.assetName,
      investedAmount: investment.investedAmount.toString(),
      currentValue: investment.currentValue?.toString() || '',
      quantity: investment.quantity?.toString() || '',
      averagePrice: investment.averagePrice?.toString() || '',
      currentPrice: investment.currentPrice?.toString() || '',
      purchaseDate: investment.purchaseDate ? new Date(investment.purchaseDate).toISOString().split('T')[0] : '',
      notes: investment.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;
    try {
      await investmentService.delete(id);
      toast.success('Investment deleted');
      fetchInvestments();
      fetchPortfolioSummary();
    } catch (error) {
      toast.error('Failed to delete investment');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const assetAllocationData = investments.reduce((acc, inv) => {
    const value = inv.currentValue || inv.investedAmount;
    const existing = acc.find(item => item.name === inv.assetType);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: inv.assetType, value });
    }
    return acc;
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Investment Portfolio
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Track, manage, and grow your wealth</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'portfolio' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Portfolio
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'market' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Live Market
            </button>
          </div>
          {activeTab === 'portfolio' && (
            <Button onClick={() => setShowForm(!showForm)} className="shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Manual
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'portfolio' ? (
        <>
          {/* Portfolio Summary */}
          {portfolioSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-none shadow-xl bg-gradient-to-br from-white to-blue-50/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2 text-gray-400">
                    <PieChart className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Invested</span>
                  </div>
                  <p className="text-3xl font-extrabold text-gray-900">₹{portfolioSummary.totalInvested.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-xl bg-gradient-to-br from-white to-indigo-50/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2 text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Current Value</span>
                  </div>
                  <p className="text-3xl font-extrabold text-blue-600">₹{portfolioSummary.totalCurrentValue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-xl bg-gradient-to-br from-white to-emerald-50/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2 text-gray-400">
                    <Plus className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Profit/Loss</span>
                  </div>
                  <p className={`text-3xl font-extrabold ${portfolioSummary.totalProfitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    ₹{portfolioSummary.totalProfitLoss.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-xl bg-gradient-to-br from-white via-white to-gray-50/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2 text-gray-400">
                    {portfolioSummary.profitLossPercentage >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
                    <span className="text-xs font-bold uppercase tracking-wider">Overall Return</span>
                  </div>
                  <p className={`text-3xl font-extrabold ${portfolioSummary.profitLossPercentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {portfolioSummary.profitLossPercentage.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Asset Allocation & Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {showForm && (
                <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{editingId ? 'Edit Investment' : 'Add New Investment'}</CardTitle>
                    <CardDescription>Manually enter your investment details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Asset Type</label>
                          <select
                            value={formData.assetType}
                            onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          >
                            <option value="mutual_fund">Mutual Fund</option>
                            <option value="stock">Stock</option>
                            <option value="gold">Gold</option>
                            <option value="crypto">Crypto</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Asset Name</label>
                          <Input
                            value={formData.assetName}
                            onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                            placeholder="e.g., Apple Inc."
                            required
                            className="bg-gray-50 border-none rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Invested Amount (₹)</label>
                          <Input
                            type="number"
                            value={formData.investedAmount}
                            onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })}
                            required
                            className="bg-gray-50 border-none rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Current Value (₹)</label>
                          <Input
                            type="number"
                            value={formData.currentValue}
                            onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                            className="bg-gray-50 border-none rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Quantity</label>
                          <Input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="bg-gray-50 border-none rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Avg Price</label>
                          <Input
                            type="number"
                            value={formData.averagePrice}
                            onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })}
                            className="bg-gray-50 border-none rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Current Price</label>
                          <Input
                            type="number"
                            value={formData.currentPrice}
                            onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                            className="bg-gray-50 border-none rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-2">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-6 rounded-xl font-bold shadow-lg shadow-blue-500/20">
                          {editingId ? 'Update Investment' : 'Save Investment'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1 py-6 rounded-xl border-gray-200"
                          onClick={() => {
                            setShowForm(false);
                            setEditingId(null);
                            setFormData({
                              assetType: 'mutual_fund', assetName: '', investedAmount: '', currentValue: '',
                              quantity: '', averagePrice: '', currentPrice: '', purchaseDate: '', notes: ''
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Investments List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 px-1">Recent Holdings</h3>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />)}
                  </div>
                ) : investments.length === 0 ? (
                  <Card className="border-dashed border-2 border-gray-200 shadow-none bg-gray-50/50">
                    <CardContent className="pt-12 pb-12 text-center">
                      <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Plus className="text-gray-400 w-8 h-8" />
                      </div>
                      <p className="text-gray-500 font-medium">No investments found.</p>
                      <button onClick={() => setShowForm(true)} className="text-blue-600 font-bold mt-2 hover:underline">Add your first one</button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {investments.map((investment) => {
                      const pnl = (investment.currentValue || investment.investedAmount) - investment.investedAmount;
                      const pnlPct = investment.investedAmount > 0 ? (pnl / investment.investedAmount) * 100 : 0;
                      
                      return (
                        <Card key={investment.id} className="group border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white">
                          <div className={`h-1.5 w-full ${pnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors uppercase tracking-tight">{investment.assetName}</CardTitle>
                                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-full">{investment.assetType.replace('_', ' ')}</span>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => handleEdit(investment)}>
                                  <Edit2 className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => handleDelete(investment.id)}>
                                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-rose-500" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-gray-50 rounded-2xl">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Invested</p>
                                  <p className="text-sm font-bold text-gray-900">₹{investment.investedAmount.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Current</p>
                                  <p className="text-sm font-bold text-gray-900">₹{(investment.currentValue || investment.investedAmount).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className={`flex items-center justify-between p-3 rounded-2xl ${pnl >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                <div className="flex items-center gap-2">
                                  {pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                  <span className="text-xs font-bold uppercase">Net Profit</span>
                                </div>
                                <span className="font-extrabold text-sm">
                                  {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString()} ({pnlPct.toFixed(2)}%)
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Allocation Chart Sidebar */}
            <div className="space-y-6">
              {assetAllocationData.length > 0 && (
                <Card className="border-none shadow-xl bg-white overflow-hidden">
                  <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold">Asset Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={assetAllocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {assetAllocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 space-y-3">
                      {assetAllocationData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.name.replace('_', ' ')}</span>
                          </div>
                          <span className="text-xs font-black text-gray-900">₹{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Live Market Tab */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-800">Global Markets</h2>
            <Button variant="ghost" className="text-blue-600 font-bold" onClick={fetchLiveStocks} disabled={fetchingStocks}>
              Refresh Prices
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fetchingStocks && liveStocks.length === 0 ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />)
            ) : (
              liveStocks.map((stock) => (
                <Card key={stock.symbol} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                    <TrendingUp className="w-16 h-16" />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="bg-gray-100 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-blue-600 mb-2">
                        {stock.symbol.substring(0, 2)}
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-black ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(stock.change).toFixed(2)}%
                      </div>
                    </div>
                    <CardTitle className="text-lg font-black group-hover:text-blue-600 transition-colors">{stock.name}</CardTitle>
                    <CardDescription className="font-bold tracking-widest text-gray-400 uppercase text-[10px]">{stock.symbol}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Price</span>
                        <span className="text-2xl font-extrabold text-gray-900">₹{stock.price.toLocaleString()}</span>
                      </div>
                      <Button 
                        onClick={() => setBuyStockData(stock)}
                        className="w-full bg-gray-900 group-hover:bg-blue-600 text-white rounded-xl py-6 font-bold transition-all duration-300 shadow-lg shadow-blue-500/10"
                      >
                        Quick Buy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {buyStockData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-3xl animate-in zoom-in-95 duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-black">Confirm Purchase</CardTitle>
              <CardDescription className="text-gray-500 font-medium">You are buying {buyStockData.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-4">
              <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Market Price</p>
                  <p className="text-xl font-extrabold text-gray-900">₹{buyStockData.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Fee</p>
                  <p className="text-xs font-bold text-gray-900">₹0.00 (Zero Fee)</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Quantity to Purchase</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setBuyQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <Input 
                    type="number" 
                    value={buyQuantity} 
                    onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center font-black text-xl rounded-xl border-none bg-gray-50 py-6"
                  />
                  <button 
                    onClick={() => setBuyQuantity(q => q + 1)}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-bold italic">Estimated Total</span>
                  <span className="text-2xl font-black text-blue-600">₹{(buyStockData.price * buyQuantity).toLocaleString()}</span>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleBuyStock} className="flex-1 bg-blue-600 hover:bg-blue-700 py-6 rounded-2xl font-extrabold shadow-xl shadow-blue-500/20">
                    Confirm Order
                  </Button>
                  <Button variant="outline" onClick={() => setBuyStockData(null)} className="flex-1 py-6 rounded-2xl border-gray-200 font-bold">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

