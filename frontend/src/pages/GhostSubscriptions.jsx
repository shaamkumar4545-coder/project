import React, { useState, useEffect } from 'react';
import { 
  Ghost, 
  Trash2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Calendar,
  DollarSign,
  PieChart,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import subscriptionService from '../services/subscriptionService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';

const GhostSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalMonthly: 0, totalAnnual: 0, ghostCount: 0 });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchAudit();
    }, []);

    const fetchAudit = async () => {
        try {
            const data = await subscriptionService.getAudit(user.id);
            setSubscriptions(data);
            
            const monthly = data.reduce((acc, s) => acc + s.monthlyAmount, 0);
            const annual = data.reduce((acc, s) => acc + s.annualDrain, 0);
            const ghosts = data.filter(s => s.isGhostCandidate).length;
            
            setStats({ totalMonthly: monthly, totalAnnual: annual, ghostCount: ghosts });
        } catch (error) {
            console.error("Failed to load subscription audit:", error);
            toast.error("Failed to load audit data");
        } finally {
            setLoading(false);
        }
    };

    const handleExorciseAll = async () => {
        if (!window.confirm("Are you sure you want to deactivate all flagged subscriptions? This will mark them as inactive in your records.")) return;
        try {
            await subscriptionService.exorciseAll(user.id);
            toast.success("All ghosts exorcised! Subscriptions deactivated.");
            fetchAudit();
        } catch (error) {
            toast.error("Failed to exorcise ghosts");
        }
    };

    const handleExorciseOne = async (title) => {
        try {
            await subscriptionService.exorcise(user.id, title);
            toast.success(`${title} exorcised successfully!`);
            fetchAudit();
        } catch (error) {
            toast.error(`Failed to exorcise ${title}`);
        }
    };

    const handleDownloadAudit = () => {
        const headers = ["Title", "Monthly Amount", "Annual Drain", "Category", "Source", "Status", "Reason"];
        const rows = subscriptions.map(s => [
            s.title,
            s.monthlyAmount,
            s.annualDrain,
            s.category,
            s.source,
            s.isGhostCandidate ? "GHOST" : "MONITORED",
            s.reason
        ]);
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'subscription_audit.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Audit report downloaded successfully!");
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-500">Scanning for ghosts...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Ghost className="h-8 w-8 text-indigo-500 fill-indigo-500/10" />
                        Ghost Subscriptions
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Identify and exorcise forgotten recurring expenses and budget leaks.
                    </p>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-gray-800 border-none shadow-xl shadow-indigo-500/5 overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Drain</p>
                            <TrendingDown className="h-5 w-5 text-rose-500" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">₹ {stats.totalMonthly.toLocaleString()}</h3>
                        <p className="text-xs text-rose-500 mt-1 font-medium">Automatic debit recurring</p>
                        <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:scale-110 transition-transform">
                            <Zap className="h-24 w-24 text-rose-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-indigo-600 border-none shadow-xl shadow-indigo-500/20 overflow-hidden group">
                    <CardContent className="p-6 relative text-white">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Annual Total Impact</p>
                            <PieChart className="h-5 w-5 text-indigo-200" />
                        </div>
                        <h3 className="text-3xl font-black">₹ {stats.totalAnnual.toLocaleString()}</h3>
                        <p className="text-xs text-indigo-200 mt-1 font-medium">The true cost of your recurring habits</p>
                        <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-24 w-24 text-white" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-100 dark:bg-amber-900/30 border-none shadow-xl shadow-amber-500/5 overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Ghost Alerts</p>
                            <ShieldAlert className="h-5 w-5 text-amber-600" />
                        </div>
                        <h3 className="text-3xl font-black text-amber-800 dark:text-white">{stats.ghostCount} Candidates</h3>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Potentially forgotten or high-drain expenses.</p>
                        <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:rotate-12 transition-transform">
                            <Ghost className="h-24 w-24 text-amber-800" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ghost Detail List */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold dark:text-white">Cyber-Audit Report</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-full uppercase tracking-tighter">
                        <Calendar className="h-3 w-3" />
                        Updated Real-time
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {subscriptions.length === 0 && (
                        <div className="text-center py-20 grayscale opacity-30">
                            <Zap className="h-16 w-16 mx-auto mb-4" />
                            <p>No active subscriptions found. Great job!</p>
                        </div>
                    )}
                    {subscriptions.map((sub, idx) => (
                        <div 
                            key={idx} 
                            className={`flex flex-col md:flex-row items-center justify-between p-5 rounded-3xl border-2 transition-all hover:shadow-lg ${sub.isGhostCandidate ? 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-900/10' : 'border-transparent bg-gray-50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700'}`}
                        >
                            <div className="flex items-center gap-5 w-full md:w-auto">
                                <div className={`p-4 rounded-2xl ${sub.isGhostCandidate ? 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-200' : 'bg-white dark:bg-gray-800 text-indigo-500'} shadow-sm`}>
                                    {sub.isGhostCandidate ? <Ghost className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                        {sub.title}
                                        {sub.isGhostCandidate && <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">GHOST</span>}
                                        {sub.source === 'AI_DETECTED' && (
                                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
                                                <Zap className="h-2 w-2 fill-current" />
                                                AI DETECTED
                                            </span>
                                        )}
                                    </h4>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded uppercase">{sub.category || 'Uncategorized'}</span>
                                            <span>• {sub.source === 'AI_DETECTED' ? `Detected for ${sub.activeMonths} months` : `Active for ${sub.activeMonths} months`}</span>
                                        </div>
                                        {sub.reason && (
                                            <p className="text-[10px] text-gray-400 italic flex items-center gap-1">
                                                <Info className="h-3 w-3" />
                                                {sub.reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Cost</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">₹ {sub.monthlyAmount.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-rose-500/70 uppercase tracking-widest flex items-center justify-end gap-1">
                                        <TrendingDown className="h-3 w-3" />
                                        Annual Drain
                                    </p>
                                    <p className="text-xl font-black text-rose-500">₹ {sub.annualDrain.toLocaleString()}</p>
                                </div>
                                <Button variant="ghost" className="hidden md:flex h-10 w-10 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                                <Button 
                                    onClick={() => handleExorciseOne(sub.title)} 
                                    variant="ghost" 
                                    className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
                                    title="Exorcise This Ghost"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pro-Tips / AI Insight Section */}
            <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/40">
                <div className="max-w-2xl relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-5 w-5 text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-widert text-indigo-400">Cyber-Audit Protocol</span>
                    </div>
                    <h2 className="text-3xl font-black mb-4 leading-tight">Total "Shadow Costs" Detected: ₹ {stats.totalAnnual.toLocaleString()}</h2>
                    <p className="text-indigo-200 text-lg mb-8">
                        Our intelligence identifies recurring payments that show high retention with zero modifications. If you cancel just your ghost subscriptions today, you could save ₹ {(stats.totalAnnual * 0.1).toLocaleString()} extra this year.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button 
                            onClick={handleDownloadAudit}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl px-8 py-4 font-bold shadow-lg shadow-indigo-500/20"
                        >
                            Download Audit Report
                        </Button>
                        <Button 
                            onClick={handleExorciseAll}
                            variant="ghost" 
                            className="text-white hover:bg-white/10 rounded-2xl px-8"
                        >
                            Exorcise All Ghosts
                        </Button>
                    </div>
                </div>
                {/* Visual Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full -mr-48 -mt-48 blur-[120px] opacity-20 transition-all group-hover:scale-110"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500 rounded-full -ml-32 -mb-32 blur-[120px] opacity-10 transition-all group-hover:scale-110 duration-1000"></div>
                <Ghost className="absolute bottom-10 right-10 h-40 w-40 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
        </div>
    );
};

export default GhostSubscriptions;
