
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, Loader2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface RepaymentData {
  loanId: string;
  clientName: string;
  amountDue: number;
  amountPaid: number;
  dueDate: Date;
  paidDate?: Date;
  isPaid: boolean;
  isOverdue: boolean;
  daysPastDue?: number;
}

interface RepaymentStatusReportProps {
  onDownload?: () => void;
}

const RepaymentStatusReport = ({ onDownload }: RepaymentStatusReportProps) => {
  const [repaymentData, setRepaymentData] = useState<RepaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState({
    totalRepayments: 0,
    paidOnTime: 0,
    paidLate: 0,
    overdue: 0,
    totalAmount: 0,
    collectedAmount: 0,
    overdueAmount: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRepaymentData() {
      try {
        setLoading(true);
        
        // Fetch loan repayments with loan and client details
        const { data, error } = await supabase
          .from('loan_repayments')
          .select(`
            id,
            loan_id,
            amount,
            due_date,
            paid_date,
            is_paid,
            loans (
              client_id,
              clients (
                first_name,
                last_name
              )
            )
          `)
          .order('due_date', { ascending: false });

        if (error) throw error;

        const now = new Date();
        
        // Process and transform the data
        const transformedData: RepaymentData[] = data.map(item => {
          const dueDate = new Date(item.due_date);
          const paidDate = item.paid_date ? new Date(item.paid_date) : undefined;
          const isOverdue = !item.is_paid && isAfter(now, dueDate);
          const daysPastDue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
          
          return {
            loanId: item.loan_id,
            clientName: `${item.loans.clients.first_name} ${item.loans.clients.last_name}`,
            amountDue: item.amount,
            amountPaid: item.is_paid ? item.amount : 0,
            dueDate,
            paidDate,
            isPaid: item.is_paid,
            isOverdue,
            daysPastDue: isOverdue ? daysPastDue : undefined
          };
        });

        setRepaymentData(transformedData);
        
        // Calculate summary statistics
        const totalRepayments = transformedData.length;
        const paidOnTime = transformedData.filter(item => 
          item.isPaid && item.paidDate && !isAfter(item.paidDate, item.dueDate)
        ).length;
        
        const paidLate = transformedData.filter(item => 
          item.isPaid && item.paidDate && isAfter(item.paidDate, item.dueDate)
        ).length;
        
        const overdue = transformedData.filter(item => item.isOverdue).length;
        
        const totalAmount = transformedData.reduce((sum, item) => sum + item.amountDue, 0);
        const collectedAmount = transformedData.reduce((sum, item) => sum + item.amountPaid, 0);
        const overdueAmount = transformedData
          .filter(item => item.isOverdue)
          .reduce((sum, item) => sum + item.amountDue, 0);
        
        setSummary({
          totalRepayments,
          paidOnTime,
          paidLate,
          overdue,
          totalAmount,
          collectedAmount,
          overdueAmount
        });
        
      } catch (error: any) {
        console.error('Error fetching repayment data:', error);
        toast({
          title: "Error fetching repayment data",
          description: error.message || "There was a problem loading repayment data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRepaymentData();
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
      description: "Your repayment status report is being generated and will download shortly",
    });
  };

  const repaymentStatusData = [
    { name: "Paid on time", value: summary.paidOnTime, color: "#22c55e" },
    { name: "Paid late", value: summary.paidLate, color: "#eab308" },
    { name: "Overdue", value: summary.overdue, color: "#ef4444" }
  ];

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading repayment status data...</p>
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
              <Clock className="h-5 w-5" />
              Repayment Status Report
            </CardTitle>
            <CardDescription>
              Analysis of on-time payments and delinquencies
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Generated: {format(new Date(), 'dd MMM yyyy')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Repayment Status Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repaymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {repaymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} repayment(s)`, undefined]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Collection Performance</h3>
            <div className="space-y-6 p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium">Total Collection Rate</div>
                  <div className="text-sm font-medium">
                    {((summary.collectedAmount / summary.totalAmount) * 100).toFixed(1)}%
                  </div>
                </div>
                <Progress 
                  value={(summary.collectedAmount / summary.totalAmount) * 100} 
                  className="h-2" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-md shadow-sm">
                  <div className="text-sm text-muted-foreground">Total Expected</div>
                  <div className="text-xl font-bold">{formatCurrency(summary.totalAmount)}</div>
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm">
                  <div className="text-sm text-muted-foreground">Total Collected</div>
                  <div className="text-xl font-bold text-emerald-600">{formatCurrency(summary.collectedAmount)}</div>
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm">
                  <div className="text-sm text-muted-foreground">Overdue Amount</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(summary.overdueAmount)}</div>
                </div>
                <div className="p-3 bg-white rounded-md shadow-sm">
                  <div className="text-sm text-muted-foreground">Overdue Repayments</div>
                  <div className="text-xl font-bold text-red-600">{summary.overdue}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Recent Repayments</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repaymentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No repayment data found
                  </TableCell>
                </TableRow>
              ) : (
                repaymentData.slice(0, 10).map((repayment, index) => (
                  <TableRow key={index}>
                    <TableCell>{repayment.clientName}</TableCell>
                    <TableCell>{formatCurrency(repayment.amountDue)}</TableCell>
                    <TableCell>{format(repayment.dueDate, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {repayment.isPaid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      ) : repayment.isOverdue ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {repayment.isOverdue ? (
                        <span className="text-red-600 font-medium">{repayment.daysPastDue} days</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {repaymentData.length > 10 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-2 text-muted-foreground italic">
                    + {repaymentData.length - 10} more repayments (download full report)
                  </TableCell>
                </TableRow>
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

export default RepaymentStatusReport;
