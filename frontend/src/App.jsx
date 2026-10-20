import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import ExpensePlanner from './pages/ExpensePlanner';
import SIPCalculator from './pages/SIPCalculator';
import GSTCalculator from './pages/GSTCalculator';
import AIChat from './pages/AIChat';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import BudgetPlanning from './pages/BudgetPlanning';
import RecurringTransactions from './pages/RecurringTransactions';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import InvestmentPortfolio from './pages/InvestmentPortfolio';
import TaxCalculator from './pages/TaxCalculator';
import FinancialReports from './pages/FinancialReports';
import FinancialHealth from './pages/FinancialHealth';
import GoalSimulator from './pages/GoalSimulator';
import GhostSubscriptions from './pages/GhostSubscriptions';
import EthicalInvesting from './pages/EthicalInvesting';
import TaxFiling from './pages/TaxFiling';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Routes>
        {/* Public routes - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes with Layout */}
        <Route path="/" element={<Layout />}>
          {/* Public pages - accessible without login */}
          <Route index element={<Home />} />
          <Route path="ai-assistant" element={<AIChat />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="expenses" 
            element={
              <ProtectedRoute>
                <ExpensePlanner />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="budgets" 
            element={
              <ProtectedRoute>
                <BudgetPlanning />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="recurring" 
            element={
              <ProtectedRoute>
                <RecurringTransactions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="investments" 
            element={
              <ProtectedRoute>
                <InvestmentPortfolio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="tax-calculator" 
            element={
              <ProtectedRoute>
                <TaxCalculator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reports" 
            element={
              <ProtectedRoute>
                <FinancialReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="sip-calculator" 
            element={
              <ProtectedRoute>
                <SIPCalculator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="gst-calculator" 
            element={
              <ProtectedRoute>
                <GSTCalculator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="financial-health" 
            element={
              <ProtectedRoute>
                <FinancialHealth />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="goals" 
            element={
              <ProtectedRoute>
                <GoalSimulator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="subscriptions" 
            element={
              <ProtectedRoute>
                <GhostSubscriptions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="ethical-insights" 
            element={
              <ProtectedRoute>
                <EthicalInvesting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="tax-filing" 
            element={
              <ProtectedRoute>
                <TaxFiling />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
