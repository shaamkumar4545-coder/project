import { useState } from 'react';
import { taxService } from '../services/taxService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TaxCalculator() {
  const [annualIncome, setAnnualIncome] = useState('');
  const [deductions, setDeductions] = useState({
    section80C: '',
    section80D: '',
    section24B: '',
    otherDeductions: ''
  });
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!annualIncome || parseFloat(annualIncome) <= 0) {
      toast.error('Please enter a valid annual income');
      return;
    }

    setLoading(true);
    try {
      const deductionsData = {
        section80C: parseFloat(deductions.section80C) || 0,
        section80D: parseFloat(deductions.section80D) || 0,
        section24B: parseFloat(deductions.section24B) || 0,
        otherDeductions: parseFloat(deductions.otherDeductions) || 0
      };

      const result = await taxService.compareRegimes(parseFloat(annualIncome), deductionsData);
      setComparison(result);
    } catch (error) {
      console.error('Error calculating tax:', error);
      toast.error('Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calculator className="w-8 h-8" />
          Income Tax Calculator (India)
        </h1>
        <p className="text-gray-600 mt-2">Compare Old Regime vs New Regime tax calculations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Calculation Input</CardTitle>
            <CardDescription>Enter your annual income and deductions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Annual Income (₹)</label>
                <Input
                  type="number"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  placeholder="Enter annual income"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Deductions (Old Regime)</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section 80C (Max ₹1,50,000)
                    </label>
                    <Input
                      type="number"
                      value={deductions.section80C}
                      onChange={(e) => setDeductions({ ...deductions, section80C: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section 80D (Health Insurance)
                    </label>
                    <Input
                      type="number"
                      value={deductions.section80D}
                      onChange={(e) => setDeductions({ ...deductions, section80D: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section 24B (Home Loan Interest)
                    </label>
                    <Input
                      type="number"
                      value={deductions.section24B}
                      onChange={(e) => setDeductions({ ...deductions, section24B: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Other Deductions
                    </label>
                    <Input
                      type="number"
                      value={deductions.otherDeductions}
                      onChange={(e) => setDeductions({ ...deductions, otherDeductions: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleCalculate} className="w-full" disabled={loading}>
                {loading ? 'Calculating...' : 'Calculate Tax'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {comparison && (
          <div className="space-y-4">
            {/* Old Regime */}
            <Card className={comparison.recommendedRegime === 'old' ? 'border-green-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Old Regime
                  {comparison.recommendedRegime === 'old' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Recommended
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxable Income:</span>
                    <span className="font-medium">₹{comparison.oldRegime.taxableIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">₹{comparison.oldRegime.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cess (4%):</span>
                    <span className="font-medium">₹{comparison.oldRegime.cess.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Tax:</span>
                    <span>₹{comparison.oldRegime.totalTax.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Regime */}
            <Card className={comparison.recommendedRegime === 'new' ? 'border-green-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  New Regime
                  {comparison.recommendedRegime === 'new' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Recommended
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxable Income:</span>
                    <span className="font-medium">₹{comparison.newRegime.taxableIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">₹{comparison.newRegime.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cess (4%):</span>
                    <span className="font-medium">₹{comparison.newRegime.cess.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Tax:</span>
                    <span>₹{comparison.newRegime.totalTax.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Tax Savings</p>
                  <p className={`text-3xl font-bold ${comparison.oldRegime.totalTax > comparison.newRegime.totalTax ? 'text-green-500' : 'text-red-500'}`}>
                    ₹{Math.abs(comparison.oldRegime.totalTax - comparison.newRegime.totalTax).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {comparison.oldRegime.totalTax > comparison.newRegime.totalTax 
                      ? 'New Regime saves more' 
                      : 'Old Regime saves more'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

