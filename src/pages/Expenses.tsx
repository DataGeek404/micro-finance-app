
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, Pencil, Trash, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Expense {
  id: string;
  description: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

const Expenses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock data for demonstration
  const [expenses, setExpenses] = useState<Expense[]>([
    { 
      id: '1', 
      description: 'Office Rent', 
      type: 'Rent', 
      amount: 2000, 
      date: '2024-03-01', 
      status: 'PAID' 
    },
    { 
      id: '2', 
      description: 'Utility Bills', 
      type: 'Utilities', 
      amount: 450, 
      date: '2024-03-10', 
      status: 'PAID' 
    },
    { 
      id: '3', 
      description: 'Office Supplies', 
      type: 'Supplies', 
      amount: 320, 
      date: '2024-03-15', 
      status: 'PENDING' 
    },
    { 
      id: '4', 
      description: 'Staff Training', 
      type: 'Training', 
      amount: 1500, 
      date: '2024-03-22', 
      status: 'APPROVED' 
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState({
    description: '',
    type: '',
    amount: 0,
    date: '',
    status: ''
  });

  // Filter expenses based on search
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    expense.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open edit dialog with expense data
  const handleEditClick = (expense: Expense) => {
    setCurrentExpense(expense);
    setEditForm({
      description: expense.description,
      type: expense.type,
      amount: expense.amount,
      date: expense.date,
      status: expense.status
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit form changes
  const handleEditFormChange = (field: string, value: string | number) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  // Save edited expense
  const handleSaveEdit = () => {
    if (!currentExpense) return;
    
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === currentExpense.id) {
        return {
          ...expense,
          description: editForm.description,
          type: editForm.type,
          amount: Number(editForm.amount),
          date: editForm.date,
          status: editForm.status
        };
      }
      return expense;
    });
    
    setExpenses(updatedExpenses);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Expense Updated",
      description: "The expense has been successfully updated.",
    });
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  // Delete expense
  const handleConfirmDelete = () => {
    if (!currentExpense) return;
    
    setExpenses(expenses.filter(expense => expense.id !== currentExpense.id));
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Expense Deleted",
      description: "The expense has been successfully deleted.",
      variant: "destructive"
    });
  };

  // Create new expense
  const handleCreateExpense = () => {
    navigate('/expenses/create');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">Manage your organization's expenses</p>
          </div>
          <div>
            <Button onClick={handleCreateExpense}>
              <Plus className="mr-2 h-4 w-4" />
              Create Expense
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              Expenses List
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>{expense.type}</TableCell>
                        <TableCell>${expense.amount.toLocaleString()}</TableCell>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditClick(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteClick(expense)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Make changes to the expense details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  value={editForm.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input 
                  id="type" 
                  value={editForm.type}
                  onChange={(e) => handleEditFormChange('type', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => handleEditFormChange('amount', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={editForm.date}
                  onChange={(e) => handleEditFormChange('date', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={editForm.status}
                onValueChange={(value) => handleEditFormChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">PAID</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="APPROVED">APPROVED</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Expenses;
