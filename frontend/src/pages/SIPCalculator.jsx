import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SIPCalculator() {
    const [mode, setMode] = useState('sip'); // sip | lumpsum
    const [investment, setInvestment] = useState(5000); // Monthly or Total
    const [rate, setRate] = useState(12); // Annual Interest Rate %
    const [years, setYears] = useState(10); // Time Period

    const results = useMemo(() => {
        let data = [];
        let totalInvested = 0;
        let estimatedReturns = 0;
        let totalValue = 0;

        const r = rate / 100;
        const n = years * 12;

        if (mode === 'sip') {
            const monthlyRate = r / 12;
            // SIP Formula: M = P * ({[1 + i]^n - 1} / i) * (1 + i)
            // We calculate year by year for the graph
            for (let y = 0; y <= years; y++) {
                const months = y * 12;
                const invested = investment * months;
                let value = 0;
                if (months > 0) {
                    value = investment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
                }
                data.push({
                    year: `Year ${y}`,
                    invested: invested,
                    value: Math.round(value)
                });
            }
            totalInvested = investment * n;
            totalValue = investment * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);

        } else {
            // Lumpsum Formula: A = P(1 + r/n)^(nt) ... Simplified assuming annual compounding usually or monthly?
            // Standard Mutual Fund Lumpsum calculator uses CAGR logic on annual basis usually, but let's use monthly compounding to be consistent or just annual.
            // A = P * (1 + r)^t

            for (let y = 0; y <= years; y++) {
                const value = investment * Math.pow(1 + r, y);
                data.push({
                    year: `Year ${y}`,
                    invested: investment,
                    value: Math.round(value)
                });
            }
            totalInvested = investment;
            totalValue = investment * Math.pow(1 + r, years);
        }

        estimatedReturns = totalValue - totalInvested;

        return { data, totalInvested, estimatedReturns, totalValue: Math.round(totalValue) };
    }, [mode, investment, rate, years]);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
                    <Calculator className="w-10 h-10" /> {mode === 'sip' ? 'SIP Calculator' : 'Lumpsum Calculator'}
                </h1>
                <p className="text-muted-foreground">Calculate returns on your mutual fund investments with ease.</p>

                {/* Toggle */}
                <div className="inline-flex rounded-lg border border-input p-1 bg-muted/50 mt-4">
                    <button
                        onClick={() => setMode('sip')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all", mode === 'sip' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                        SIP (Monthly)
                    </button>
                    <button
                        onClick={() => setMode('lumpsum')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all", mode === 'lumpsum' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                        Lumpsum (One-time)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Amount Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium">{mode === 'sip' ? 'Monthly Investment' : 'Total Investment'}</label>
                                <span className="font-bold text-primary">₹ {investment.toLocaleString()}</span>
                            </div>
                            <input
                                type="range"
                                min={mode === 'sip' ? 500 : 5000}
                                max={mode === 'sip' ? 100000 : 5000000}
                                step={mode === 'sip' ? 500 : 5000}
                                value={investment}
                                onChange={(e) => setInvestment(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Rate Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium">Expected Return Rate (p.a)</label>
                                <span className="font-bold text-primary">{rate} %</span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={30}
                                step={0.1}
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Time Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium">Time Period (Years)</label>
                                <span className="font-bold text-primary">{years} Yr</span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={40}
                                step={1}
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div className="pt-4 p-4 bg-muted/30 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Invested Amount</span>
                                <span className="font-semibold">₹ {Math.round(results.totalInvested).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Est. Returns</span>
                                <span className="font-semibold text-green-500 dark:text-green-400">₹ {Math.round(results.estimatedReturns).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                <span>Total Value</span>
                                <span className="text-primary">₹ {results.totalValue.toLocaleString()}</span>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* Graph */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Growth Projection</CardTitle>
                        <CardDescription>Visualizing your wealth creation over {years} years</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <div className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} className="dark:opacity-20" />
                                    <XAxis dataKey="year" stroke="currentColor" className="text-muted-foreground" />
                                    <YAxis tickFormatter={(val) => `₹${val / 1000}k`} stroke="currentColor" className="text-muted-foreground" />
                                    <Tooltip
                                        formatter={(value) => `₹ ${new Intl.NumberFormat('en-IN').format(value)}`}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            color: 'hsl(var(--popover-foreground))',
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        wrapperStyle={{ zIndex: 1000 }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} name="Total Value" />
                                    <Area type="monotone" dataKey="invested" stroke="#94a3b8" fillOpacity={1} fill="url(#colorInvested)" strokeWidth={2} name="Invested Amount" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
