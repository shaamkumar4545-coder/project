import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Plus, 
  Calendar, 
  DollarSign, 
  Info, 
  Trash2,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import goalService from '../services/goalService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';

const GoalSimulator = () => {
    const [goals, setGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [projection, setProjection] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Simulation parameters
    const [simulation, setSimulation] = useState({ extraMonthly: 0, lumpSum: 0 });
    
    // New Goal Form
    const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', targetDate: '', category: 'General' });
    const [showForm, setShowForm] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const data = await goalService.getGoals(user.id);
            setGoals(data);
            if (data.length > 0 && !selectedGoal) {
                setSelectedGoal(data[0]);
                fetchProjection(data[0].id);
            }
        } catch (error) {
            console.error("Failed to load goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjection = async (id, extra = simulation.extraMonthly, lump = simulation.lumpSum) => {
        try {
            const data = await goalService.getProjection(id, extra, lump);
            setProjection(data);
        } catch (error) {
            console.error("Failed to load projection:", error);
        }
    };

    const handleSimulationChange = (field, value) => {
        const val = parseFloat(value) || 0;
        const newSim = { ...simulation, [field]: val };
        setSimulation(newSim);
        if (selectedGoal) {
            fetchProjection(selectedGoal.id, newSim.extraMonthly, newSim.lumpSum);
        }
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!newGoal.title || !newGoal.targetAmount || !newGoal.targetDate) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            const goalData = {
                ...newGoal,
                userId: user.id,
                targetAmount: parseFloat(newGoal.targetAmount),
                currentAmount: 0
            };
            if (isNaN(goalData.targetAmount) || goalData.targetAmount <= 0) {
                toast.error("Invalid target amount");
                return;
            }
            const saved = await goalService.create(goalData);
            setGoals([saved, ...goals]);
            setSelectedGoal(saved);
            setShowForm(false);
            setNewGoal({ title: '', targetAmount: '', targetDate: '', category: 'General' });
            fetchProjection(saved.id);
            toast.success("Goal created successfully!");
        } catch (error) {
            toast.error("Failed to create goal");
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm("Delete this goal?")) return;
        await goalService.delete(id);
        const updated = goals.filter(g => g.id !== id);
        setGoals(updated);
        if (updated.length > 0) {
            setSelectedGoal(updated[0]);
            fetchProjection(updated[0].id);
        } else {
            setSelectedGoal(null);
            setProjection(null);
        }
        toast.success("Goal deleted");
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading simulation...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Zap className="h-8 w-8 text-indigo-500 fill-indigo-500/20" />
                        AI Goal Simulator
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Visualize your future wealth and simulate "What-if" scenarios.
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Goal
                </Button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm animate-in slide-in-from-top duration-300">
                    <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Goal Title</label>
                            <Input placeholder="e.g. New Car" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Amount</label>
                            <Input type="number" placeholder="₹ 10,00,000" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Date</label>
                            <Input type="date" value={newGoal.targetDate} onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})} />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">Create Goal</Button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar: Goal Selection */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs px-2">Your Financial Targets</h3>
                    <div className="space-y-3">
                        {goals.length === 0 && <p className="text-sm text-gray-500 px-2 italic">No goals yet. Add one above!</p>}
                        {goals.map(goal => (
                            <div 
                                key={goal.id} 
                                onClick={() => { setSelectedGoal(goal); fetchProjection(goal.id); }}
                                className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedGoal?.id === goal.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white capitalize">{goal.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">₹ {parseFloat(goal.targetAmount).toLocaleString()}</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }} className="text-gray-300 hover:text-rose-500 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Area: Simulation & Chart */}
                <div className="lg:col-span-9 space-y-8">
                    {selectedGoal ? (
                        <>
                            {/* Main Visualization Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold dark:text-white">{selectedGoal.title} Timeline</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                                <Target className="h-4 w-4 text-emerald-500" />
                                                Target: ₹ {parseFloat(selectedGoal.targetAmount).toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                                <Calendar className="h-4 w-4 text-indigo-500" />
                                                Deadline: {new Date(selectedGoal.targetDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {projection && (
                                        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 px-5 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                            <Sparkles className="h-5 w-5 text-indigo-500" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-indigo-400">Feasibility</p>
                                                <p className="font-black text-indigo-600 dark:text-indigo-400">{projection.feasibilityScore}%</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={projection?.dataPoints}>
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                            <YAxis hide />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => [`₹ ${value.toLocaleString()}`, 'Projected Net Worth']}
                                            />
                                            <Area type="monotone" dataKey="projectedValue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                            <Line type="dashed" dataKey="targetValue" stroke="#10b981" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Simulation Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                                    <h3 className="font-bold flex items-center gap-2 dark:text-white">
                                        <TrendingUp className="h-5 w-5 text-indigo-500" />
                                        Simulation Panel
                                    </h3>
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Extra Monthly Saving</label>
                                                <span className="text-indigo-600 font-bold">₹ {simulation.extraMonthly}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="50000" step="500" 
                                                value={simulation.extraMonthly}
                                                onChange={(e) => handleSimulationChange('extraMonthly', e.target.value)}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">One-time Lump Sum</label>
                                                <span className="text-emerald-600 font-bold">₹ {simulation.lumpSum}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="200000" step="1000" 
                                                value={simulation.lumpSum}
                                                onChange={(e) => handleSimulationChange('lumpSum', e.target.value)}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* AI Advice Area */}
                                <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-between shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Sparkles className="h-5 w-5 text-indigo-200" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">AI Goal Insights</span>
                                        </div>
                                        <p className="text-lg font-medium leading-relaxed">
                                            {projection?.aiadvice || "Setting up your simulation path..."}
                                        </p>
                                    </div>
                                    <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-sm text-indigo-200">Recommended Action</span>
                                        <div className="p-2 bg-white/10 rounded-lg group-hover:translate-x-1 transition-transform">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                             <Target className="h-16 w-16 text-gray-300 mb-4" />
                             <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select a goal to simulate</h3>
                             <p className="text-gray-500 max-w-xs mt-2">Create your first financial target to see how your money grows over time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GoalSimulator;
