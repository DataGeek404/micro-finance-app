
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, FilePlus2 } from 'lucide-react';
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

const LoanApplications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  // Mock data for demonstration
  const applications = [
    { id: '1', client: 'John Doe', amount: 5000, product: 'Business Loan', status: 'PENDING', date: '2024-04-05' },
    { id: '2', client: 'Jane Smith', amount: 3000, product: 'Personal Loan', status: 'APPROVED', date: '2024-04-03' },
    { id: '3', client: 'Mike Johnson', amount: 10000, product: 'Home Loan', status: 'REJECTED', date: '2024-04-01' },
    { id: '4', client: 'Sara Williams', amount: 2000, product: 'Emergency Loan', status: 'PENDING', date: '2024-04-04' },
  ];

  // Mock loan products for the new application form
  const loanProducts = [
    { id: '1', name: 'Business Loan' },
    { id: '2', name: 'Personal Loan' },
    { id: '3', name: 'Home Loan' },
    { id: '4', name: 'Emergency Loan' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewApplication = () => {
    navigate('/loans/create');
  };

  const handleReviewApplication = (application: any) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleApproveApplication = () => {
    toast({
      title: "Application Approved",
      description: `Application #${selectedApplication.id} has been approved successfully.`,
    });
    setIsDialogOpen(false);
  };

  const handleRejectApplication = () => {
    toast({
      title: "Application Rejected",
      description: `Application #${selectedApplication.id} has been rejected.`,
      variant: "destructive"
    });
    setIsDialogOpen(false);
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
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs">#{app.id}</TableCell>
                    <TableCell className="font-medium">{app.client}</TableCell>
                    <TableCell>${app.amount.toLocaleString()}</TableCell>
                    <TableCell>{app.product}</TableCell>
                    <TableCell>{app.date}</TableCell>
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
                ))}
              </TableBody>
            </Table>
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
                  <p className="font-medium">{selectedApplication.client}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">${selectedApplication.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Product</Label>
                  <p className="font-medium">{selectedApplication.product}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">{selectedApplication.date}</p>
                </div>
              </div>
              
              {selectedApplication.status === 'PENDING' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" placeholder="Add your notes about this application" />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleRejectApplication}>
                      Reject
                    </Button>
                    <Button onClick={handleApproveApplication}>
                      Approve
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
