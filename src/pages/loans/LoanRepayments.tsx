
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoanDetails {
  id: string;
  amount: number;
  interest_rate: number;
  term: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  clients: {
    first_name: string;
    last_name: string;
  };
}

interface LoanRepayment {
  id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  is_paid: boolean;
  payment_method: string | null;
  transaction_id: string | null;
}

const LoanRepayments = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState<LoanRepayment | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState<string>('');

  // Fetch loan details
  const { 
    data: loanDetails,
    isLoading: isLoadingLoan,
    error: loanError,
    refetch: refetchLoan
  } = useQuery({
    queryKey: ['loan', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          id,
          amount,
          interest_rate,
          term,
          status,
          start_date,
          end_date,
          clients (
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as LoanDetails;
    }
  });

  // Fetch loan repayments
  const { 
    data: repayments,
    isLoading: isLoadingRepayments,
    error: repaymentsError,
    refetch: refetchRepayments
  } = useQuery({
    queryKey: ['loanRepayments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_repayments')
        .select('*')
        .eq('loan_id', id)
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      return data as LoanRepayment[];
    }
  });

  // Calculate repayment stats
  const repaymentStats = React.useMemo(() => {
    if (!repayments) return { totalPaid: 0, totalDue: 0, progress: 0 };
    
    const totalAmount = repayments.reduce((sum, repayment) => sum + repayment.amount, 0);
    const totalPaid = repayments.filter(r => r.is_paid).reduce((sum, r) => sum + r.amount, 0);
    
    return {
      totalPaid,
      totalDue: totalAmount,
      progress: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0
    };
  }, [repayments]);

  const handlePayment = async () => {
    if (!selectedRepayment || !repaymentAmount || parseFloat(repaymentAmount) < selectedRepayment.amount) {
      toast({
        title: "Invalid Amount",
        description: `Please enter at least KSh ${selectedRepayment?.amount.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update repayment as paid
      const { error } = await supabase
        .from('loan_repayments')
        .update({ 
          is_paid: true,
          paid_date: new Date().toISOString(),
          payment_method: 'Cash', // Could be from a form input
          transaction_id: `TRANS-${Date.now()}` // Should come from payment processor in real app
        })
        .eq('id', selectedRepayment.id);
        
      if (error) throw error;
      
      // Check if all repayments are now paid
      const { data: remainingRepayments, error: countError } = await supabase
        .from('loan_repayments')
        .select('id')
        .eq('loan_id', id)
        .eq('is_paid', false);
        
      if (countError) throw countError;
      
      // If no more repayments, mark loan as completed
      if (remainingRepayments && remainingRepayments.length === 0) {
        const { error: updateError } = await supabase
          .from('loans')
          .update({ 
            status: 'COMPLETED',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
          
        if (updateError) throw updateError;
        
        // Refetch loan details to update status
        refetchLoan();
      }
      
      // Reset form and close dialog
      setIsRepayDialogOpen(false);
      setSelectedRepayment(null);
      setRepaymentAmount('');
      
      // Refetch repayments
      refetchRepayments();
      
      toast({
        title: "Payment Successful",
        description: `Payment of KSh ${parseFloat(repaymentAmount).toLocaleString()} recorded successfully.`
      });
    } catch (err) {
      console.error('Error processing payment:', err);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpenRepayDialog = (repayment: LoanRepayment) => {
    setSelectedRepayment(repayment);
    setRepaymentAmount(repayment.amount.toString());
    setIsRepayDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const isLoading = isLoadingLoan || isLoadingRepayments;
  const hasError = loanError || repaymentsError;
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading loan repayments...</span>
        </div>
      </AppLayout>
    );
  }
  
  if (hasError) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">Failed to load loan repayment data</p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/loans')}>
              Back to Loans
            </Button>
            <Button onClick={() => { refetchLoan(); refetchRepayments(); }}>
              Retry
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/loans')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Loans
            </Button>
            <h1 className="text-2xl font-bold">Loan Repayment Schedule</h1>
            <p className="text-muted-foreground">
              {loanDetails?.clients && `Client: ${loanDetails.clients.first_name} ${loanDetails.clients.last_name}`}
            </p>
          </div>
          
          <Badge 
            className={`text-sm py-1.5 px-3 ${
              loanDetails?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
              loanDetails?.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
              'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
            variant="outline"
          >
            {loanDetails?.status}
          </Badge>
        </div>
        
        {/* Loan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Loan Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(loanDetails?.amount || 0)}</p>
              <p className="text-sm text-muted-foreground">
                Term: {loanDetails?.term} months at {loanDetails?.interest_rate}% interest
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Repayment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(repaymentStats.totalPaid)} 
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  of {formatCurrency(repaymentStats.totalDue)}
                </span>
              </p>
              <Progress value={repaymentStats.progress} className="h-2 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Loan Period</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{loanDetails?.term} months</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(loanDetails?.start_date)} - {formatDate(loanDetails?.end_date)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Repayment Schedule Table */}
        <Card>
          <CardHeader>
            <CardTitle>Repayment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repayments && repayments.length > 0 ? (
                  repayments.map((repayment) => (
                    <TableRow key={repayment.id}>
                      <TableCell>{formatDate(repayment.due_date)}</TableCell>
                      <TableCell>{formatCurrency(repayment.amount)}</TableCell>
                      <TableCell>
                        {repayment.is_paid ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700">Paid</Badge>
                        ) : new Date(repayment.due_date) < new Date() ? (
                          <Badge variant="outline" className="bg-red-100 text-red-700">Overdue</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(repayment.paid_date)}</TableCell>
                      <TableCell>{repayment.payment_method || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        {!repayment.is_paid && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRepayDialog(repayment)}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No repayment schedule found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={isRepayDialogOpen} onOpenChange={setIsRepayDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>
          
          {selectedRepayment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <p className="font-medium">{formatDate(selectedRepayment.due_date)}</p>
              </div>
              
              <div>
                <Label htmlFor="dueAmount">Due Amount</Label>
                <p className="font-medium">{formatCurrency(selectedRepayment.amount)}</p>
              </div>
              
              <div>
                <Label htmlFor="payment" className="text-sm">Payment Amount</Label>
                <Input
                  id="payment"
                  type="number"
                  placeholder="Enter payment amount"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum amount: {formatCurrency(selectedRepayment.amount)}
                </p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRepayDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePayment}>
                  Make Payment
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default LoanRepayments;
