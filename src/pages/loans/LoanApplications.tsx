
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, FilePlus2, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LoanApplication {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  purpose: string;
  client_id: string;
  product_id: string;
  clients: {
    first_name: string;
    last_name: string;
  };
  loan_products: {
    name: string;
  };
}

const LoanApplications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const queryClient = useQueryClient();

  // Fetch loan applications from Supabase
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['loanApplications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_applications')
        .select(`
          id, 
          amount, 
          status, 
          created_at,
          purpose,
          clients (first_name, last_name),
          loan_products (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LoanApplication[];
    }
  });

  // Mutation for approving a loan application
  const approveMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { data, error } = await supabase
        .from('loan_applications')
        .update({ status: 'APPROVED' })
        .eq('id', applicationId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanApplications'] });
      toast({
        title: "Application Approved",
        description: `Application has been approved successfully.`,
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to approve application: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Mutation for rejecting a loan application
  const rejectMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { data, error } = await supabase
        .from('loan_applications')
        .update({ status: 'REJECTED' })
        .eq('id', applicationId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanApplications'] });
      toast({
        title: "Application Rejected",
        description: `Application has been rejected.`,
        variant: "destructive"
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reject application: ${error}`,
        variant: "destructive"
      });
    }
  });

  const handleNewApplication = () => {
    navigate('/loans/create');
  };

  const handleReviewApplication = (application: LoanApplication) => {
    setSelectedApplication(application);
    setReviewNote('');
    setIsDialogOpen(true);
  };

  const handleApproveApplication = () => {
    if (selectedApplication) {
      approveMutation.mutate(selectedApplication.id);
    }
  };

  const handleRejectApplication = () => {
    if (selectedApplication) {
      rejectMutation.mutate(selectedApplication.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Loan Applications</h1>
            <p className="text-muted-foreground">Review and manage loan applications</p>
          </div>
          <Button onClick={handleNewApplication}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading applications...</span>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                Failed to load applications. Please try again later.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Loan Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications && applications.length > 0 ? (
                    applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-xs">#{app.id.substring(0, 8)}</TableCell>
                        <TableCell className="font-medium">{app.clients?.first_name} {app.clients?.last_name}</TableCell>
                        <TableCell>${app.amount.toLocaleString()}</TableCell>
                        <TableCell>{app.loan_products?.name}</TableCell>
                        <TableCell>{formatDate(app.created_at)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReviewApplication(app)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No loan applications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Application Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Loan Application</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <p className="font-medium">{selectedApplication.clients?.first_name} {selectedApplication.clients?.last_name}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">${selectedApplication.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Product</Label>
                  <p className="font-medium">{selectedApplication.loan_products?.name}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">{formatDate(selectedApplication.created_at)}</p>
                </div>
                <div className="col-span-2">
                  <Label>Purpose</Label>
                  <p className="font-medium">{selectedApplication.purpose}</p>
                </div>
              </div>
              
              {selectedApplication.status === 'PENDING' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input 
                      id="notes" 
                      placeholder="Add your notes about this application" 
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleRejectApplication}
                      disabled={rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        'Reject'
                      )}
                    </Button>
                    <Button 
                      onClick={handleApproveApplication}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        'Approve'
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              )}
              
              {selectedApplication.status !== 'PENDING' && (
                <DialogFooter>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default LoanApplications;
