import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { LayoutDashboard, TrendingUp, ReceiptText, Bot, Shield, Zap, Users, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

export default function Home() {
    const navigate = useNavigate();
    const isAuthenticated = authService.isAuthenticated();

    const handleFeatureClick = (path, requiresAuth) => {
        if (requiresAuth && !isAuthenticated) {
            toast.error('Please login to access this feature', {
                icon: '🔒',
                duration: 3000
            });
            navigate('/login');
        } else {
            navigate(path);
        }
    };

    const features = [
        {
            title: "Expense Tracker",
            description: "Monitor your spending habits and manage your budget effectively.",
            icon: LayoutDashboard,
            path: "/expenses",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            requiresAuth: true
        },
        {
            title: "SIP Calculator",
            description: "Plan your wealth creation journey with our advanced SIP tools.",
            icon: TrendingUp,
            path: "/sip-calculator",
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            requiresAuth: true
        },
        {
            title: "GST Calculator",
            description: "Quick tax calculations and instant GSTR-3B report generation.",
            icon: ReceiptText,
            path: "/gst-calculator",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            requiresAuth: true
        },
        {
            title: "AI Assistant",
            description: "Get smart financial advice 24/7 from our AI finance expert.",
            icon: Bot,
            path: "/ai-assistant",
            color: "text-pink-500",
            bgColor: "bg-pink-500/10",
            requiresAuth: false
        }
    ];

    return (
        <div className="space-y-16 py-8">
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center space-y-8 pt-10 px-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 animate-in slide-in-from-top-4 fade-in duration-500">
                    ✨ Your Personal Finance Companion
                </div>
                
                <div className="space-y-6 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-600 pb-2 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
                        Master Your Money <br className="hidden md:block" /> With Confidence
                    </h1>
                    
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 leading-relaxed">
                        Everything you need to manage expenses, plan investments, calculate taxes, and get expert advice—all in one place. Take control of your financial future with intelligent tools designed for modern life.
                    </p>

                    {/* Key Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                            <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <h3 className="font-semibold text-sm mb-1">Lightning Fast</h3>
                                <p className="text-xs text-muted-foreground">Instant calculations and real-time insights</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                            <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <h3 className="font-semibold text-sm mb-1">Secure & Private</h3>
                                <p className="text-xs text-muted-foreground">Your data is encrypted and protected</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                            <BarChart3 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <h3 className="font-semibold text-sm mb-1">Smart Analytics</h3>
                                <p className="text-xs text-muted-foreground">AI-powered insights and recommendations</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="flex flex-wrap justify-center items-center gap-8 pt-6 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-400">
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-primary">10K+</div>
                            <div className="text-sm text-muted-foreground mt-1">Active Users</div>
                        </div>
                        <div className="w-px h-12 bg-border"></div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-primary">₹50Cr+</div>
                            <div className="text-sm text-muted-foreground mt-1">Tracked</div>
                        </div>
                        <div className="w-px h-12 bg-border"></div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-primary">24/7</div>
                            <div className="text-sm text-muted-foreground mt-1">AI Support</div>
                        </div>
                        <div className="w-px h-12 bg-border hidden md:block"></div>
                        <div className="flex flex-col items-center hidden md:flex">
                            <div className="text-3xl font-bold text-primary">100%</div>
                            <div className="text-sm text-muted-foreground mt-1">Free Forever</div>
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="pt-6 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500">
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-muted-foreground">Expense Tracking</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-muted-foreground">Investment Planning</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-muted-foreground">Tax Calculations</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-muted-foreground">AI-Powered Insights</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-muted-foreground">GSTR-3B Reports</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center items-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-600">
                        {isAuthenticated ? (
                            <>
                                <Button size="lg" variant="gradient" className="rounded-full px-8 h-12 text-base group" onClick={() => navigate('/expenses')}>
                                    Go to Dashboard
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base" onClick={() => navigate('/ai-assistant')}>
                                    <Bot className="w-4 h-4 mr-2" />
                                    Try AI Assistant
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button size="lg" variant="gradient" className="rounded-full px-8 h-12 text-base group" onClick={() => navigate('/register')}>
                                    Get Started Free
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base" onClick={() => navigate('/login')}>
                                    Sign In
                                </Button>
                            </>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground pt-2 animate-in fade-in duration-700 delay-700">
                        No credit card required • Setup in under 2 minutes • Start managing your finances today
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {features.map((feature, index) => (
                    <Card
                        key={index}
                        className={`group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 cursor-pointer glass-card ${
                            feature.requiresAuth && !isAuthenticated ? 'opacity-75' : ''
                        }`}
                        onClick={() => handleFeatureClick(feature.path, feature.requiresAuth)}
                    >
                        <CardHeader>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bgColor} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base">{feature.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Decorative Quote or Footer Area */}
            <section className="text-center py-20 bg-gradient-to-b from-transparent to-muted/20 rounded-3xl mx-4">
                <h2 className="text-2xl font-semibold mb-4">Ready to take control?</h2>
                <Button variant="default" onClick={() => navigate('/ai-assistant')}>Ask AI Assistant</Button>
            </section>
        </div>
    );
}
