import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Award, 
  Lock, 
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import financialHealthService from '../services/financialHealthService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const FinancialHealth = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await financialHealthService.getScore(user.id);
        setData(result);
      } catch (error) {
        console.error("Failed to load financial health:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleQuestClick = (type) => {
    switch (type) {
      case 'SAVINGS':
        navigate('/expenses');
        break;
      case 'BUDGET':
        navigate('/budgets');
        break;
      case 'INVESTMENT':
        navigate('/investments');
        break;
      case 'EMERGENCY':
        navigate('/goals');
        break;
      default:
        break;
    }
  };

  const scoreColor = data?.overallScore >= 80 ? 'text-emerald-500' : data?.overallScore >= 60 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = data?.overallScore >= 80 ? 'bg-emerald-500/10' : data?.overallScore >= 60 ? 'bg-amber-500/10' : 'bg-rose-500/10';

  const chartData = [
    { name: 'Score', value: data?.overallScore || 0 },
    { name: 'Remaining', value: 100 - (data?.overallScore || 0) },
  ];

  const COLORS = [
    data?.overallScore >= 80 ? '#10b981' : data?.overallScore >= 60 ? '#f59e0b' : '#f43f5e',
    'rgba(156, 163, 175, 0.1)'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-indigo-500" />
            Financial Health
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your personalized AI-driven financial growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
          <Zap className="h-4 w-4 text-indigo-500 fill-indigo-500" />
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            AI Analysis Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Score Gauge */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6 self-start">Overall Score</h3>
          <div className="relative w-full aspect-square max-w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  startAngle={225}
                  endAngle={-45}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-bold ${scoreColor}`}>
                {data?.overallScore}
              </span>
              <span className="text-gray-400 font-medium uppercase tracking-widest text-xs mt-1">Points</span>
            </div>
          </div>
          <div className={`mt-8 px-6 py-3 rounded-2xl ${scoreBg} ${scoreColor} font-semibold text-center w-full`}>
            {data?.overallScore >= 80 ? 'Excellent Stability' : data?.overallScore >= 60 ? 'Good Potential' : 'Needs Optimization'}
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-8">Performance Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Savings Rate */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Savings Rate</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {data?.breakdown?.savingsRate?.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(data?.breakdown?.savingsRate * 4, 100)}%` }} // Scaling 25% target to 100% bar
                ></div>
              </div>
              <p className="text-xs text-gray-400">Target: 25.0% for maximum points</p>
            </div>

            {/* Budget Adherence */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Budget Adherence</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {data?.breakdown?.budgetAdherence?.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full transition-all duration-1000"
                  style={{ width: `${data?.breakdown?.budgetAdherence}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">Target: 100% categories within limit</p>
            </div>

            {/* Investment Ratio */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Investment Ratio</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {data?.breakdown?.investmentRatio?.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(data?.breakdown?.investmentRatio * 5, 100)}%` }} // Scaling 20% target to 100% bar
                ></div>
              </div>
              <p className="text-xs text-gray-400">Target: 20% of income invested</p>
            </div>

            {/* Emergency Fund */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Emergency Fund</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {data?.breakdown?.emergencyFundMonths?.toFixed(1)} Mo
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(data?.breakdown?.emergencyFundMonths * 33.3, 100)}%` }} // Scaling 3 months target to 100% bar
                ></div>
              </div>
              <p className="text-xs text-gray-400">Target: 3 Months of basic expenses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Active Quests */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
            Active Quests
          </h3>
          <div className="space-y-4">
            {data?.quests?.map((quest) => (
              <div 
                key={quest.id}
                onClick={() => handleQuestClick(quest.type)}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-pointer flex items-center gap-5"
              >
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                  {quest.type === 'SAVINGS' && <TrendingUp className="h-6 w-6 text-blue-500" />}
                  {quest.type === 'BUDGET' && <Target className="h-6 w-6 text-teal-500" />}
                  {quest.type === 'INVESTMENT' && <Zap className="h-6 w-6 text-indigo-500" />}
                  {quest.type === 'EMERGENCY' && <ShieldCheck className="h-6 w-6 text-rose-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white">{quest.title}</h4>
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      +{quest.pointsReward} XP
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{quest.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-500" />
            Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.badges?.map((badge, idx) => (
              <div 
                key={idx}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${badge.status === 'UNLOCKED' ? 'border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/10' : 'border-gray-100 dark:border-gray-700 opacity-60'} flex flex-col items-center gap-3 transition-all`}
              >
                <div className={`p-4 rounded-full ${badge.status === 'UNLOCKED' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                  {badge.icon === 'Shield' && <ShieldCheck className="h-8 w-8" />}
                  {badge.icon === 'TrendingUp' && <TrendingUp className="h-8 w-8" />}
                  {badge.icon === 'Crown' && <Award className="h-8 w-8" />}
                </div>
                <span className={`text-sm font-bold text-center ${badge.status === 'UNLOCKED' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {badge.name}
                </span>
                {badge.status === 'LOCKED' && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-3 w-3 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Advice Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 opacity-80" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">AI Suggestion</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Build a Safety Net</h4>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                Your current balance covers about {data?.breakdown?.emergencyFundMonths?.toFixed(1)} months of expenses. To reach "Financial Zen" status, aim for 3-6 months.
              </p>
              <button 
                onClick={() => navigate('/budgets')}
                className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all"
              >
                Learn More
              </button>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealth;
