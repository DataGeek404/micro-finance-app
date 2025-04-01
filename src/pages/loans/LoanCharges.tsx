
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BadgeDollarSign, Plus, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LoanCharges = () => {
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCharge, setCurrentCharge] = useState<any>(null);

  // Mock data for demonstration
  const [charges, setCharges] = useState([
    { id: '1', name: 'Application Fee', type: 'FIXED', amount: 50, active: true, description: 'One-time fee applied at loan application' },
    { id: '2', name: 'Insurance Fee', type: 'PERCENTAGE', amount: 1.5, active: true, description: 'Insurance coverage for the loan amount' },
    { id: '3', name: 'Late Payment Fee', type: 'FIXED', amount: 25, active: true, description: 'Fee applied for late payments' },
    { id: '4', name: 'Processing Fee', type: 'PERCENTAGE', amount: 2.0, active: true, description: 'Fee for processing the loan' },
  ]);

  const handleOpenEdit = (charge: any) => {
    setCurrentCharge(charge);
    setIsEditMode(true);
  };

  const handleDialogClose = () => {
    setCurrentCharge(null);
    setIsEditMode(false);
  };

  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    // In a real app you would validate and send this to your backend
    const newCharge = {
      id: Math.random().toString(36).substring(7),
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      type: (form.elements.namedItem('type') as HTMLSelectElement).value,
      amount: parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value),
      description: (form.elements.namedItem('description') as HTMLInputElement).value,
      active: true,
    };
    
    setCharges([...charges, newCharge]);
    form.reset();
    handleDialogClose();
    
    toast({
      title: "Charge Added",
      description: `${newCharge.name} has been added successfully.`
    });
  };

  const handleUpdateCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const updatedCharges = charges.map(charge => {
      if (charge.id === currentCharge.id) {
        return {
          ...charge,
          name: (form.elements.namedItem('name') as HTMLInputElement).value,
          type: (form.elements.namedItem('type') as HTMLSelectElement).value,
          amount: parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value),
          description: (form.elements.namedItem('description') as HTMLInputElement).value,
        };
      }
      return charge;
    });
    
    setCharges(updatedCharges);
    handleDialogClose();
    
    toast({
      title: "Charge Updated",
      description: `The charge has been updated successfully.`
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Loan Charges</h1>
            <p className="text-muted-foreground">Manage fees and charges associated with loans</p>
          </div>
          
          <Dialog open={isEditMode || currentCharge !== null} onOpenChange={open => !open && handleDialogClose()}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Charge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Charge' : 'Add New Charge'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={isEditMode ? handleUpdateCharge : handleAddCharge}>
                <div className="grid grid-cols-1 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Charge Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="e.g. Application Fee" 
                      defaultValue={currentCharge?.name || ''}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Charge Type</Label>
                    <Select name="type" defaultValue={currentCharge?.type || ''}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        <SelectItem value="PERCENTAGE">Percentage of Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input 
                      id="amount" 
                      name="amount"
                      type="number" 
                      step="0.01" 
                      placeholder="Enter amount or percentage" 
                      defaultValue={currentCharge?.amount || ''}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description" 
                      name="description"
                      placeholder="Brief description of this charge" 
                      defaultValue={currentCharge?.description || ''}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={handleDialogClose}>Cancel</Button>
                  <Button type="submit">{isEditMode ? 'Update' : 'Add'} Charge</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BadgeDollarSign className="mr-2 h-5 w-5" />
              Loan Charges List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell className="font-medium">{charge.name}</TableCell>
                      <TableCell>{charge.type}</TableCell>
                      <TableCell>
                        {charge.type === 'PERCENTAGE' ? `${charge.amount}%` : `$${charge.amount.toFixed(2)}`}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                        {charge.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${charge.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {charge.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenEdit(charge)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LoanCharges;
