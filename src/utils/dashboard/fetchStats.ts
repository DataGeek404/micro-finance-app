
import { supabase } from "@/integrations/supabase/client";
import { ClientStatus } from "@/types/client";
import { LoanStatus } from "@/types/loan";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "./formatters";

interface DashboardStats {
  activeClients: number;
  activeLoans: number;
  pendingLoans: number;
  totalBranches: number;
  totalAmountDisbursed: number;
  totalExpectedThisMonth: number;
  totalReceivedThisMonth: number;
  repaymentRate: number;
  dailyData: {
    date: string;
    disbursement: number;
    profit: number;
  }[];
}

/**
 * Fetch all statistics needed for the dashboard
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get active clients count
    const { count: activeClientsCount, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', ClientStatus.ACTIVE);

    if (clientsError) throw clientsError;

    // Get branches count
    const { count: branchesCount, error: branchesError } = await supabase
      .from('branches')
      .select('*', { count: 'exact', head: true });

    if (branchesError) throw branchesError;

    // Get active loans count
    const { count: activeLoansCount, error: activeLoansError } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .in('status', [LoanStatus.ACTIVE, LoanStatus.DISBURSED]);

    if (activeLoansError) throw activeLoansError;

    // Get pending loans count
    const { count: pendingLoansCount, error: pendingLoansError } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('status', LoanStatus.PENDING);

    if (pendingLoansError) throw pendingLoansError;

    // Get total amount disbursed
    const { data: loansData, error: loansError } = await supabase
      .from('loans')
      .select('amount')
      .in('status', [LoanStatus.ACTIVE, LoanStatus.DISBURSED]);

    if (loansError) throw loansError;

    const totalAmountDisbursed = loansData.reduce((sum, loan) => sum + Number(loan.amount), 0);

    // Get repayments data
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const { data: repayments, error: repaymentsError } = await supabase
      .from('loan_repayments')
      .select('amount, is_paid, due_date, paid_date')
      .gte('due_date', startOfMonth.toISOString())
      .lte('due_date', endOfMonth.toISOString());

    if (repaymentsError) throw repaymentsError;

    const totalExpectedThisMonth = repayments.reduce((sum, repayment) => sum + Number(repayment.amount), 0);
    const totalReceivedThisMonth = repayments
      .filter(repayment => repayment.is_paid)
      .reduce((sum, repayment) => sum + Number(repayment.amount), 0);

    const repaymentRate = totalExpectedThisMonth > 0 
      ? (totalReceivedThisMonth / totalExpectedThisMonth) * 100 
      : 100; // If nothing is expected, consider 100% repayment rate

    // Get daily disbursement/profit data for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentLoans, error: recentLoansError } = await supabase
      .from('loans')
      .select('amount, interest_rate, disbursed_at')
      .gte('disbursed_at', thirtyDaysAgo.toISOString())
      .order('disbursed_at', { ascending: true });

    if (recentLoansError) throw recentLoansError;

    // Group by date and calculate daily totals
    const dailyData: DashboardStats['dailyData'] = [];
    const dailyMap = new Map<string, { disbursement: number; profit: number }>();

    recentLoans.forEach(loan => {
      if (!loan.disbursed_at) return;

      const date = loan.disbursed_at.split('T')[0];
      const amount = Number(loan.amount);
      const profit = amount * (Number(loan.interest_rate) / 100);

      if (dailyMap.has(date)) {
        const current = dailyMap.get(date)!;
        dailyMap.set(date, {
          disbursement: current.disbursement + amount,
          profit: current.profit + profit
        });
      } else {
        dailyMap.set(date, { disbursement: amount, profit });
      }
    });

    // Fill in any missing days in the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { disbursement: 0, profit: 0 });
      }
    }

    // Convert map to array and sort by date
    Array.from(dailyMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .forEach(([date, values]) => {
        dailyData.push({
          date,
          disbursement: values.disbursement,
          profit: values.profit
        });
      });

    return {
      activeClients: activeClientsCount || 0,
      activeLoans: activeLoansCount || 0,
      pendingLoans: pendingLoansCount || 0,
      totalBranches: branchesCount || 0,
      totalAmountDisbursed,
      totalExpectedThisMonth,
      totalReceivedThisMonth,
      repaymentRate,
      dailyData
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    toast({
      title: "Error fetching dashboard data",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive"
    });
    
    // Return default values if there's an error
    return {
      activeClients: 0,
      activeLoans: 0,
      pendingLoans: 0,
      totalBranches: 0,
      totalAmountDisbursed: 0,
      totalExpectedThisMonth: 0,
      totalReceivedThisMonth: 0,
      repaymentRate: 0,
      dailyData: []
    };
  }
};
