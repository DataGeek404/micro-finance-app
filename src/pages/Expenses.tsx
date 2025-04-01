
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus } from 'lucide-react';

const Expenses = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const expenses = [
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
  ];

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">Manage your organization's expenses</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/expenses/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Expense
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                {expenses.map((expense) => (
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/expenses/${expense.id}`)}
                      >
                        View
                      </Button>
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

export default Expenses;
