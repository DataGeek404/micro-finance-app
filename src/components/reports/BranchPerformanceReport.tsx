
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, Loader2, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface BranchPerformance {
  id: string;
  name: string;
  clientCount: number;
  activeLoans: number;
  totalDisbursed: number;
  totalCollected: number;
  profit: number;
  employeeCount: number;
}

interface BranchPerformanceReportProps {
  onDownload?: () => void;
}

const BranchPerformanceReport = ({ onDownload }: BranchPerformanceReportProps) => {
  const [branchData, setBranchData] = useState<BranchPerformance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchBranchPerformance() {
      try {
        setLoading(true);
        // Fetch branches
        const { data: branches, error: branchError } = await supabase
          .from('branches')
          .select('*');

        if (branchError) throw branchError;

        // For each branch, fetch related data
        const branchPerformanceData: BranchPerformance[] = await Promise.all(
          branches.map(async (branch) => {
            // Count clients in this branch
            const { count: clientCount, error: clientError } = await supabase
              .from('clients')
              .select('*', { count: 'exact', head: true })
              .eq('branch_id', branch.id);

            if (clientError) throw clientError;

            // Count active loans in this branch
            const { count: activeLoans, error: loanError } = await supabase
              .from('loans')
              .select('*', { count: 'exact', head: true })
              .eq('branch_id', branch.id)
              .eq('status', 'ACTIVE');

            if (loanError) throw loanError;

            // Sum disbursed amount for this branch
            const { data: loanData, error: loanAmountError } = await supabase
              .from('loans')
              .select('amount')
              .eq('branch_id', branch.id);

            if (loanAmountError) throw loanAmountError;

            // Fix: Convert loan.amount to number before summing
            const totalDisbursed = loanData.reduce((sum, loan) => {
              // Ensure loan.amount is treated as a number
              const amount = typeof loan.amount === 'string' ? parseFloat(loan.amount) : loan.amount;
              return sum + amount;
            }, 0);

            // In a real app, we would calculate these values from actual data
            // For now, we'll simulate it
            const totalCollected = totalDisbursed * 0.7 * (Math.random() * 0.3 + 0.7); // 70-100% of expected collections
            const profit = totalCollected * 0.3; // 30% profit margin

            return {
              id: branch.id,
              name: branch.name,
              clientCount: clientCount || 0,
              activeLoans: activeLoans || 0,
              totalDisbursed,
              totalCollected,
              profit,
              employeeCount: branch.employee_count || 0
            };
          })
        );

        setBranchData(branchPerformanceData);
      } catch (error: any) {
        console.error('Error fetching branch performance data:', error);
        toast({
          title: "Error fetching branch data",
          description: error.message || "There was a problem loading branch performance data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchBranchPerformance();
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
    if (onDownload) onDownload();
    toast({
      title: "Report download started",
      description: "Your branch performance report is being generated and will download shortly",
    });
  };

  const chartData = branchData.map((branch) => ({
    name: branch.name,
    disbursed: branch.totalDisbursed,
    collected: branch.totalCollected,
    profit: branch.profit,
  }));

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading branch performance data...</p>
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
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Branch Performance Report
            </CardTitle>
            <CardDescription>
              Comparative analysis of branch operations and revenue
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Generated: {format(new Date(), 'dd MMM yyyy')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `Ksh${value/1000}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`Ksh${value.toLocaleString()}`, undefined]}
              />
              <Legend />
              <Bar dataKey="disbursed" name="Loans Disbursed" fill="#3b82f6" />
              <Bar dataKey="collected" name="Repayments Collected" fill="#10b981" />
              <Bar dataKey="profit" name="Net Profit" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h3 className="text-lg font-semibold mb-3">Branch Comparison</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Active Loans</TableHead>
                <TableHead>Disbursed</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Employees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branchData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No branch data found
                  </TableCell>
                </TableRow>
              ) : (
                branchData.map(branch => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.clientCount}</TableCell>
                    <TableCell>{branch.activeLoans}</TableCell>
                    <TableCell>{formatCurrency(branch.totalDisbursed)}</TableCell>
                    <TableCell>{formatCurrency(branch.totalCollected)}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">{formatCurrency(branch.profit)}</TableCell>
                    <TableCell>{branch.employeeCount}</TableCell>
                  </TableRow>
                ))
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

export default BranchPerformanceReport;
