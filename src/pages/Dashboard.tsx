
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/dashboard/StatCard';
import DisbursementChart from '@/components/dashboard/DisbursementChart';
import LoanStatusChart from '@/components/dashboard/LoanStatusChart';
import RecentActivities from '@/components/dashboard/RecentActivities';
import { getDashboardStats, getLoanStatusDistribution } from '@/data/mockData';
import { Building2, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const stats = getDashboardStats();
  const loanStatusData = getLoanStatusDistribution();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const recentActivities = [
    {
      id: '1',
      type: 'loan_applied' as const,
      description: 'John Smith applied for a new loan of $5,000',
      timestamp: new Date('2023-05-15T10:30:00'),
      user: 'John Smith',
      amount: 5000,
    },
    {
      id: '2',
      type: 'loan_approved' as const,
      description: 'Loan application #LN2023-056 approved',
      timestamp: new Date('2023-05-14T14:45:00'),
      user: 'Admin User',
      amount: 3000,
    },
    {
      id: '3',
      type: 'loan_disbursed' as const,
      description: 'Loan #LN2023-054 disbursed to client',
      timestamp: new Date('2023-05-14T11:20:00'),
      user: 'Admin User',
      amount: 2500,
    },
    {
      id: '4',
      type: 'client_registered' as const,
      description: 'New client Sarah Patel registered',
      timestamp: new Date('2023-05-13T09:15:00'),
      user: 'Loan Officer',
    },
    {
      id: '5',
      type: 'repayment_received' as const,
      description: 'Repayment received for Loan #LN2023-042',
      timestamp: new Date('2023-05-13T16:30:00'),
      user: 'Mary Johnson',
      amount: 468.75,
    },
  ];

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
