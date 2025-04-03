
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/dashboard/StatCard';
import DisbursementChart from '@/components/dashboard/DisbursementChart';
import LoanStatusChart from '@/components/dashboard/LoanStatusChart';
import RecentActivities from '@/components/dashboard/RecentActivities';
import { Building2, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { fetchDashboardStats, fetchLoanStatusDistribution, fetchRecentActivities, formatCurrency } from '@/utils/dashboardUtils';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loanStatusData, setLoanStatusData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, loanData, activitiesData] = await Promise.all([
          fetchDashboardStats(),
          fetchLoanStatusDistribution(),
          fetchRecentActivities(5)
        ]);
        
        setStats(statsData);
        setLoanStatusData(loanData);
        setRecentActivities(activitiesData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Loading state UI
  if (isLoading || !stats) {
    return (
      <AppLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your microcredit finance system.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        
        <Skeleton className="h-16 w-full mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-[400px] lg:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
        
        <Skeleton className="h-[400px] w-full" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your microcredit finance system.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
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

      <div className="mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Repayment Progress</h3>
              <div className="flex items-end gap-1">
                <h2 className="text-2xl font-bold">{formatCurrency(stats.totalReceivedThisMonth)}</h2>
                <p className="text-muted-foreground text-sm mb-1">of {formatCurrency(stats.totalExpectedThisMonth)}</p>
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
                  "text-amber-500 text-sm font-medium" : 
                  "text-emerald-500 text-sm font-medium"
                }
              >
                {stats.repaymentRate.toFixed(1)}% repayment rate
              </span>
            </div>
          </div>
          <Progress value={stats.repaymentRate} className="h-2 mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <DisbursementChart data={stats.dailyData} />
        <LoanStatusChart data={loanStatusData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivities activities={recentActivities} />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
