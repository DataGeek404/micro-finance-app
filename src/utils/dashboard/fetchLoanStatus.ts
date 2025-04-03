
import { supabase } from "@/integrations/supabase/client";
import { LoanStatus } from "@/types/loan";
import { toast } from "@/hooks/use-toast";

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
