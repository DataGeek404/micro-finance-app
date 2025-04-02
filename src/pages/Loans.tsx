import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loan, LoanStatus } from '@/types/loan';
import { Plus, Search, FileText, ArrowUpRight, Loader2, Eye, PlayCircle, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Define types for our DB data
interface DbLoan {
  id: string;
  client_id: string;
  amount: number;
  interest_rate: number;
  term: number;
  purpose: string;
  status: string;
  branch_id: string;
  approved_at: string | null;
  approved_by: string | null;
  disbursed_at: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  product_id: string | null;
}

interface DbClient {
  id: string;
  first_name: string;
  last_name: string;
}

interface LoadingState {
  loans: boolean;
  clients: boolean;
  approval: boolean;
  activation: boolean;
}

const Loans = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loans, setLoans] = useState<Array<DbLoan & { clientName: string }>>([]);
  const [clients, setClients] = useState<DbClient[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    loans: true,
    clients: false,
    approval: false,
    activation: false
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<DbLoan & { clientName: string } | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false);
  const [repaymentAmount, setRepaymentAmount] = useState<string>('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
    fetchClients();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(prev => ({ ...prev, loans: true }));
      
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select(`
          *,
          clients (id, first_name, last_name)
        `);
      
      if (loansError) throw loansError;
      
      // Transform data to match expected format
      const transformedLoans = loansData.map(loan => ({
        ...loan,
        clientName: loan.clients ? `${loan.clients.first_name} ${loan.clients.last_name}` : 'Unknown Client'
      }));
      
      setLoans(transformedLoans);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError('Failed to load loans. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load loans. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, loans: false }));
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(prev => ({ ...prev, clients: true }));
      
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, first_name, last_name');
      
      if (clientsError) throw clientsError;
      
      setClients(clientsData);
    } catch (err) {
      console.error('Error fetching clients:', err);
      // We don't set the main error state here since clients are secondary data
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  const approveLoan = async (loanId: string) => {
    try {
      setLoading(prev => ({ ...prev, approval: true }));
      
      // In a real app, we would get the current authenticated user's id
      const approvedBy = "00000000-0000-0000-0000-000000000000"; // Placeholder
      
      const { error: updateError } = await supabase
        .from('loans')
        .update({ 
          status: LoanStatus.APPROVED,
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId);
      
      if (updateError) throw updateError;
      
      // Refresh loans data
      await fetchLoans();
      
      toast({
        title: "Loan Approved",
        description: `Loan #${loanId.substring(0, 8)} has been approved successfully.`
      });
    } catch (err) {
      console.error('Error approving loan:', err);
      toast({
        title: "Error",
        description: "Failed to approve loan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, approval: false }));
    }
  };

  const activateLoan = async (loanId: string) => {
    try {
      setLoading(prev => ({ ...prev, activation: true }));
      
      // Get current date for start date
      const startDate = new Date().toISOString();
      
      // Get the loan to calculate end date
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select('term')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      // Calculate end date based on term (months)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + loanData.term);
      
      // Update loan status to ACTIVE
      const { error: updateError } = await supabase
        .from('loans')
        .update({ 
          status: LoanStatus.ACTIVE,
          start_date: startDate,
          end_date: endDate.toISOString(),
          disbursed_at: startDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId);
      
      if (updateError) throw updateError;
      
      // Create repayment schedule
      await createRepaymentSchedule(loanId, loanData.term, startDate);
      
      // Refresh loans data
      await fetchLoans();
      
      toast({
        title: "Loan Activated",
        description: `Loan #${loanId.substring(0, 8)} has been activated and repayment schedule created.`
      });
    } catch (err) {
      console.error('Error activating loan:', err);
      toast({
        title: "Error",
        description: "Failed to activate loan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, activation: false }));
    }
  };

  const createRepaymentSchedule = async (loanId: string, term: number, startDate: string) => {
    try {
      // Get the loan details
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select('amount, interest_rate')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      const principal = loanData.amount;
      const interestRate = loanData.interest_rate / 100; // Convert to decimal
      
      // Calculate simple monthly payment (principal + interest / term)
      // This is a simplified calculation - in a real system you'd use more complex amortization
      const totalInterest = principal * interestRate * term / 12; // Annual interest rate for term months
      const totalAmount = principal + totalInterest;
      const monthlyPayment = totalAmount / term;
      
      // Create a repayment for each month
      const repayments = [];
      const startDateObj = new Date(startDate);
      
      for (let i = 0; i < term; i++) {
        const dueDate = new Date(startDateObj);
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        
        repayments.push({
          loan_id: loanId,
          amount: monthlyPayment,
          due_date: dueDate.toISOString(),
          is_paid: false
        });
      }
      
      // Insert all repayments
      const { error: insertError } = await supabase
        .from('loan_repayments')
        .insert(repayments);
      
      if (insertError) throw insertError;
      
    } catch (err) {
      console.error('Error creating repayment schedule:', err);
      throw new Error('Failed to create repayment schedule');
    }
  };

  const handleRepayment = async () => {
    if (!selectedLoan || !repaymentAmount || parseFloat(repaymentAmount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid repayment amount.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the next unpaid repayment
      const { data: repaymentData, error: repaymentError } = await supabase
        .from('loan_repayments')
        .select('id, amount, due_date')
        .eq('loan_id', selectedLoan.id)
        .eq('is_paid', false)
        .order('due_date', { ascending: true })
        .limit(1)
        .single();
        
      if (repaymentError) {
        if (repaymentError.code === 'PGRST116') {
          toast({
            title: "No Pending Repayments",
            description: "This loan has no pending repayments.",
            variant: "destructive"
          });
        } else {
          throw repaymentError;
        }
        return;
      }
      
      // Check if repayment amount is sufficient
      if (parseFloat(repaymentAmount) < repaymentData.amount) {
        toast({
          title: "Insufficient Amount",
          description: `The minimum repayment amount is KSh ${repaymentData.amount.toLocaleString()}`,
          variant: "destructive"
        });
        return;
      }
      
      // Update repayment as paid
      const { error: updateError } = await supabase
        .from('loan_repayments')
        .update({ 
          is_paid: true,
          paid_date: new Date().toISOString(),
          payment_method: 'Cash', // This could be a form input
          transaction_id: `TRANS-${Date.now()}` // This should be from payment processor in real app
        })
        .eq('id', repaymentData.id);
        
      if (updateError) throw updateError;
      
      // Close dialog and reset form
      setIsRepayDialogOpen(false);
      setRepaymentAmount('');
      
      // Check if this was the last repayment
      const { count, error: countError } = await supabase
        .from('loan_repayments')
        .select('id', { count: 'exact', head: true })
        .eq('loan_id', selectedLoan.id)
        .eq('is_paid', false);
        
      if (countError) throw countError;
      
      // If no more repayments, mark loan as completed
      if (count === 0) {
        const { error: loanUpdateError } = await supabase
          .from('loans')
          .update({ 
            status: LoanStatus.COMPLETED,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedLoan.id);
          
        if (loanUpdateError) throw loanUpdateError;
      }
      
      // Refresh loans data
      await fetchLoans();
      
      toast({
        title: "Repayment Successful",
        description: `Payment of KSh ${parseFloat(repaymentAmount).toLocaleString()} has been recorded.`
      });
    } catch (err) {
      console.error('Error making repayment:', err);
      toast({
        title: "Error",
        description: "Failed to process repayment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewLoan = (loan: DbLoan & { clientName: string }) => {
    setSelectedLoan(loan);
    setIsViewDialogOpen(true);
  };
  
  const handleOpenRepayDialog = (loan: DbLoan & { clientName: string }) => {
    setSelectedLoan(loan);
    setIsRepayDialogOpen(true);
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.id.includes(searchQuery) ||
      loan.purpose.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: LoanStatus) => {
    switch(status) {
      case LoanStatus.ACTIVE:
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case LoanStatus.PENDING:
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case LoanStatus.APPROVED:
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case LoanStatus.DISBURSED:
        return 'bg-teal-100 text-teal-700 hover:bg-teal-200';
      case LoanStatus.COMPLETED:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
      case LoanStatus.DEFAULTED:
        return 'bg-rose-100 text-rose-700 hover:bg-rose-200';
      case LoanStatus.REJECTED:
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleNewLoan = () => {
    navigate('/loans/create');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground">Manage loan applications and disbursements</p>
        </div>
        
        <Button onClick={handleNewLoan} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>New Loan</span>
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search loans..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={LoanStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={LoanStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={LoanStatus.DISBURSED}>Disbursed</SelectItem>
                <SelectItem value={LoanStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={LoanStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={LoanStatus.DEFAULTED}>Defaulted</SelectItem>
                <SelectItem value={LoanStatus.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading.loans ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg text-muted-foreground">Loading loans...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setError(null);
                  fetchLoans();
                }}
              >
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No loans found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="font-mono text-xs">#{loan.id.substring(0, 8)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{loan.clientName}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{loan.purpose}</div>
                      </TableCell>
                      <TableCell>{loan.term} months</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(loan.status as LoanStatus)} variant="outline">
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewLoan(loan)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {loan.status === LoanStatus.PENDING && (
                            <Button 
                              size="sm" 
                              onClick={() => approveLoan(loan.id)}
                              disabled={loading.approval}
                            >
                              {loading.approval ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              )}
                              Approve
                            </Button>
                          )}
                          
                          {loan.status === LoanStatus.APPROVED && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => activateLoan(loan.id)}
                              disabled={loading.activation}
                            >
                              {loading.activation ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <PlayCircle className="h-3 w-3 mr-1" />
                              )}
                              Activate
                            </Button>
                          )}
                          
                          {loan.status === LoanStatus.ACTIVE && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenRepayDialog(loan)}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Repay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* View Loan Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loan ID</Label>
                  <p className="font-mono text-sm">#{selectedLoan.id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p>
                    <Badge className={getStatusColor(selectedLoan.status as LoanStatus)} variant="outline">
                      {selectedLoan.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label>Client</Label>
                  <p className="font-medium">{selectedLoan.clientName}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">{formatCurrency(selectedLoan.amount)}</p>
                </div>
                <div>
                  <Label>Interest Rate</Label>
                  <p>{selectedLoan.interest_rate}%</p>
                </div>
                <div>
                  <Label>Term</Label>
                  <p>{selectedLoan.term} months</p>
                </div>
                <div>
                  <Label>Created Date</Label>
                  <p>{formatDate(selectedLoan.created_at)}</p>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <p>{formatDate(selectedLoan.start_date)}</p>
                </div>
                <div>
                  <Label>End Date</Label>
                  <p>{formatDate(selectedLoan.end_date)}</p>
                </div>
                <div>
                  <Label>Approved Date</Label>
                  <p>{formatDate(selectedLoan.approved_at)}</p>
                </div>
                <div className="col-span-2">
                  <Label>Purpose</Label>
                  <p className="text-sm mt-1">{selectedLoan.purpose}</p>
                </div>
              </div>
              
              <DialogFooter>
                {selectedLoan.status === LoanStatus.ACTIVE && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsRepayDialogOpen(true);
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make Repayment
                  </Button>
                )}
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Repayment Dialog */}
      <Dialog open={isRepayDialogOpen} onOpenChange={setIsRepayDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Make Loan Repayment</DialogTitle>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Client</Label>
                <p className="font-medium">{selectedLoan.clientName}</p>
              </div>
              
              <div>
                <Label htmlFor="loanId">Loan ID</Label>
                <p className="font-mono text-sm">#{selectedLoan.id.substring(0, 8)}</p>
              </div>
              
              <div>
                <Label htmlFor="amount" className="text-sm">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter repayment amount"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total loan amount: {formatCurrency(selectedLoan.amount)}
                </p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRepayDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRepayment}>
                  <CreditCard className="h-4 w-4 mr-2" />
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

export default Loans;
