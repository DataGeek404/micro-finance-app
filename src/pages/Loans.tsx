
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockLoans, mockClients } from '@/data/mockData';
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
import { Plus, Search, FileText, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Loans = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Combine client names with loans for display
  const loansWithClientNames = mockLoans.map(loan => {
    const client = mockClients.find(c => c.id === loan.clientId);
    return {
      ...loan,
      clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'
    };
  });

  const filteredLoans = loansWithClientNames.filter(loan => {
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

  const approveLoan = (loanId: string) => {
    toast({
      title: "Loan Approved",
      description: `Loan #${loanId} has been approved successfully.`
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground">Manage loan applications and disbursements</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>New Loan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Loan</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount</Label>
                <Input id="amount" type="number" placeholder="Enter amount" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input id="interestRate" type="number" placeholder="Enter interest rate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term (months)</Label>
                <Input id="term" type="number" placeholder="Enter loan term" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="purpose">Loan Purpose</Label>
                <Input id="purpose" placeholder="Enter loan purpose" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Loan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                      <div className="font-mono text-xs">#{loan.id}</div>
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
                      <Badge className={getStatusColor(loan.status)} variant="outline">
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                        
                        {loan.status === LoanStatus.PENDING && (
                          <Button size="sm" onClick={() => approveLoan(loan.id)}>
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Loans;
