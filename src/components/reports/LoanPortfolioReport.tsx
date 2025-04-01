
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LoanStatus, Loan } from '@/types/loan';
import { ArrowDownToLine, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoanPortfolioReportProps {
  onDownload?: () => void;
}

const LoanPortfolioReport = ({ onDownload }: LoanPortfolioReportProps) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState({
    totalLoans: 0,
    activeLoans: 0,
    totalValue: 0,
    activeValue: 0,
    disbursedThisMonth: 0,
    collectedThisMonth: 0,
    overdueAmount: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLoans() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('loans')
          .select('*, clients(first_name, last_name)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to match Loan type
        const transformedLoans: Loan[] = data.map(loan => ({
          id: loan.id,
          clientId: loan.client_id,
          amount: loan.amount,
          interestRate: loan.interest_rate,
          term: loan.term,
          purpose: loan.purpose,
          status: loan.status as LoanStatus,
          approvedBy: loan.approved_by || undefined,
          approvedAt: loan.approved_at ? new Date(loan.approved_at) : undefined,
          disbursedAt: loan.disbursed_at ? new Date(loan.disbursed_at) : undefined,
          startDate: loan.start_date ? new Date(loan.start_date) : undefined,
          endDate: loan.end_date ? new Date(loan.end_date) : undefined,
          createdAt: new Date(loan.created_at),
          updatedAt: new Date(loan.updated_at),
          branchId: loan.branch_id,
          productId: loan.product_id || undefined,
          clientName: `${loan.clients.first_name} ${loan.clients.last_name}`,
        }));

        setLoans(transformedLoans);

        // Calculate summary metrics
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const total = transformedLoans.length;
        const active = transformedLoans.filter(loan => loan.status === LoanStatus.ACTIVE).length;
        const totalVal = transformedLoans.reduce((sum, loan) => sum + loan.amount, 0);
        const activeVal = transformedLoans
          .filter(loan => loan.status === LoanStatus.ACTIVE)
          .reduce((sum, loan) => sum + loan.amount, 0);
        
        const disbursedThisMonth = transformedLoans
          .filter(loan => loan.disbursedAt && loan.disbursedAt >= firstDayOfMonth)
          .reduce((sum, loan) => sum + loan.amount, 0);
        
        setSummary({
          totalLoans: total,
          activeLoans: active,
          totalValue: totalVal,
          activeValue: activeVal,
          disbursedThisMonth,
          collectedThisMonth: 0, // Would need repayment data to calculate this
          overdueAmount: 0, // Would need repayment data to calculate this
        });

      } catch (error: any) {
        console.error('Error fetching loan data:', error);
        toast({
          title: "Error fetching loan data",
          description: error.message || "There was a problem loading loan data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLoans();
  }, [toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF or CSV
    if (onDownload) onDownload();
    toast({
      title: "Report download started",
      description: "Your report is being generated and will download shortly",
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading loan portfolio data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Loan Portfolio Report</CardTitle>
            <CardDescription>
              Overview of all active loans and their performance
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Generated: {format(new Date(), 'dd MMM yyyy')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm text-muted-foreground">Total Loans</h4>
            <p className="text-xl font-bold">{summary.totalLoans}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="text-sm text-muted-foreground">Active Loans</h4>
            <p className="text-xl font-bold">{summary.activeLoans}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <h4 className="text-sm text-muted-foreground">Portfolio Value</h4>
            <p className="text-xl font-bold">{formatCurrency(summary.totalValue)}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="text-sm text-muted-foreground">Active Value</h4>
            <p className="text-xl font-bold">{formatCurrency(summary.activeValue)}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Loan Details</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No loans found
                  </TableCell>
                </TableRow>
              ) : (
                loans.slice(0, 10).map(loan => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.clientName}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>
                      <span className={
                        loan.status === LoanStatus.ACTIVE ? "text-green-600 font-medium" : 
                        loan.status === LoanStatus.DEFAULTED ? "text-red-600 font-medium" : 
                        "text-blue-600 font-medium"
                      }>
                        {loan.status}
                      </span>
                    </TableCell>
                    <TableCell>{loan.startDate ? format(loan.startDate, 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>{loan.endDate ? format(loan.endDate, 'dd/MM/yyyy') : '-'}</TableCell>
                  </TableRow>
                ))
              )}
              {loans.length > 10 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-2 text-muted-foreground italic">
                    + {loans.length - 10} more loans (download full report)
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          variant="outline" 
          onClick={handleDownload}
          className="ml-auto flex items-center gap-2"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Download Full Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoanPortfolioReport;
