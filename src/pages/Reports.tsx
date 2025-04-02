
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, ArrowDownToLine, Calendar, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import LoanPortfolioReport from '@/components/reports/LoanPortfolioReport';
import BranchPerformanceReport from '@/components/reports/BranchPerformanceReport';
import RepaymentStatusReport from '@/components/reports/RepaymentStatusReport';
import DownloadReport from '@/components/reports/DownloadReport';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for reports
  const monthlyPerformanceData = [
    { month: 'Jan', disbursed: 45000, collected: 32000, profit: 8000 },
    { month: 'Feb', disbursed: 52000, collected: 38000, profit: 9500 },
    { month: 'Mar', disbursed: 48000, collected: 35000, profit: 8750 },
    { month: 'Apr', disbursed: 61000, collected: 45000, profit: 11250 },
    { month: 'May', disbursed: 55000, collected: 42000, profit: 10500 },
    { month: 'Jun', disbursed: 67000, collected: 49000, profit: 12250 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Data for each report type
  const reportData = {
    monthlyPerformance: monthlyPerformanceData,
    loanPortfolio: [
      { loanId: "L001", client: "John Doe", amount: 50000, status: "ACTIVE", progress: 45 },
      { loanId: "L002", client: "Jane Smith", amount: 75000, status: "ACTIVE", progress: 60 },
      { loanId: "L003", client: "David Kimani", amount: 100000, status: "ACTIVE", progress: 25 },
      { loanId: "L004", client: "Lucy Wanjiru", amount: 30000, status: "COMPLETED", progress: 100 },
    ],
    repaymentStatus: [
      { month: "January", onTime: 85, late: 10, missed: 5 },
      { month: "February", onTime: 82, late: 13, missed: 5 },
      { month: "March", onTime: 78, late: 15, missed: 7 },
      { month: "April", onTime: 88, late: 8, missed: 4 },
    ],
    branchPerformance: [
      { branch: "Nairobi CBD", loans: 45, disbursed: 2250000, collected: 1850000 },
      { branch: "Westlands", loans: 32, disbursed: 1850000, collected: 1250000 },
      { branch: "Mombasa", loans: 28, disbursed: 1650000, collected: 1450000 },
      { branch: "Kisumu", loans: 18, disbursed: 1050000, collected: 850000 },
    ],
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and view financial reports</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loan-portfolio">Loan Portfolio</TabsTrigger>
          <TabsTrigger value="repayment-status">Repayment Status</TabsTrigger>
          <TabsTrigger value="branch-performance">Branch Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Performance
                  </CardTitle>
                  <CardDescription>
                    Overview of loan disbursements, collections and profit over time
                  </CardDescription>
                </div>
                <DownloadReport 
                  title="Monthly Performance" 
                  data={reportData.monthlyPerformance}
                  filename="monthly-performance-report"
                />
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `KSh${value/1000}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`KSh${value.toLocaleString()}`, undefined]}
                      />
                      <Legend />
                      <Bar dataKey="disbursed" name="Loans Disbursed" fill="#28a0b7" />
                      <Bar dataKey="collected" name="Repayments Collected" fill="#0c8599" />
                      <Bar dataKey="profit" name="Net Profit" fill="#099268" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5" />
                  Loan Portfolio Report
                </CardTitle>
                <CardDescription>
                  Summary of all active loans and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Generation time: ~2 minutes</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-1"
                  onClick={() => setActiveTab('loan-portfolio')}
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  <span>Generate Report</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5" />
                  Repayment Status Report
                </CardTitle>
                <CardDescription>
                  Analysis of on-time payments and delinquencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: Yesterday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Generation time: ~3 minutes</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-1"
                  onClick={() => setActiveTab('repayment-status')}
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  <span>Generate Report</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5" />
                  Branch Performance Report
                </CardTitle>
                <CardDescription>
                  Comparison of branch activity and revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: 3 days ago</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Generation time: ~4 minutes</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-1"
                  onClick={() => setActiveTab('branch-performance')}
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  <span>Generate Report</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loan-portfolio">
          <div className="mb-4 flex justify-between items-center">
            <Button variant="ghost" onClick={() => setActiveTab('overview')}>
              ← Back to Reports
            </Button>
            <DownloadReport 
              title="Loan Portfolio" 
              data={reportData.loanPortfolio}
              filename="loan-portfolio-report"
            />
          </div>
          <LoanPortfolioReport />
        </TabsContent>

        <TabsContent value="repayment-status">
          <div className="mb-4 flex justify-between items-center">
            <Button variant="ghost" onClick={() => setActiveTab('overview')}>
              ← Back to Reports
            </Button>
            <DownloadReport 
              title="Repayment Status" 
              data={reportData.repaymentStatus}
              filename="repayment-status-report"
            />
          </div>
          <RepaymentStatusReport />
        </TabsContent>

        <TabsContent value="branch-performance">
          <div className="mb-4 flex justify-between items-center">
            <Button variant="ghost" onClick={() => setActiveTab('overview')}>
              ← Back to Reports
            </Button>
            <DownloadReport 
              title="Branch Performance" 
              data={reportData.branchPerformance}
              filename="branch-performance-report"
            />
          </div>
          <BranchPerformanceReport />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Reports;
