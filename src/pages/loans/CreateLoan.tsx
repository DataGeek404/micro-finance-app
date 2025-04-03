
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';

const CreateLoan = () => {
  const { toast } = useToast();
  
  // Fetch branches from Supabase
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Branch[];
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Loan Created",
      description: "The loan has been successfully created."
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Loan</h1>
          <p className="text-muted-foreground">Create a new loan for a client</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">1. Client Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client">Select Client</Label>
                    <Select>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">John Doe</SelectItem>
                        <SelectItem value="2">Jane Smith</SelectItem>
                        <SelectItem value="3">Mike Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">2. Loan Product</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="loanProduct">Loan Product</Label>
                    <Select>
                      <SelectTrigger id="loanProduct">
                        <SelectValue placeholder="Select loan product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Business Loan</SelectItem>
                        <SelectItem value="2">Personal Loan</SelectItem>
                        <SelectItem value="3">Home Loan</SelectItem>
                        <SelectItem value="4">Emergency Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select disabled={branchesLoading}>
                      <SelectTrigger id="branch">
                        {branchesLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Loading branches...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Select branch" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {branches?.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">3. Loan Terms</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Loan Amount</Label>
                    <Input id="amount" type="number" placeholder="Enter amount" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interest">Interest Rate (%)</Label>
                    <Input id="interest" type="number" placeholder="e.g. 8.5" step="0.1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Term (months)</Label>
                    <Input id="term" type="number" placeholder="e.g. 12" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">4. Additional Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Loan Purpose</Label>
                    <Textarea id="purpose" placeholder="Describe the purpose of this loan" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-6 flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button type="submit">Create Loan</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateLoan;
