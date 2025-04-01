
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeDollarSign, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const LoanProducts = () => {
  // Mock data for demonstration
  const products = [
    { id: '1', name: 'Business Loan', minAmount: 1000, maxAmount: 50000, minTerm: 3, maxTerm: 36, interestRate: 8.5, active: true },
    { id: '2', name: 'Personal Loan', minAmount: 500, maxAmount: 10000, minTerm: 3, maxTerm: 24, interestRate: 10.5, active: true },
    { id: '3', name: 'Home Loan', minAmount: 5000, maxAmount: 100000, minTerm: 12, maxTerm: 120, interestRate: 7.5, active: true },
    { id: '4', name: 'Emergency Loan', minAmount: 300, maxAmount: 5000, minTerm: 1, maxTerm: 12, interestRate: 12.0, active: false },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Loan Products</h1>
            <p className="text-muted-foreground">Manage loan product offerings and interest rates</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Loan Product</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" placeholder="e.g. Business Loan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input id="interestRate" type="number" step="0.1" placeholder="e.g. 8.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Min Amount</Label>
                  <Input id="minAmount" type="number" placeholder="e.g. 1000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Max Amount</Label>
                  <Input id="maxAmount" type="number" placeholder="e.g. 50000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minTerm">Min Term (months)</Label>
                  <Input id="minTerm" type="number" placeholder="e.g. 3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTerm">Max Term (months)</Label>
                  <Input id="maxTerm" type="number" placeholder="e.g. 36" />
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Switch id="active" defaultChecked />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BadgeDollarSign className="mr-2 h-5 w-5" />
              Available Loan Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount Range</TableHead>
                  <TableHead>Term Range</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{product.minTerm} - {product.maxTerm} months</TableCell>
                    <TableCell>{product.interestRate}%</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
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

export default LoanProducts;
