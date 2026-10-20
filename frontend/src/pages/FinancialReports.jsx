import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function FinancialReports() {
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 2);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [yearWiseData, setYearWiseData] = useState([]);
  const [netWorthData, setNetWorthData] = useState([]);
  const [taxHistory, setTaxHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = JSON.parse(localStorage.getItem('user'))?.id || 'demo-user';

  useEffect(() => {
    fetchReports();
  }, [startYear, endYear]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [yearWise, netWorth, tax] = await Promise.all([
        reportService.getYearWiseComparison(userId, startYear, endYear),
        reportService.getNetWorthGrowth(userId, startYear, endYear),
        reportService.getTaxHistory(userId, startYear, endYear)
      ]);
      setYearWiseData(yearWise);
      setNetWorthData(netWorth);
      setTaxHistory(tax);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Financial Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Period: ${startYear} - ${endYear}`, 14, 30);

    // Year-wise comparison table
    const yearWiseTable = yearWiseData.map(item => [
      item.year.toString(),
      `₹${item.income.toFixed(2)}`,
      `₹${item.expense.toFixed(2)}`,
      `₹${item.savings.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Year', 'Income', 'Expense', 'Savings']],
      body: yearWiseTable,
      startY: 40
    });

    // Net worth table
    const netWorthTable = netWorthData.map(item => [
      item.year.toString(),
      `₹${item.netWorth.toFixed(2)}`,
      `₹${item.totalIncome.toFixed(2)}`,
      `₹${item.totalExpense.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Year', 'Net Worth', 'Total Income', 'Total Expense']],
      body: netWorthTable,
      startY: doc.lastAutoTable.finalY + 20
    });

    doc.save(`financial-report-${startYear}-${endYear}.pdf`);
    toast.success('PDF exported successfully');
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Year-wise comparison sheet
    const yearWiseSheet = XLSX.utils.json_to_sheet(
      yearWiseData.map(item => ({
        Year: item.year,
        Income: item.income,
        Expense: item.expense,
        Savings: item.savings
      }))
    );
    XLSX.utils.book_append_sheet(wb, yearWiseSheet, 'Year-wise Comparison');

    // Net worth sheet
    const netWorthSheet = XLSX.utils.json_to_sheet(
      netWorthData.map(item => ({
        Year: item.year,
        'Net Worth': item.netWorth,
        'Total Income': item.totalIncome,
        'Total Expense': item.totalExpense,
        'Investment Value': item.investmentValue
      }))
    );
    XLSX.utils.book_append_sheet(wb, netWorthSheet, 'Net Worth Growth');

    // Tax history sheet
    const taxSheet = XLSX.utils.json_to_sheet(
      taxHistory.map(item => ({
        Year: item.year,
        'Annual Income': item.annualIncome,
        'Tax Paid': item.taxPaid
      }))
    );
    XLSX.utils.book_append_sheet(wb, taxSheet, 'Tax History');

    XLSX.writeFile(wb, `financial-report-${startYear}-${endYear}.xlsx`);
    toast.success('Excel file exported successfully');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-gray-600 mt-2">Multi-year financial analysis and insights</p>
        </div>
        <div className="flex gap-4">
          <select
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 9 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <span className="self-center">to</span>
          <select
            value={endYear}
            onChange={(e) => setEndYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 9 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <Button onClick={exportToPDF} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={exportToExcel} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Year-wise Income & Expense Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Year-wise Income & Expense Comparison</CardTitle>
              <CardDescription>Track your financial performance over the years</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearWiseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#00C49F" name="Income" />
                  <Bar dataKey="expense" fill="#FF8042" name="Expense" />
                  <Bar dataKey="savings" fill="#8884d8" name="Savings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Net Worth Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Growth</CardTitle>
              <CardDescription>Track your net worth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="netWorth" stroke="#8884d8" strokeWidth={2} name="Net Worth" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tax History */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Paid History</CardTitle>
              <CardDescription>Annual tax payments over the years</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taxHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="annualIncome" fill="#00C49F" name="Annual Income" />
                  <Bar dataKey="taxPaid" fill="#FF8042" name="Tax Paid" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">Income</th>
                      <th className="text-right p-2">Expense</th>
                      <th className="text-right p-2">Savings</th>
                      <th className="text-right p-2">Net Worth</th>
                      <th className="text-right p-2">Tax Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearWiseData.map((item, index) => {
                      const netWorth = netWorthData[index];
                      const tax = taxHistory[index];
                      return (
                        <tr key={item.year} className="border-b">
                          <td className="p-2">{item.year}</td>
                          <td className="text-right p-2">₹{item.income.toFixed(2)}</td>
                          <td className="text-right p-2">₹{item.expense.toFixed(2)}</td>
                          <td className="text-right p-2">₹{item.savings.toFixed(2)}</td>
                          <td className="text-right p-2">
                            {netWorth ? `₹${netWorth.netWorth.toFixed(2)}` : '-'}
                          </td>
                          <td className="text-right p-2">
                            {tax ? `₹${tax.taxPaid.toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

