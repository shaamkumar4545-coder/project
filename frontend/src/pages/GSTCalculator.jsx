import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ReceiptText, FileText, Download, Printer, FileSpreadsheet, FileType } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function GSTCalculator() {
    const [amount, setAmount] = useState('');
    const [tax, setTax] = useState(18); // Default 18%
    const [type, setType] = useState('exclusive'); // exclusive | inclusive
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState(null);

    // Calculations
    const numericAmount = parseFloat(amount) || 0;

    let gstAmount = 0;
    let totalAmount = 0;
    let netAmount = 0;

    if (type === 'exclusive') {
        gstAmount = (numericAmount * tax) / 100;
        totalAmount = numericAmount + gstAmount;
        netAmount = numericAmount;
    } else {
        // Inclusive: Amount = Net + GST
        // Net = Amount / (1 + tax/100)
        netAmount = numericAmount / (1 + tax / 100);
        gstAmount = numericAmount - netAmount;
        totalAmount = numericAmount;
    }

    const generateReportData = () => {
        const reportDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        const reportMonth = new Date().toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric'
        });

        return {
            reportNumber: `GSTR-3B-${Date.now()}`,
            reportDate: reportDate,
            reportMonth: reportMonth,
            businessDetails: {
                gstin: '29ABCDE1234F1Z5', // Placeholder
                legalName: 'Your Business Name',
                tradeName: 'Trade Name',
                address: 'Business Address, City, State - PIN'
            },
            summary: {
                netAmount: netAmount,
                gstAmount: gstAmount,
                totalAmount: totalAmount,
                taxRate: tax,
                taxType: type === 'exclusive' ? 'GST Exclusive' : 'GST Inclusive'
            },
            details: [
                {
                    description: 'Taxable Value',
                    amount: netAmount,
                    gstRate: `${tax}%`,
                    cgst: type === 'exclusive' ? (gstAmount / 2) : (gstAmount / 2),
                    sgst: type === 'exclusive' ? (gstAmount / 2) : (gstAmount / 2),
                    igst: 0,
                    total: totalAmount
                }
            ]
        };
    };

    const handleGenerateReport = () => {
        if (!amount) {
            toast.error('Please enter an amount first.');
            return;
        }
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            const report = generateReportData();
            setReportData(report);
            setIsGenerating(false);
            toast.success('GSTR-3B Report Generated Successfully!', {
                icon: '📄',
                duration: 4000
            });
        }, 1500);
    };

    const handleDownloadExcel = () => {
        if (!reportData) {
            toast.error('Please generate a report first.');
            return;
        }

        try {
            const wsData = [
                ['GSTR-3B RETURN SUMMARY'],
                ['Report Number:', reportData.reportNumber],
                ['Report Date:', reportData.reportDate],
                ['Report Period:', reportData.reportMonth],
                [],
                ['BUSINESS DETAILS'],
                ['GSTIN:', reportData.businessDetails.gstin],
                ['Legal Name:', reportData.businessDetails.legalName],
                ['Trade Name:', reportData.businessDetails.tradeName],
                ['Address:', reportData.businessDetails.address],
                [],
                ['SUMMARY'],
                ['Tax Type:', reportData.summary.taxType],
                ['GST Rate:', `${reportData.summary.taxRate}%`],
                ['Net Amount:', reportData.summary.netAmount],
                ['GST Amount:', reportData.summary.gstAmount],
                ['Total Amount:', reportData.summary.totalAmount],
                [],
                ['DETAILED BREAKDOWN'],
                ['Description', 'Taxable Value', 'GST Rate', 'CGST', 'SGST', 'IGST', 'Total'],
                ...reportData.details.map(item => [
                    item.description,
                    item.amount,
                    item.gstRate,
                    item.cgst,
                    item.sgst,
                    item.igst,
                    item.total
                ])
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Set column widths
            ws['!cols'] = [
                { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
                { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'GSTR-3B Report');
            XLSX.writeFile(wb, `GSTR-3B-Report-${Date.now()}.xlsx`);

            toast.success('Report downloaded as Excel!', {
                icon: '📊',
                duration: 3000
            });
        } catch (error) {
            console.error('Error downloading Excel:', error);
            toast.error('Failed to download Excel file.');
        }
    };

    const handleDownloadPDF = () => {
        if (!reportData) {
            toast.error('Please generate a report first.');
            return;
        }

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            let yPosition = 20;

            // Header
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('GSTR-3B RETURN SUMMARY', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            // Report Details
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Report Number: ${reportData.reportNumber}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Report Date: ${reportData.reportDate}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Report Period: ${reportData.reportMonth}`, 20, yPosition);
            yPosition += 10;

            // Business Details
            doc.setFont('helvetica', 'bold');
            doc.text('BUSINESS DETAILS', 20, yPosition);
            yPosition += 6;
            doc.setFont('helvetica', 'normal');
            doc.text(`GSTIN: ${reportData.businessDetails.gstin}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Legal Name: ${reportData.businessDetails.legalName}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Trade Name: ${reportData.businessDetails.tradeName}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Address: ${reportData.businessDetails.address}`, 20, yPosition);
            yPosition += 10;

            // Summary
            doc.setFont('helvetica', 'bold');
            doc.text('SUMMARY', 20, yPosition);
            yPosition += 6;
            doc.setFont('helvetica', 'normal');
            doc.text(`Tax Type: ${reportData.summary.taxType}`, 20, yPosition);
            yPosition += 6;
            doc.text(`GST Rate: ${reportData.summary.taxRate}%`, 20, yPosition);
            yPosition += 6;
            doc.text(`Net Amount: ₹${reportData.summary.netAmount.toFixed(2)}`, 20, yPosition);
            yPosition += 6;
            doc.text(`GST Amount: ₹${reportData.summary.gstAmount.toFixed(2)}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Total Amount: ₹${reportData.summary.totalAmount.toFixed(2)}`, 20, yPosition);
            yPosition += 10;

            // Detailed Table
            autoTable(doc, {
                startY: yPosition,
                head: [['Description', 'Taxable Value', 'GST Rate', 'CGST', 'SGST', 'IGST', 'Total']],
                body: reportData.details.map(item => [
                    item.description,
                    `₹${item.amount.toFixed(2)}`,
                    item.gstRate,
                    `₹${item.cgst.toFixed(2)}`,
                    `₹${item.sgst.toFixed(2)}`,
                    `₹${item.igst.toFixed(2)}`,
                    `₹${item.total.toFixed(2)}`
                ]),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 8 },
                margin: { left: 20, right: 20 }
            });

            // Footer
            const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPosition + 60;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('This is a computer-generated document. Signature not required.', pageWidth / 2, finalY, { align: 'center' });

            doc.save(`GSTR-3B-Report-${Date.now()}.pdf`);

            toast.success('Report downloaded as PDF!', {
                icon: '📄',
                duration: 3000
            });
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download PDF file.');
        }
    };

    const taxSlabs = [5, 12, 18, 28];

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
                    <ReceiptText className="w-10 h-10" /> GST Calculator
                </h1>
                <p className="text-muted-foreground">Calculate GST and generate compliance reports instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Input Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Initial Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-8 text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">GST Rate (%)</label>
                            <div className="flex gap-2">
                                {taxSlabs.map((slab) => (
                                    <Button
                                        key={slab}
                                        variant={tax === slab ? 'default' : 'outline'}
                                        onClick={() => setTax(slab)}
                                        className="flex-1"
                                    >
                                        {slab}%
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tax Type</label>
                            <div className="flex rounded-md border border-input p-1 bg-muted/20">
                                <button
                                    onClick={() => setType('exclusive')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-sm transition-all ${type === 'exclusive' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Exclusive
                                </button>
                                <button
                                    onClick={() => setType('inclusive')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-sm transition-all ${type === 'inclusive' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Inclusive
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleGenerateReport}
                                disabled={isGenerating}
                                variant="gradient"
                                className="w-full h-12 text-lg"
                            >
                                {isGenerating ? 'Generating Report...' : (
                                    <>
                                        <FileText className="mr-2 h-5 w-5" /> Generate GSTR-3B Report
                                    </>
                                )}
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* Result Section */}
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 shadow-inner">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-slate-100">Calculation Result</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-sm text-slate-600 dark:text-slate-400">Net Amount</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹ {Math.round(netAmount).toLocaleString()}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-slate-600 dark:text-slate-400">GST Amount ({tax}%)</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹ {Math.round(gstAmount).toLocaleString()}</p>
                        </div>

                        <div className="border-t border-dashed border-slate-300 dark:border-slate-600 pt-4 mt-2">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                                    <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">₹ {Math.round(totalAmount).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {isGenerating && (
                            <div className="animate-pulse space-y-2 pt-4">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-4 bg-muted rounded w-1/2"></div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Report Display Section */}
            {reportData && (
                <Card className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl">GSTR-3B Report</CardTitle>
                                <CardDescription>Generated on {reportData.reportDate}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleDownloadExcel}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <FileSpreadsheet className="h-4 w-4" /> Download Excel
                                </Button>
                                <Button
                                    onClick={handleDownloadPDF}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <FileType className="h-4 w-4" /> Download PDF
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Business Details */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold mb-3 text-foreground">Business Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">GSTIN:</span>
                                    <span className="ml-2 font-medium">{reportData.businessDetails.gstin}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Legal Name:</span>
                                    <span className="ml-2 font-medium">{reportData.businessDetails.legalName}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Trade Name:</span>
                                    <span className="ml-2 font-medium">{reportData.businessDetails.tradeName}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Report Period:</span>
                                    <span className="ml-2 font-medium">{reportData.reportMonth}</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold mb-3 text-foreground">Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Tax Type</p>
                                    <p className="font-semibold text-foreground">{reportData.summary.taxType}</p>
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">GST Rate</p>
                                    <p className="font-semibold text-foreground">{reportData.summary.taxRate}%</p>
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Net Amount</p>
                                    <p className="font-semibold text-foreground">₹{reportData.summary.netAmount.toFixed(2)}</p>
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">GST Amount</p>
                                    <p className="font-semibold text-red-600 dark:text-red-400">₹{reportData.summary.gstAmount.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium text-foreground">Total Amount</span>
                                    <span className="text-2xl font-bold text-primary">₹{reportData.summary.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-foreground">Detailed Breakdown</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted border-b">
                                            <th className="p-3 text-left text-sm font-semibold text-foreground">Description</th>
                                            <th className="p-3 text-right text-sm font-semibold text-foreground">Taxable Value</th>
                                            <th className="p-3 text-center text-sm font-semibold text-foreground">GST Rate</th>
                                            <th className="p-3 text-right text-sm font-semibold text-foreground">CGST</th>
                                            <th className="p-3 text-right text-sm font-semibold text-foreground">SGST</th>
                                            <th className="p-3 text-right text-sm font-semibold text-foreground">IGST</th>
                                            <th className="p-3 text-right text-sm font-semibold text-foreground">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.details.map((item, index) => (
                                            <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="p-3 text-sm text-foreground">{item.description}</td>
                                                <td className="p-3 text-sm text-right text-foreground">₹{item.amount.toFixed(2)}</td>
                                                <td className="p-3 text-sm text-center text-foreground">{item.gstRate}</td>
                                                <td className="p-3 text-sm text-right text-foreground">₹{item.cgst.toFixed(2)}</td>
                                                <td className="p-3 text-sm text-right text-foreground">₹{item.sgst.toFixed(2)}</td>
                                                <td className="p-3 text-sm text-right text-foreground">₹{item.igst.toFixed(2)}</td>
                                                <td className="p-3 text-sm text-right font-semibold text-primary">₹{item.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-muted/50 border-t-2 border-primary">
                                            <td colSpan="6" className="p-3 text-right font-semibold text-foreground">Grand Total</td>
                                            <td className="p-3 text-right font-bold text-lg text-primary">₹{reportData.summary.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
