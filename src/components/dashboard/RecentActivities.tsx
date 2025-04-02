
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clock, DollarSign, FilePlus, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ActivityItem {
  id: string;
  type: 'loan_applied' | 'loan_approved' | 'loan_disbursed' | 'client_registered' | 'repayment_received';
  description: string;
  timestamp: Date;
  user: string;
  amount?: number;
}

interface RecentActivitiesProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  error?: Error | null;
}

const iconMap = {
  loan_applied: FilePlus,
  loan_approved: Check,
  loan_disbursed: DollarSign,
  client_registered: UserPlus,
  repayment_received: DollarSign,
};

const colorMap = {
  loan_applied: 'bg-blue-100 text-blue-600',
  loan_approved: 'bg-green-100 text-green-600',
  loan_disbursed: 'bg-finance-100 text-finance-600',
  client_registered: 'bg-purple-100 text-purple-600',
  repayment_received: 'bg-amber-100 text-amber-600',
};

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities: propActivities, isLoading: propIsLoading, error: propError }) => {
  // Use local fetching if no activities are provided via props
  const { data: fetchedActivities, isLoading, error } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      // If activities are provided via props, don't fetch
      if (propActivities) {
        return null;
      }

      try {
        // Fetch recent loan applications
        const { data: loanApps, error: loanAppsError } = await supabase
          .from('loan_applications')
          .select(`
            id,
            amount,
            status,
            created_at,
            clients(first_name, last_name),
            loan_products(name)
          `)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (loanAppsError) throw loanAppsError;
        
        // Fetch recent repayments
        const { data: repayments, error: repaymentsError } = await supabase
          .from('loan_repayments')
          .select(`
            id,
            amount,
            paid_date,
            loan_id,
            loans(client_id, clients(first_name, last_name))
          `)
          .eq('is_paid', true)
          .order('paid_date', { ascending: false })
          .limit(2);
          
        if (repaymentsError) throw repaymentsError;
        
        // Fetch new clients
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('id, first_name, last_name, created_at')
          .order('created_at', { ascending: false })
          .limit(2);
          
        if (clientsError) throw clientsError;
        
        // Format loan applications
        const formattedLoanApps = loanApps?.map(app => ({
          id: app.id,
          type: 'loan_applied' as const,
          description: `${app.clients?.first_name} ${app.clients?.last_name} applied for a ${app.loan_products?.name} of $${app.amount}`,
          timestamp: new Date(app.created_at),
          user: `${app.clients?.first_name} ${app.clients?.last_name}`,
          amount: Number(app.amount),
        })) || [];
        
        // Format repayments
        const formattedRepayments = repayments?.map(repayment => {
          const clientName = repayment.loans?.clients ? 
            `${repayment.loans.clients.first_name} ${repayment.loans.clients.last_name}` : 
            'Unknown Client';
            
          return {
            id: repayment.id,
            type: 'repayment_received' as const,
            description: `Repayment received for Loan #${repayment.loan_id.substring(0, 6)}`,
            timestamp: new Date(repayment.paid_date),
            user: clientName,
            amount: Number(repayment.amount),
          };
        }) || [];
        
        // Format clients
        const formattedClients = clients?.map(client => ({
          id: client.id,
          type: 'client_registered' as const,
          description: `New client ${client.first_name} ${client.last_name} registered`,
          timestamp: new Date(client.created_at),
          user: 'Loan Officer',
        })) || [];
        
        // Combine and sort by timestamp
        const allActivities = [
          ...formattedLoanApps,
          ...formattedRepayments,
          ...formattedClients
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
        
        return allActivities;
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        throw error;
      }
    },
    enabled: !propActivities, // Only run the query if activities are not provided via props
  });
  
  const displayActivities = propActivities || fetchedActivities || [];
  const displayLoading = propIsLoading !== undefined ? propIsLoading : isLoading;
  const displayError = propError || error;
  
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading activities...</span>
          </div>
        ) : displayError ? (
          <div className="text-center p-8 text-red-500">
            Failed to load activities.
          </div>
        ) : displayActivities.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No recent activities found.
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity) => {
              const IconComponent = iconMap[activity.type] || FilePlus;
              const colorClass = colorMap[activity.type] || 'bg-gray-100 text-gray-600';
              
              return (
                <div key={activity.id} className="flex items-start">
                  <div className={cn('p-2 rounded-full mr-3', colorClass)}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground ml-2">by {activity.user}</p>
                    </div>
                    {activity.amount && (
                      <p className="text-sm font-medium mt-1 text-finance-600">
                        ${activity.amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
