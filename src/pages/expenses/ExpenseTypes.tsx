
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wallet, Plus, Pencil, Trash2 } from 'lucide-react';
import { ExpenseType } from '@/types/expense';

const ExpenseTypes = () => {
  // Mock data for expense types
  const expenseTypes: ExpenseType[] = [
    { 
      id: '1', 
      name: 'Rent', 
      description: 'Office and branch rental expenses', 
      budget: 5000,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    { 
      id: '2', 
      name: 'Utilities', 
      description: 'Electricity, water, internet, etc.', 
      budget: 2000,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-15')
    },
    { 
      id: '3', 
      name: 'Office Supplies', 
      description: 'Stationery, printer ink, etc.', 
      budget: 1500,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-10')
    },
    { 
      id: '4', 
      name: 'Travel', 
      description: 'Business travel expenses', 
      budget: 3000,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    },
    { 
      id: '5', 
      name: 'Marketing', 
      description: 'Advertising and promotional expenses', 
      budget: 4000,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-05')
    },
    { 
      id: '6', 
      name: 'Staff Training', 
      description: 'Training workshops and courses', 
      budget: 2500,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-01')
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Expense Types</h1>
            <p className="text-muted-foreground">Manage expense categories and budgets</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Expense Type</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Type Name</Label>
                  <Input id="name" placeholder="e.g. Office Supplies" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Brief description of this expense type"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Budget (Optional)</Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    placeholder="Enter monthly budget amount" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Set a monthly budget limit for this expense type
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Add Type</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              Expense Types List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Monthly Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{type.description}</div>
                    </TableCell>
                    <TableCell>
                      {type.budget ? `$${type.budget.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ExpenseTypes;
