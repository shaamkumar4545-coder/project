import { useState, useEffect } from 'react';
import { taxFilingService } from '../services/taxFilingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  FileText, ChevronRight, ChevronLeft, Check, Download,
  IndianRupee, TrendingUp, TrendingDown, Shield, Zap,
  AlertCircle, CheckCircle2, Clock, Trash2, Eye, Plus,
  Sparkles, BadgeCheck, FileCheck, ArrowRight, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: Shield },
  { id: 2, title: 'Income Details', icon: IndianRupee },
  { id: 3, title: 'Deductions', icon: TrendingDown },
  { id: 4, title: 'Tax Computation', icon: Zap },
  { id: 5, title: 'Review & Submit', icon: FileCheck },
];

const AY_OPTIONS = ['2025-26', '2026-27'];
const FY_OPTIONS = ['2024-25', '2025-26'];

function formatCurrency(val) {
  const num = parseFloat(val) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
}

export default function TaxFiling() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [autoPopLoading, setAutoPopLoading] = useState(false);
  const [filings, setFilings] = useState([]);
  const [activeFiling, setActiveFiling] = useState(null);
  const [showFilingsList, setShowFilingsList] = useState(true);
  const [computeResult, setComputeResult] = useState(null);

  const [form, setForm] = useState({
    assessmentYear: '2025-26', financialYear: '2024-25',
    panNumber: '', fullName: '', selectedRegime: '',
    salaryIncome: '', hraExemption: '', ltaExemption: '',
    interestIncome: '', rentalIncome: '', homeLoanInterestOnLetOut: '',
    digitalAssetIncome: '', shortTermCapitalGains: '', longTermCapitalGains: '',
    businessIncome: '', agriculturalIncome: '', otherIncome: '',
    section80C: '', section80CCD1B: '', section80D: '', section80DHealthCheckup: '',
    section80G: '', section80E: '', section80EEA: '', section80TTA: '', section24B: '',
    otherDeductions: '',
    tdsPaid: '', advanceTaxPaid: '', selfAssessmentTaxPaid: ''
  });

  useEffect(() => { loadFilings(); }, []);

  const loadFilings = async () => {
    try {
      const data = await taxFilingService.getFilings();
      setFilings(data);
    } catch (e) { console.error(e); }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const numVal = (v) => parseFloat(v) || 0;

  const handleAutoPopulate = async () => {
    setAutoPopLoading(true);
    try {
      const data = await taxFilingService.autoPopulate(form.financialYear);
      setForm(prev => ({
        ...prev,
        salaryIncome: data.salaryIncome || '',
        interestIncome: data.interestIncome || '',
        businessIncome: data.businessIncome || '',
        otherIncome: data.otherIncome || ''
      }));
      toast.success('Income auto-populated from your transactions!');
    } catch (e) {
      toast.error('Failed to auto-populate. Add transactions first.');
    } finally { setAutoPopLoading(false); }
  };

  const handleSaveDraft = async () => {
    if (!form.panNumber || !form.fullName) {
      toast.error('Please fill in PAN and Full Name');
      return;
    }
    setLoading(true);
    try {
      const payload = buildPayload();
      let response;
      if (activeFiling?.id) {
        response = await taxFilingService.updateFiling(activeFiling.id, payload);
      } else {
        response = await taxFilingService.createFiling(payload);
      }
      setComputeResult(response);
      setActiveFiling(response.filing);
      toast.success(activeFiling?.id ? 'Filing updated!' : 'Filing draft saved!');
      loadFilings();
    } catch (e) {
      toast.error('Failed to save filing');
    } finally { setLoading(false); }
  };

  const handleSubmitFiling = async () => {
    if (!activeFiling?.id) {
      toast.error('Save as draft first');
      return;
    }
    setLoading(true);
    try {
      const response = await taxFilingService.submitFiling(activeFiling.id);
      setActiveFiling(response.filing);
      setComputeResult(response);
      toast.success('Filing submitted successfully!');
      loadFilings();
    } catch (e) {
      toast.error('Failed to submit filing');
    } finally { setLoading(false); }
  };

  const handleDeleteFiling = async (id) => {
    if (!confirm('Delete this filing?')) return;
    try {
      await taxFilingService.deleteFiling(id);
      toast.success('Filing deleted');
      if (activeFiling?.id === id) {
        setActiveFiling(null);
        setShowFilingsList(true);
      }
      loadFilings();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleViewFiling = async (filing) => {
    try {
      const data = await taxFilingService.getFilingById(filing.id);
      setActiveFiling(data.filing);
      setComputeResult(data);
      setForm(mapFilingToForm(data.filing));
      setShowFilingsList(false);
      setCurrentStep(1);
    } catch (e) { toast.error('Failed to load filing'); }
  };

  const handleNewFiling = () => {
    setActiveFiling(null);
    setComputeResult(null);
    setForm({
      assessmentYear: '2025-26', financialYear: '2024-25',
      panNumber: '', fullName: '', selectedRegime: '',
      salaryIncome: '', hraExemption: '', ltaExemption: '',
      interestIncome: '', rentalIncome: '', homeLoanInterestOnLetOut: '',
      digitalAssetIncome: '', shortTermCapitalGains: '', longTermCapitalGains: '',
      businessIncome: '', agriculturalIncome: '', otherIncome: '',
      section80C: '', section80CCD1B: '', section80D: '', section80DHealthCheckup: '',
      section80G: '', section80E: '', section80EEA: '', section80TTA: '', section24B: '',
      otherDeductions: '',
      tdsPaid: '', advanceTaxPaid: '', selfAssessmentTaxPaid: ''
    });
    setShowFilingsList(false);
    setCurrentStep(1);
  };

  const buildPayload = () => {
    const p = {};
    Object.entries(form).forEach(([k, v]) => {
      if (typeof v === 'string' && !isNaN(v) && v !== '' && k !== 'panNumber' && k !== 'fullName' && k !== 'assessmentYear' && k !== 'financialYear' && k !== 'selectedRegime') {
        p[k] = parseFloat(v) || 0;
      } else {
        p[k] = v || null;
      }
    });
    return p;
  };

  const mapFilingToForm = (f) => ({
    assessmentYear: f.assessmentYear || '2025-26',
    financialYear: f.financialYear || '2024-25',
    panNumber: f.panNumber || '', fullName: f.fullName || '',
    selectedRegime: f.selectedRegime || '',
    salaryIncome: f.salaryIncome || '', hraExemption: f.hraExemption || '',
    ltaExemption: f.ltaExemption || '', interestIncome: f.interestIncome || '',
    rentalIncome: f.rentalIncome || '', homeLoanInterestOnLetOut: f.homeLoanInterestOnLetOut || '',
    digitalAssetIncome: f.digitalAssetIncome || '',
    shortTermCapitalGains: f.shortTermCapitalGains || '', longTermCapitalGains: f.longTermCapitalGains || '',
    businessIncome: f.businessIncome || '', agriculturalIncome: f.agriculturalIncome || '',
    otherIncome: f.otherIncome || '',
    section80C: f.section80C || '', section80CCD1B: f.section80CCD1B || '',
    section80D: f.section80D || '', section80DHealthCheckup: f.section80DHealthCheckup || '',
    section80G: f.section80G || '', section80E: f.section80E || '',
    section80EEA: f.section80EEA || '', section80TTA: f.section80TTA || '',
    section24B: f.section24B || '', otherDeductions: f.otherDeductions || '',
    tdsPaid: f.tdsPaid || '', advanceTaxPaid: f.advanceTaxPaid || '',
    selfAssessmentTaxPaid: f.selfAssessmentTaxPaid || ''
  });

  const nextStep = async () => {
    if (currentStep === 3 && !activeFiling?.id) {
      await handleSaveDraft();
    } else if (currentStep === 3 && activeFiling?.id) {
      await handleSaveDraft();
    }
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => { if (currentStep > 1) setCurrentStep(prev => prev - 1); };

  const statusColor = (s) => {
    if (s === 'SUBMITTED') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (s === 'VERIFIED') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const statusIcon = (s) => {
    if (s === 'SUBMITTED') return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (s === 'VERIFIED') return <BadgeCheck className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  // ========== FILINGS LIST VIEW ==========
  if (showFilingsList) {
    return (
      <div className="space-y-8" id="tax-filing-page">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl p-8" style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)'
            }}></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)'
            }}></div>
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                }}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Income Tax Filing</h1>
                  <p className="text-sm text-slate-400">Indian ITR Preparation Assistant</p>
                </div>
              </div>
              <p className="text-slate-400 max-w-lg">
                Prepare your Income Tax Return with smart auto-population, regime comparison, and document checklist. Supports ITR-1, ITR-2, ITR-3, and ITR-4.
              </p>
            </div>
            <Button onClick={handleNewFiling} className="shrink-0 gap-2" style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none', color: 'white'
            }}>
              <Plus className="w-4 h-4" /> New ITR Filing
            </Button>
          </div>
        </div>

        {/* Previous Filings */}
        {filings.length > 0 ? (
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold text-foreground">Your Filings</h2>
            {filings.map((f) => (
              <Card key={f.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer group" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)'
                      }}>
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{f.itrFormType || 'ITR'}</span>
                          <span className="text-sm text-muted-foreground">• AY {f.assessmentYear}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(f.status)}`}>
                            {statusIcon(f.status)} {f.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {f.fullName || 'Unnamed'} • PAN: {f.panNumber ? f.panNumber.replace(/(.{5})/, '$1****') : 'N/A'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Gross Income: {formatCurrency(f.grossTotalIncome)}</span>
                          <span>•</span>
                          <span>Tax: {formatCurrency(f.selectedRegime === 'OLD' ? f.totalTaxOldRegime : f.totalTaxNewRegime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleViewFiling(f)} className="gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                      {f.status === 'DRAFT' && (
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteFiling(f.id); }}
                          className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-1">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)'
              }}>
                <FileText className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No filings yet</h3>
              <p className="text-muted-foreground mb-6">Start your first Income Tax Return filing</p>
              <Button onClick={handleNewFiling} style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none', color: 'white'
              }}>
                <Plus className="w-4 h-4 mr-2" /> Create Filing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ========== FILING WIZARD ==========
  return (
    <div className="space-y-6" id="tax-filing-wizard">
      {/* Back Button */}
      <button onClick={() => setShowFilingsList(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to filings
      </button>

      {/* Step Progress */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, i) => {
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <button key={step.id} onClick={() => setCurrentStep(step.id)}
                className="flex flex-col items-center gap-2 group relative z-10 bg-transparent border-none cursor-pointer">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                  isActive ? 'text-white shadow-lg shadow-indigo-500/30' :
                  'bg-muted text-muted-foreground'
                }`} style={isActive ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' } : {}}>
                  {isDone ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-indigo-400' : isDone ? 'text-green-400' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0 mx-12">
          <div className="h-full transition-all duration-500 ease-out rounded-full" style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #10b981)'
          }}></div>
        </div>
      </div>

      {/* Filing Status Badge */}
      {activeFiling && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColor(activeFiling.status)}`}>
            {statusIcon(activeFiling.status)} {activeFiling.status}
          </span>
          {activeFiling.itrFormType && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-3 h-3" /> {activeFiling.itrFormType}
            </span>
          )}
        </div>
      )}

      {/* ===== STEP 1: Personal Info ===== */}
      {currentStep === 1 && (
        <Card style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-400" /> Personal Information</CardTitle>
            <CardDescription>Basic details required for your ITR filing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name (as per PAN)</label>
                <Input value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">PAN Number</label>
                <Input value={form.panNumber} onChange={e => handleChange('panNumber', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} />
                {form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber) && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Invalid PAN format</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Assessment Year</label>
                <select value={form.assessmentYear} onChange={e => handleChange('assessmentYear', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  {AY_OPTIONS.map(o => <option key={o} value={o}>AY {o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Financial Year</label>
                <select value={form.financialYear} onChange={e => handleChange('financialYear', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  {FY_OPTIONS.map(o => <option key={o} value={o}>FY {o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select Tax Regime</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['OLD', 'NEW'].map(regime => (
                  <button key={regime} onClick={() => handleChange('selectedRegime', regime)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      form.selectedRegime === regime
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-border hover:border-indigo-500/50 bg-transparent'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground">{regime} Regime</span>
                      {form.selectedRegime === regime && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {regime === 'OLD' ? 'With deductions (80C, 80D, 24B, HRA, etc.)' : 'Lower rates, no deductions (except standard deduction)'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== STEP 2: Income Details ===== */}
      {currentStep === 2 && (
        <Card style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5 text-emerald-400" /> Income Details</CardTitle>
                <CardDescription>Enter all sources of income for FY {form.financialYear}</CardDescription>
              </div>
              <Button onClick={handleAutoPopulate} disabled={autoPopLoading} variant="outline" className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                {autoPopLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Auto-populate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Salary */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div> Salary Income
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Gross Salary (₹)</label>
                  <Input type="number" value={form.salaryIncome} onChange={e => handleChange('salaryIncome', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">HRA Exemption (₹)</label>
                  <Input type="number" value={form.hraExemption} onChange={e => handleChange('hraExemption', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">LTA Exemption (₹)</label>
                  <Input type="number" value={form.ltaExemption} onChange={e => handleChange('ltaExemption', e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Other Income Sources */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Other Income Sources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Interest Income (₹)</label>
                  <Input type="number" value={form.interestIncome} onChange={e => handleChange('interestIncome', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Rental Income (₹)</label>
                  <Input type="number" value={form.rentalIncome} onChange={e => handleChange('rentalIncome', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Business / Freelance Income (₹)</label>
                  <Input type="number" value={form.businessIncome} onChange={e => handleChange('businessIncome', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Other Income (₹)</label>
                  <Input type="number" value={form.otherIncome} onChange={e => handleChange('otherIncome', e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Capital Gains */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div> Capital Gains
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Short-Term Capital Gains (₹)</label>
                  <Input type="number" value={form.shortTermCapitalGains} onChange={e => handleChange('shortTermCapitalGains', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Long-Term Capital Gains (₹)</label>
                  <Input type="number" value={form.longTermCapitalGains} onChange={e => handleChange('longTermCapitalGains', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Digital Assets / Crypto (₹)</label>
                  <Input type="number" value={form.digitalAssetIncome} onChange={e => handleChange('digitalAssetIncome', e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== STEP 3: Deductions ===== */}
      {currentStep === 3 && (
        <Card style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingDown className="w-5 h-5 text-violet-400" /> Deductions & Tax Payments</CardTitle>
            <CardDescription>Claim eligible deductions under the Old Regime to reduce taxable income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section 80C */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)' }}>
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400"></div> Section 80C & 80CCD
              </h3>
              <p className="text-xs text-muted-foreground mb-3">PPF, ELSS, LIC, NSC, Tuition Fees (Max ₹1,50,000) + NPS (Additional ₹50,000)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Section 80C (₹) — Max ₹1,50,000</label>
                  <Input type="number" value={form.section80C} onChange={e => handleChange('section80C', e.target.value)} placeholder="0" />
                  {numVal(form.section80C) > 150000 && <p className="text-xs text-amber-400 mt-1">Capped at ₹1,50,000</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Section 80CCD(1B) NPS (₹) — Max ₹50,000</label>
                  <Input type="number" value={form.section80CCD1B} onChange={e => handleChange('section80CCD1B', e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Health & Insurance */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.1)' }}>
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div> Health & Insurance
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Health insurance premiums and preventive health checkup</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Section 80D Health Insurance (₹)</label>
                  <Input type="number" value={form.section80D} onChange={e => handleChange('section80D', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Health Checkup (₹) — Max ₹5,000</label>
                  <Input type="number" value={form.section80DHealthCheckup} onChange={e => handleChange('section80DHealthCheckup', e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Home Loan & Others */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.1)' }}>
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div> Home Loan, Donations & Others
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Section 24B Home Loan Interest (₹) — Max ₹2,00,000</label>
                  <Input type="number" value={form.section24B} onChange={e => handleChange('section24B', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Section 80G Donations (₹)</label>
                  <Input type="number" value={form.section80G} onChange={e => handleChange('section80G', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Section 80E Education Loan Interest (₹)</label>
                  <Input type="number" value={form.section80E} onChange={e => handleChange('section80E', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Section 80TTA Savings Interest (₹) — Max ₹10,000</label>
                  <Input type="number" value={form.section80TTA} onChange={e => handleChange('section80TTA', e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            {/* TDS & Taxes Paid */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div> Taxes Already Paid
              </h3>
              <p className="text-xs text-muted-foreground mb-3">TDS deducted, advance tax, and self-assessment tax paid</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">TDS Paid (₹)</label>
                  <Input type="number" value={form.tdsPaid} onChange={e => handleChange('tdsPaid', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Advance Tax Paid (₹)</label>
                  <Input type="number" value={form.advanceTaxPaid} onChange={e => handleChange('advanceTaxPaid', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Self-Assessment Tax (₹)</label>
                  <Input type="number" value={form.selfAssessmentTaxPaid} onChange={e => handleChange('selfAssessmentTaxPaid', e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== STEP 4: Tax Computation ===== */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {computeResult?.filing ? (
            <>
              {/* Regime Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['OLD', 'NEW'].map(regime => {
                  const f = computeResult.filing;
                  const isRec = f.recommendedRegime === regime;
                  const tax = regime === 'OLD' ? f.totalTaxOldRegime : f.totalTaxNewRegime;
                  const baseTax = regime === 'OLD' ? f.taxOldRegime : f.taxNewRegime;
                  const cess = regime === 'OLD' ? f.cessOldRegime : f.cessNewRegime;
                  return (
                    <Card key={regime} className={`relative overflow-hidden transition-all duration-300 ${isRec ? 'ring-2 ring-emerald-500/50' : ''}`}
                      style={{ border: isRec ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(99,102,241,0.1)' }}>
                      {isRec && (
                        <div className="absolute top-0 left-0 right-0 h-1" style={{
                          background: 'linear-gradient(90deg, #10b981, #34d399)'
                        }}></div>
                      )}
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            {regime === 'OLD' ? '🏛️' : '⚡'} {regime} Regime
                          </span>
                          {isRec && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Recommended
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Gross Total Income</span>
                          <span className="font-medium">{formatCurrency(f.grossTotalIncome)}</span>
                        </div>
                        {regime === 'OLD' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Deductions</span>
                            <span className="font-medium text-green-400">-{formatCurrency(f.totalDeductions)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Income Tax</span>
                          <span className="font-medium">{formatCurrency(baseTax)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cess (4%)</span>
                          <span className="font-medium">{formatCurrency(cess)}</span>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between">
                          <span className="font-semibold text-foreground">Total Tax</span>
                          <span className="text-xl font-bold" style={{ color: isRec ? '#10b981' : '#f59e0b' }}>{formatCurrency(tax)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Tax Savings Banner */}
              {computeResult.filing.taxSavings > 0 && (
                <div className="p-4 rounded-xl flex items-center gap-4" style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.1) 100%)',
                  border: '1px solid rgba(16,185,129,0.2)'
                }}>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Save {formatCurrency(computeResult.filing.taxSavings)} by choosing the {computeResult.filing.recommendedRegime} Regime
                    </p>
                    <p className="text-xs text-muted-foreground">Based on your current income and deductions</p>
                  </div>
                </div>
              )}

              {/* Refund / Payable */}
              <Card style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {computeResult.filing.refundOrPayable >= 0 ? 'Expected Refund' : 'Tax Payable'}
                    </p>
                    <p className={`text-4xl font-bold ${computeResult.filing.refundOrPayable >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(Math.abs(computeResult.filing.refundOrPayable))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      After adjusting TDS ({formatCurrency(computeResult.filing.tdsPaid)}) and advance tax ({formatCurrency(computeResult.filing.advanceTaxPaid)})
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Saving Tips */}
              {computeResult.taxSavingTips?.length > 0 && (
                <Card style={{ border: '1px solid rgba(245,158,11,0.15)' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="w-4 h-4 text-amber-400" /> Tax Saving Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {computeResult.taxSavingTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.05)' }}>
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-amber-400">{i + 1}</span>
                          </div>
                          <p className="text-sm text-foreground">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="text-center py-16" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
              <CardContent>
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Tax computation not ready</h3>
                <p className="text-muted-foreground">Please complete Steps 1–3 and save your filing first.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ===== STEP 5: Review & Submit ===== */}
      {currentStep === 5 && (
        <div className="space-y-6">
          {computeResult?.filing ? (
            <>
              {/* Summary Card */}
              <Card style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-indigo-400" /> Filing Summary</CardTitle>
                  <CardDescription>Review all details before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Personal */}
                  <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(99,102,241,0.05)' }}>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Personal Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-muted-foreground block text-xs">Name</span><span className="font-medium">{computeResult.filing.fullName}</span></div>
                      <div><span className="text-muted-foreground block text-xs">PAN</span><span className="font-medium">{computeResult.filing.panNumber}</span></div>
                      <div><span className="text-muted-foreground block text-xs">AY</span><span className="font-medium">{computeResult.filing.assessmentYear}</span></div>
                      <div><span className="text-muted-foreground block text-xs">ITR Form</span><span className="font-medium text-indigo-400">{computeResult.filing.itrFormType}</span></div>
                    </div>
                  </div>

                  {/* Income Summary */}
                  <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(16,185,129,0.05)' }}>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Income Summary</h4>
                    {[
                      ['Salary', computeResult.filing.salaryIncome],
                      ['Interest', computeResult.filing.interestIncome],
                      ['Rental', computeResult.filing.rentalIncome],
                      ['Capital Gains', (numVal(computeResult.filing.shortTermCapitalGains) + numVal(computeResult.filing.longTermCapitalGains))],
                      ['Business', computeResult.filing.businessIncome],
                      ['Other', computeResult.filing.otherIncome],
                    ].filter(([, v]) => numVal(v) > 0).map(([label, val]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{formatCurrency(val)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                      <span>Gross Total Income</span>
                      <span className="text-emerald-400">{formatCurrency(computeResult.filing.grossTotalIncome)}</span>
                    </div>
                  </div>

                  {/* Tax Outcome */}
                  <div className="p-4 rounded-xl" style={{
                    background: computeResult.filing.refundOrPayable >= 0
                      ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${computeResult.filing.refundOrPayable >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                  }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{computeResult.filing.refundOrPayable >= 0 ? 'Refund Expected' : 'Tax Due'}</p>
                        <p className={`text-3xl font-bold ${computeResult.filing.refundOrPayable >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(Math.abs(computeResult.filing.refundOrPayable))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Regime: {computeResult.filing.selectedRegime || computeResult.filing.recommendedRegime}</p>
                        <p className="text-xs text-muted-foreground">Total Tax: {formatCurrency(
                          (computeResult.filing.selectedRegime || computeResult.filing.recommendedRegime) === 'OLD'
                            ? computeResult.filing.totalTaxOldRegime : computeResult.filing.totalTaxNewRegime
                        )}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Checklist */}
              {computeResult.documentChecklist?.length > 0 && (
                <Card style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">📋 Document Checklist</CardTitle>
                    <CardDescription>Ensure you have all required documents before filing on the IT portal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {computeResult.documentChecklist.map((doc, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                          doc.required ? 'bg-indigo-500/5' : 'bg-muted/30 opacity-60'
                        }`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            doc.required ? 'bg-indigo-500/20' : 'bg-muted'
                          }`}>
                            {doc.required ? <Check className="w-3 h-3 text-indigo-400" /> : <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {computeResult.filing.status === 'DRAFT' && (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button onClick={handleSubmitFiling} disabled={loading} className="w-full sm:w-auto gap-2" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none', color: 'white'
                  }}>
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Submit Filing
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Note: This marks your filing as submitted. You still need to file on the official Income Tax e-filing portal.
                  </p>
                </div>
              )}

              {computeResult.filing.status === 'SUBMITTED' && (
                <div className="p-4 rounded-xl flex items-center gap-3" style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.2)'
                }}>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Filing Submitted!</p>
                    <p className="text-xs text-muted-foreground">
                      Use these details to file on{' '}
                      <a href="https://www.incometax.gov.in" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                        incometax.gov.in
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-16" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
              <CardContent>
                <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nothing to review yet</h3>
                <p className="text-muted-foreground">Complete all previous steps first.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <div className="flex items-center gap-3">
          {currentStep >= 2 && currentStep <= 3 && (
            <Button variant="outline" onClick={handleSaveDraft} disabled={loading} className="gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Save Draft
            </Button>
          )}
          {currentStep < 5 && (
            <Button onClick={nextStep} disabled={loading} className="gap-2" style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none', color: 'white'
            }}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Next <ChevronRight className="w-4 h-4" /></>}
            </Button>
          )}
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #tax-filing-wizard > div {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
