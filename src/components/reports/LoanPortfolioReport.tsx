
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/dashboard/formatters';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PrintableReport from '@/components/reports/PrintableReport';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const LoanPortfolioReport = () => {
  const [timeframe, setTimeframe] = useState<string>("all");

  // Fetch loan portfolio data
  const { data: loanData, isLoading } = useQuery({
    queryKey: ['loanPortfolioReport', timeframe],
    queryFn: async () => {
      let query = supabase
        .from('loans')
        .select(`
          id,
          amount,
          interest_rate,
          term,
          status,
          start_date,
          end_date,
          clients!inner(first_name, last_name),
          branches!inner(name)
        `);

      // Apply timeframe filter if needed
      if (timeframe !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (timeframe) {
          case "1month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case "3months":
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          case "6months":
            startDate = new Date(now.setMonth(now.getMonth() - 6));
            break;
          case "1year":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            startDate = new Date(0); // Beginning of time
        }

        query = query.gte('start_date', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Process data for report
      return data.map(loan => ({
        id: loan.id,
        clientName: `${loan.clients.first_name} ${loan.clients.last_name}`,
        branch: loan.branches.name,
        amount: loan.amount,
        interestRate: loan.interest_rate,
        term: loan.term,
        status: loan.status,
        startDate: loan.start_date ? new Date(loan.start_date).toLocaleDateString() : '-',
        endDate: loan.end_date ? new Date(loan.end_date).toLocaleDateString() : '-'
      }));
    }
  });

  // Calculate summary statistics
  const summary = loanData ? {
    'Total Loans': loanData.length,
    'Total Portfolio Value': formatCurrency(loanData.reduce((sum, loan) => sum + (loan.amount || 0), 0)),
    'Average Loan Amount': formatCurrency(
      loanData.length > 0 
        ? loanData.reduce((sum, loan) => sum + (loan.amount || 0), 0) / loanData.length 
        : 0
    ),
    'Active Loans': loanData.filter(loan => loan.status === 'ACTIVE').length
  } : {};

  // Define columns for the printable report
  const reportColumns = [
    { key: 'clientName', label: 'Client' },
    { key: 'branch', label: 'Branch' },
    { key: 'amount', label: 'Amount', format: (val: number) => formatCurrency(val) },
    { key: 'interestRate', label: 'Interest Rate', format: (val: number) => `${val}%` },
    { key: 'term', label: 'Term (months)' },
    { key: 'status', label: 'Status' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Loan Portfolio Report</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="timeframe">Timeframe:</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger id="timeframe" className="w-36">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : loanData && loanData.length > 0 ? (
        <PrintableReport
          title="Loan Portfolio Report"
          subtitle={timeframe === "all" ? "All Time" : `Last ${timeframe === "1month" ? "Month" : timeframe === "3months" ? "3 Months" : timeframe === "6months" ? "6 Months" : "Year"}`}
          data={loanData}
          columns={reportColumns}
          summary={summary}
        >
          <div className="mb-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left bg-muted">Client</th>
                    <th className="px-4 py-2 text-left bg-muted">Branch</th>
                    <th className="px-4 py-2 text-left bg-muted">Amount</th>
                    <th className="px-4 py-2 text-left bg-muted">Interest Rate</th>
                    <th className="px-4 py-2 text-left bg-muted">Term</th>
                    <th className="px-4 py-2 text-left bg-muted">Status</th>
                    <th className="px-4 py-2 text-left bg-muted">Start Date</th>
                    <th className="px-4 py-2 text-left bg-muted">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loanData.map((loan) => (
                    <tr key={loan.id} className="border-b">
                      <td className="px-4 py-2">{loan.clientName}</td>
                      <td className="px-4 py-2">{loan.branch}</td>
                      <td className="px-4 py-2">{formatCurrency(loan.amount)}</td>
                      <td className="px-4 py-2">{loan.interestRate}%</td>
                      <td className="px-4 py-2">{loan.term} months</td>
                      <td className="px-4 py-2">{loan.status}</td>
                      <td className="px-4 py-2">{loan.startDate}</td>
                      <td className="px-4 py-2">{loan.endDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Total Loans</p>
                <p className="text-2xl font-semibold">{loanData.length}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(loanData.reduce((sum, loan) => sum + (loan.amount || 0), 0))}
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Average Amount</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(
                    loanData.length > 0 
                      ? loanData.reduce((sum, loan) => sum + (loan.amount || 0), 0) / loanData.length 
                      : 0
                  )}
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-semibold">
                  {loanData.filter(loan => loan.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>
        </PrintableReport>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No loan data available for the selected timeframe.</p>
        </div>
      )}
    </Card>
  );
};

export default LoanPortfolioReport;
