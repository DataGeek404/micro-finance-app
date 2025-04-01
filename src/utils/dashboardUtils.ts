
import { supabase } from "@/integrations/supabase/client";
import { LoanStatus } from "@/types/loan";
import { ClientStatus } from "@/types/client";
import { toast } from "@/hooks/use-toast";

interface DashboardStats {
  activeClients: number;
  activeLoans: number;
  totalAmountDisbursed: number;
  totalBranches: number;
  totalExpectedThisMonth: number;
  totalReceivedThisMonth: number;
  repaymentRate: number;
  dailyData: Array<{
    date: string;
    disbursement: number;
    profit: number;
  }>;
}

/**
 * Fetches statistics for the dashboard
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch active clients
    const { count: activeClients, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', ClientStatus.ACTIVE);
    
    if (clientsError) throw clientsError;

    // Fetch active loans
    const { count: activeLoans, error: loansError } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .in('status', [LoanStatus.ACTIVE, LoanStatus.DISBURSED]);
    
    if (loansError) throw loansError;

    // Fetch sum of disbursed loans
    const { data: disbursedData, error: disbursedError } = await supabase
      .from('loans')
      .select('amount')
      .in('status', [LoanStatus.ACTIVE, LoanStatus.DISBURSED, LoanStatus.COMPLETED]);
    
    if (disbursedError) throw disbursedError;
    
    const totalAmountDisbursed = disbursedData.reduce((sum, loan) => sum + Number(loan.amount), 0);

    // Fetch branches
    const { count: totalBranches, error: branchesError } = await supabase
      .from('branches')
      .select('*', { count: 'exact', head: true });
    
    if (branchesError) throw branchesError;

    // Calculate repayment metrics for the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Expected repayments this month
    const { data: expectedRepayments, error: expectedError } = await supabase
      .from('loan_repayments')
      .select('amount')
      .gte('due_date', firstDayOfMonth.toISOString())
      .lte('due_date', lastDayOfMonth.toISOString());
    
    if (expectedError) throw expectedError;
    
    const totalExpectedThisMonth = expectedRepayments.reduce((sum, repayment) => sum + Number(repayment.amount), 0);

    // Received repayments this month
    const { data: receivedRepayments, error: receivedError } = await supabase
      .from('loan_repayments')
      .select('amount')
      .gte('paid_date', firstDayOfMonth.toISOString())
      .lte('paid_date', lastDayOfMonth.toISOString())
      .eq('is_paid', true);
    
    if (receivedError) throw receivedError;
    
    const totalReceivedThisMonth = receivedRepayments.reduce((sum, repayment) => sum + Number(repayment.amount), 0);

    // Calculate repayment rate
    const repaymentRate = totalExpectedThisMonth > 0 
      ? (totalReceivedThisMonth / totalExpectedThisMonth) * 100 
      : 100;

    // Generate daily data for the chart (last 30 days)
    const dailyData = await fetchDailyDisbursements();

    return {
      activeClients: activeClients || 0,
      activeLoans: activeLoans || 0,
      totalAmountDisbursed,
      totalBranches: totalBranches || 0,
      totalExpectedThisMonth,
      totalReceivedThisMonth,
      repaymentRate,
      dailyData
    };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    toast({
      title: "Error fetching dashboard statistics",
      description: error.message,
      variant: "destructive",
    });
    
    // Return default values in case of error
    return {
      activeClients: 0,
      activeLoans: 0,
      totalAmountDisbursed: 0,
      totalBranches: 0,
      totalExpectedThisMonth: 0,
      totalReceivedThisMonth: 0,
      repaymentRate: 0,
      dailyData: []
    };
  }
};

/**
 * Fetches daily disbursement data for the last 30 days
 */
export const fetchDailyDisbursements = async () => {
  try {
    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29); // Last 30 days including today

    // Fetch loans disbursed in the last 30 days
    const { data: disbursements, error } = await supabase
      .from('loans')
      .select('amount, disbursed_at, interest_rate')
      .gte('disbursed_at', startDate.toISOString())
      .lte('disbursed_at', endDate.toISOString())
      .not('disbursed_at', 'is', null);
    
    if (error) throw error;
    
    // Generate date array for the last 30 days
    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Initialize daily data with zeros
    const dailyData = dates.map(date => ({
      date,
      disbursement: 0,
      profit: 0
    }));
    
    // Fill in actual data
    disbursements?.forEach(loan => {
      if (!loan.disbursed_at) return;
      
      const date = new Date(loan.disbursed_at).toISOString().split('T')[0];
      const amount = Number(loan.amount);
      const interestRate = Number(loan.interest_rate) / 100;
      
      const dateIndex = dailyData.findIndex(d => d.date === date);
      if (dateIndex >= 0) {
        dailyData[dateIndex].disbursement += amount;
        // Simplified profit calculation (just for display purposes)
        dailyData[dateIndex].profit += (amount * interestRate) / 12;
      }
    });
    
    return dailyData;
  } catch (error: any) {
    console.error('Error fetching daily disbursements:', error);
    return [];
  }
};

/**
 * Fetches loan status distribution for the pie chart
 */
export const fetchLoanStatusDistribution = async () => {
  try {
    const { data: loans, error } = await supabase
      .from('loans')
      .select('status');
      
    if (error) throw error;
    
    // Count loans by status
    const statusCounts: Record<string, number> = {};
    loans?.forEach(loan => {
      if (!statusCounts[loan.status]) {
        statusCounts[loan.status] = 0;
      }
      statusCounts[loan.status]++;
    });
    
    // Convert to array format for the chart
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  } catch (error: any) {
    console.error('Error fetching loan status distribution:', error);
    return [];
  }
};
