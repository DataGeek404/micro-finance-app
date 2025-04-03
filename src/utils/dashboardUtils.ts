
import { supabase } from "@/integrations/supabase/client";
import { Client, ClientStatus } from "@/types/client";
import { Loan, LoanStatus } from "@/types/loan";
import { Branch } from "@/types/branch";
import { toast } from "@/hooks/use-toast";

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

/**
 * Fetch loan status distribution for pie chart
 */
export const fetchLoanStatusDistribution = async () => {
  try {
    // Get counts for each loan status
    const statuses = Object.values(LoanStatus);
    const statusCounts = await Promise.all(
      statuses.map(async (status) => {
        const { count, error } = await supabase
          .from('loans')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
          
        if (error) throw error;
        
        return {
          name: status,
          value: count || 0
        };
      })
    );
    
    return statusCounts;
  } catch (error) {
    console.error("Error fetching loan status distribution:", error);
    toast({
      title: "Error fetching loan data",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive"
    });
    
    // Return empty array if there's an error
    return [];
  }
};

/**
 * Fetch recent activities for the dashboard
 */
export const fetchRecentActivities = async (limit = 5) => {
  try {
    // Get recent loan applications
    const { data: recentLoans, error: loansError } = await supabase
      .from('loans')
      .select(`
        id,
        amount,
        client_id,
        status,
        purpose,
        created_at,
        clients!inner(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (loansError) throw loansError;

    // Get recent client registrations
    const { data: recentClients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (clientsError) throw clientsError;

    // Get recent repayments
    const { data: recentRepayments, error: repaymentsError } = await supabase
      .from('loan_repayments')
      .select(`
        id,
        amount,
        paid_date,
        loan_id,
        loans!inner(client_id, clients!inner(first_name, last_name))
      `)
      .eq('is_paid', true)
      .order('paid_date', { ascending: false })
      .limit(limit);

    if (repaymentsError) throw repaymentsError;

    // Combine and format activities
    const activities = [
      ...recentLoans.map(loan => ({
        id: `loan-${loan.id}`,
        type: 'loan_applied' as const,
        description: `${loan.clients.first_name} ${loan.clients.last_name} applied for a new loan of ${formatCurrency(loan.amount)}`,
        timestamp: new Date(loan.created_at),
        user: `${loan.clients.first_name} ${loan.clients.last_name}`,
        amount: Number(loan.amount)
      })),
      ...recentClients.map(client => ({
        id: `client-${client.id}`,
        type: 'client_registered' as const,
        description: `New client ${client.first_name} ${client.last_name} registered`,
        timestamp: new Date(client.created_at),
        user: 'Loan Officer'
      })),
      ...recentRepayments.map(repayment => ({
        id: `repayment-${repayment.id}`,
        type: 'repayment_received' as const,
        description: `Repayment received for Loan #${repayment.loan_id.substring(0, 8)}`,
        timestamp: new Date(repayment.paid_date),
        user: `${repayment.loans.clients.first_name} ${repayment.loans.clients.last_name}`,
        amount: Number(repayment.amount)
      }))
    ];

    // Sort by timestamp (most recent first) and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    toast({
      title: "Error fetching activities",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive"
    });
    
    // Return empty array if there's an error
    return [];
  }
};

/**
 * Format currency values consistently
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
