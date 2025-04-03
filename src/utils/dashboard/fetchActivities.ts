
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "./formatters";

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
