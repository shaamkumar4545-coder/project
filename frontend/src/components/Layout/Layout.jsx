import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, LayoutDashboard, Calculator, ReceiptText, Bot, Home, LogOut, UserCircle, Target, TrendingUp, PieChart, Repeat, FileText, BarChart3, Activity, Ghost, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { authService } from '../../services/authService';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDark, setIsDark] = useState(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return true;
        }
        return false;
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [user, setUser] = useState(authService.getCurrentUser());

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [isDark]);

    useEffect(() => {
        // Check authentication status
        const checkAuth = () => {
            setIsAuthenticated(authService.isAuthenticated());
            setUser(authService.getCurrentUser());
        };

        checkAuth();
        // Listen for storage changes (e.g., login/logout in another tab)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const toggleTheme = () => setIsDark(!isDark);
    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        navigate('/');
        window.location.reload(); // Refresh to clear any cached state
    };

    // Navigation items - filtered based on authentication
    const allNavItems = [
        { name: 'Dashboard', path: '/expenses', icon: LayoutDashboard, requiresAuth: true },
        { name: 'Financial Health', path: '/financial-health', icon: Activity, requiresAuth: true },
        { name: 'Goal Simulator', path: '/goals', icon: Target, requiresAuth: true },
        { name: 'Ethical Insights', path: '/ethical-insights', icon: Globe, requiresAuth: true },
        { name: 'Ghost Subs', path: '/subscriptions', icon: Ghost, requiresAuth: true },
        { name: 'Tax Calculator', path: '/tax-calculator', icon: Calculator, requiresAuth: true },
        { name: 'ITR Filing', path: '/tax-filing', icon: FileText, requiresAuth: true },
        { name: 'SIP Calculator', path: '/sip-calculator', icon: Calculator, requiresAuth: true },
        { name: 'GST Calculator', path: '/gst-calculator', icon: ReceiptText, requiresAuth: true },
    ];

    const navItems = allNavItems.filter(item => !item.requiresAuth || isAuthenticated);

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 dark:bg-background/90 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white">
                                <span className="text-lg">F</span>
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                                FinAssist
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </NavLink>
                        ))}
                        <div className="w-px h-6 bg-border mx-2"></div>
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
                        </Button>
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                {user && (
                                    <Link
                                        to="/profile"
                                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                                    >
                                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">{user.name}</span>
                                    </Link>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-600"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <Button variant="gradient" size="sm" asChild>
                                <Link to="/register">Get Started</Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={toggleMenu}>
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background p-4 animate-in slide-in-from-top-5">
                        <div className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </NavLink>
                            ))}
                            {isAuthenticated ? (
                                <div className="mt-4 space-y-2">
                                    {user && (
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                                        >
                                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">{user.name}</span>
                                        </Link>
                                    )}
                                    <Button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        variant="outline"
                                        className="w-full text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-600"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    variant="gradient"
                                    className="w-full mt-2"
                                    asChild
                                >
                                    <Link to="/register">Get Started</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 w-full overflow-x-hidden mt-12">
                <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
                    <Outlet />
                </div>
            </main>

            {/* Floating AI Assistant Button */}
            {location.pathname !== '/ai-assistant' && (
                <Link
                    to="/ai-assistant"
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-white group ai-bounce"
                    title="AI Assistant"
                >
                    <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </Link>
            )}

            <style>{`
                @keyframes aiBounce {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    25% {
                        transform: translateY(-8px) scale(1.05);
                    }
                    50% {
                        transform: translateY(-12px) scale(1.1);
                    }
                    75% {
                        transform: translateY(-8px) scale(1.05);
                    }
                }
                
                @keyframes aiPulse {
                    0%, 100% {
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    }
                    50% {
                        box-shadow: 0 20px 40px -5px rgba(124, 58, 237, 0.4), 0 10px 10px -5px rgba(124, 58, 237, 0.2);
                    }
                }
                
                .ai-bounce {
                    animation: aiBounce 2s ease-in-out infinite, aiPulse 2s ease-in-out infinite;
                }
                
                .ai-bounce:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* Footer */}
            <footer className="mt-auto w-full border-t border-border bg-muted/30 shrink-0">
                <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-sm text-muted-foreground text-center">
                        © {new Date().getFullYear()} FinAssist. Empowering your financial future.
                    </p>
                </div>
            </footer>
        </div>
    );
}
