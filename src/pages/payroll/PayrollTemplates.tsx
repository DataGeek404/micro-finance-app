
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeDollarSign, Plus, Copy } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PayrollTemplates = () => {
  // Mock data for payroll templates
  const templates = [
    { 
      id: '1', 
      name: 'Standard Monthly', 
      payItems: 8, 
      payFrequency: 'Monthly',
      active: true 
    },
    { 
      id: '2', 
      name: 'Bi-Weekly', 
      payItems: 6, 
      payFrequency: 'Bi-Weekly',
      active: true 
    },
    { 
      id: '3', 
      name: 'Weekly Staff', 
      payItems: 5, 
      payFrequency: 'Weekly',
      active: false 
    },
    { 
      id: '4', 
      name: 'Contract Workers', 
      payItems: 4, 
      payFrequency: 'Monthly',
      active: true 
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payroll Templates</h1>
            <p className="text-muted-foreground">Manage reusable payroll configurations</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Payroll Template</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" placeholder="e.g. Standard Monthly" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payFrequency">Pay Frequency</Label>
                  <Select>
                    <SelectTrigger id="payFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Brief description of this template" />
                </div>
                <div className="space-y-3 mt-4">
                  <h3 className="font-medium">Select Pay Items</h3>
                  <div className="space-y-2">
                    <Label className="text-sm">Earnings</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="basic-salary" />
                        <Label htmlFor="basic-salary" className="text-sm">Basic Salary</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="housing-allowance" />
                        <Label htmlFor="housing-allowance" className="text-sm">Housing Allowance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="transport-allowance" />
                        <Label htmlFor="transport-allowance" className="text-sm">Transport Allowance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="performance-bonus" />
                        <Label htmlFor="performance-bonus" className="text-sm">Performance Bonus</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label className="text-sm">Deductions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="income-tax" />
                        <Label htmlFor="income-tax" className="text-sm">Income Tax</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="pension" />
                        <Label htmlFor="pension" className="text-sm">Pension Fund</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="health-insurance" />
                        <Label htmlFor="health-insurance" className="text-sm">Health Insurance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="loan-repayment" />
                        <Label htmlFor="loan-repayment" className="text-sm">Loan Repayment</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Create Template</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BadgeDollarSign className="mr-2 h-5 w-5" />
              Payroll Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Pay Items</TableHead>
                  <TableHead>Pay Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.payItems}</TableCell>
                    <TableCell>{template.payFrequency}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {template.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Copy className="h-3 w-3 mr-1" />
                          Clone
                        </Button>
                        <Button variant="outline" size="sm">Edit</Button>
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

export default PayrollTemplates;
