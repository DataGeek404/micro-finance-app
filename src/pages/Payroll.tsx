
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
import { BadgeDollarSign, Plus } from 'lucide-react';

const Payroll = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const payrolls = [
    { 
      id: '1', 
      name: 'January 2024 Payroll', 
      period: 'Jan 2024', 
      totalAmount: 25000, 
      status: 'PAID', 
      date: '2024-01-31' 
    },
    { 
      id: '2', 
      name: 'February 2024 Payroll', 
      period: 'Feb 2024', 
      totalAmount: 27500, 
      status: 'PAID', 
      date: '2024-02-28' 
    },
    { 
      id: '3', 
      name: 'March 2024 Payroll', 
      period: 'Mar 2024', 
      totalAmount: 26800, 
      status: 'PENDING', 
      date: '2024-03-31' 
    },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payroll</h1>
            <p className="text-muted-foreground">Manage employee salaries and compensation</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/payroll/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Payroll
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BadgeDollarSign className="mr-2 h-5 w-5" />
              Payroll History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">{payroll.name}</TableCell>
                    <TableCell>{payroll.period}</TableCell>
                    <TableCell>${payroll.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payroll.status)}`}>
                        {payroll.status}
                      </span>
                    </TableCell>
                    <TableCell>{payroll.date}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/payroll/${payroll.id}`)}
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

export default Payroll;
