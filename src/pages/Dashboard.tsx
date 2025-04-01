
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/dashboard/StatCard';
import DisbursementChart from '@/components/dashboard/DisbursementChart';
import LoanStatusChart from '@/components/dashboard/LoanStatusChart';
import RecentActivities from '@/components/dashboard/RecentActivities';
import { Building2, DollarSign, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { fetchDashboardStats, fetchLoanStatusDistribution } from '@/utils/dashboardUtils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  // Fetch dashboard statistics
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });
  
  // Fetch loan status distribution
  const { data: loanStatusData } = useQuery({
    queryKey: ['loanStatusDistribution'],
    queryFn: fetchLoanStatusDistribution
  });
  
  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
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
        const formattedRepayments = repayments?.map(repayment => ({
          id: repayment.id,
          type: 'repayment_received' as const,
          description: `Repayment received for Loan #${repayment.loan_id.substring(0, 6)}`,
          timestamp: new Date(repayment.paid_date),
          user: `${repayment.loans?.clients?.first_name} ${repayment.loans?.clients?.last_name}`,
          amount: Number(repayment.amount),
        })) || [];
        
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
        
        setRecentActivities(allActivities);
      } catch (error: any) {
        console.error('Error fetching recent activities:', error);
        toast({
          title: "Error loading activities",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    
    fetchRecentActivities();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="w-full h-80 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-medium">Loading dashboard...</h2>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (error || !stats) {
    return (
      <AppLayout>
        <div className="w-full h-80 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-medium">Failed to load dashboard data</h2>
            <p className="text-muted-foreground mt-2">Please try again later</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome to your microcredit finance system.</p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard
          title="Active Clients"
          value={stats.activeClients}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Amount Disbursed"
          value={formatCurrency(stats.totalAmountDisbursed)}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Branches"
          value={stats.totalBranches}
          icon={<Building2 className="h-5 w-5" />}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Monthly Repayment Progress</h3>
              <div className="flex items-end gap-1">
                <h2 className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalReceivedThisMonth)}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">of {formatCurrency(stats.totalExpectedThisMonth)}</p>
              </div>
            </div>
            <div className="mt-2 md:mt-0 flex items-center">
              {stats.repaymentRate < 85 ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
              ) : (
                <DollarSign className="h-4 w-4 text-emerald-500 mr-1" />
              )}
              <span 
                className={stats.repaymentRate < 85 ? 
                  "text-amber-500 text-xs sm:text-sm font-medium" : 
                  "text-emerald-500 text-xs sm:text-sm font-medium"
                }
              >
                {stats.repaymentRate.toFixed(1)}% repayment rate
              </span>
            </div>
          </div>
          <Progress value={stats.repaymentRate} className="h-2 mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="lg:col-span-2">
          <DisbursementChart data={stats.dailyData} />
        </div>
        {loanStatusData && <LoanStatusChart data={loanStatusData} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <RecentActivities activities={recentActivities} />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
