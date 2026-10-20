import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Globe, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Wind,
  Droplets,
  Building2,
  Users,
  Compass,
  ArrowRight,
  X,
  Sun
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import esgService from '../services/esgService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';

const EthicalInvesting = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGreenFunds, setShowGreenFunds] = useState(false);
    const [greenFunds, setGreenFunds] = useState([]);
    const [fetchingFunds, setFetchingFunds] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const data = await esgService.getESGInsights(user.id);
            setInsights(data);
        } catch (error) {
            console.error("Failed to load ESG insights:", error);
            toast.error("Failed to load impact analytics");
        } finally {
            setLoading(false);
        }
    };

    const handleExploreGreenFunds = async () => {
        setShowGreenFunds(true);
        setFetchingFunds(true);
        try {
            const funds = await esgService.getGreenFunds();
            setGreenFunds(funds);
        } catch (error) {
            toast.error("Could not fetch fund recommendations");
        } finally {
            setFetchingFunds(false);
        }
    };

    const handleInvest = (fund) => {
        toast.success(`Investment simulation successful! Added ${fund.name} to tracking.`, {
            icon: '🚀',
            style: {
                borderRadius: '16px',
                background: '#10b981',
                color: '#fff',
            }
        });
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-emerald-500">Evaluating portfolio impact...</div>;

    const radarData = insights ? [
        { subject: 'Environmental', A: insights.environmentalScore, fullMark: 100 },
        { subject: 'Social', A: insights.socialScore, fullMark: 100 },
        { subject: 'Governance', A: insights.governanceScore, fullMark: 100 },
    ] : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Leaf className="h-8 w-8 text-emerald-500 fill-emerald-500/10" />
                        Ethical Insights
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Measure the sustainability and societal impact of your wealth.
                    </p>
                </div>
            </div>

            {/* Top Row: Overall Purity & Breakdown Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Overall Score Card */}
                <Card className="lg:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 border-none shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden">
                    <CardContent className="p-8 h-full flex flex-col justify-between">
                        <div className="relative z-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-100/70">Portfolio Purity</p>
                            <h2 className="text-6xl font-black mt-2 leading-none">{insights?.overallScore}</h2>
                            <p className="text-emerald-100 font-medium mt-4">Average ESG Score across your entire portfolio.</p>
                        </div>
                        <div className="mt-8 relative z-10">
                            <div className="flex gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute -bottom-10 -right-10 opacity-20">
                            <Leaf className="h-56 w-56 rotate-12" />
                        </div>
                    </CardContent>
                </Card>

                {/* Radar Chart Card */}
                <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-none shadow-xl shadow-gray-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Compass className="h-5 w-5 text-emerald-500" />
                            Impact DNA Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Impact"
                                    dataKey="A"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Row: AI Insights & Asset Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Actionable Insights */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                        <Zap className="h-5 w-5 text-amber-500" />
                        AI Ethical Pulse
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {insights?.insights.map((msg, idx) => (
                            <div key={idx} className={`p-5 rounded-3xl border shadow-sm flex gap-4 ${msg.includes('⚠️') ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50' : (msg.includes('🌿') || msg.includes('🏆') ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/50' : 'bg-gray-50 border-gray-100 dark:bg-gray-700/50 dark:border-gray-700')}`}>
                                <div className="mt-1">
                                    {msg.includes('⚠️') ? <AlertTriangle className="h-6 w-6 text-amber-600" /> : <ShieldCheck className="h-6 w-6 text-emerald-600" />}
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{msg}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Individual Asset Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                        <Building2 className="h-5 w-5 text-indigo-500" />
                        Asset Purity Check
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="space-y-4">
                            {insights?.assets.map((asset, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 mt-2 transition-all hover:bg-white dark:hover:bg-gray-700 hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${asset.impactLevel === 'HIGH' ? 'bg-emerald-100 text-emerald-600' : (asset.impactLevel === 'LOW' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600')}`}>
                                            {asset.score}
                                        </div>
                                        <div>
                                            <h4 className="font-bold dark:text-white">{asset.name}</h4>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{asset.impactLevel} ESG ALIGNMENT</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Call to Action */}
            <div className="bg-gray-900 rounded-[2.5rem] p-4 text-white relative overflow-hidden group shadow-2xl">
                <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-black mb-4">Invest in the Future You Want.</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Your wealth is a vote for the planet. Shift your capital toward sustainability and witness the compound growth of an ethical future.
                        </p>
                    </div>
                    <Button 
                        onClick={handleExploreGreenFunds}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl px-10 py-6 text-lg font-bold shadow-xl shadow-emerald-500/20 group"
                    >
                        Explore Green Funds
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
                {/* Visual Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full -mr-48 -mt-48 blur-[150px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full -ml-32 -mb-32 blur-[150px] opacity-10"></div>
            </div>

            {/* Green Funds Modal */}
            {showGreenFunds && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 relative animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setShowGreenFunds(false)}
                            className="absolute top-8 right-8 p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20"
                        >
                            <X className="h-6 w-6 dark:text-white" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-5 h-[80vh] md:h-auto">
                            {/* Modal Sidebar */}
                            <div className="md:col-span-2 bg-emerald-600 p-10 text-white relative flex flex-col justify-between overflow-hidden">
                                <div className="relative z-10">
                                    <Leaf className="h-12 w-12 mb-6 fill-emerald-400/30" />
                                    <h2 className="text-4xl font-black leading-tight">Curation of Impact.</h2>
                                    <p className="mt-4 text-emerald-100 text-lg opacity-80">
                                        We've analyzed global ESG data to find high-yield, high-impact opportunities that match your portfolio profile.
                                    </p>
                                </div>
                                <div className="mt-12 relative z-10">
                                    <div className="flex items-center gap-3 text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                                        <ShieldCheck className="h-4 w-4" />
                                        Verified by FinAudit AI
                                    </div>
                                </div>
                                {/* BG pattern */}
                                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400 rounded-full blur-[100px] opacity-30"></div>
                            </div>

                            {/* Modal Content */}
                            <div className="md:col-span-3 p-8 md:p-12 overflow-y-auto max-h-[80vh]">
                                <h3 className="text-2xl font-bold dark:text-white mb-8">Green Discovery</h3>
                                
                                {fetchingFunds ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {greenFunds.map((fund, idx) => (
                                            <div key={idx} className="group p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-emerald-500/30 transition-all hover:bg-white dark:hover:bg-gray-700 hover:shadow-xl">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex gap-4">
                                                        <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                            {fund.iconType === 'WIND' && <Wind className="h-7 w-7" />}
                                                            {fund.iconType === 'SUN' && <Sun className="h-7 w-7" />}
                                                            {fund.iconType === 'LEAF' && <Leaf className="h-7 w-7" />}
                                                            {fund.iconType === 'WATER' && <Droplets className="h-7 w-7" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-xl font-bold dark:text-white">{fund.name}</h4>
                                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-md uppercase tracking-widest border border-emerald-500/20">
                                                                    {fund.esgScore} ESG
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{fund.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-600 pt-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth Est.</span>
                                                        <span className="text-emerald-500 font-black text-lg">{fund.yieldEstimate}</span>
                                                    </div>
                                                    <Button 
                                                        onClick={() => handleInvest(fund)}
                                                        className="bg-gray-900 dark:bg-emerald-500 text-white rounded-xl px-6 py-2 font-bold hover:scale-105 transition-transform"
                                                    >
                                                        Invest Now
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EthicalInvesting;
