
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface LoanProduct {
  id: string;
  name: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  term_min_months: number;
  term_max_months: number;
}

interface LoanFormData {
  client_id: string;
  loan_product_id: string;
  branch_id: string;
  amount: number;
  interest_rate: number;
  term_months: number;
  purpose: string;
}

const CreateLoan = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoanFormData>({
    client_id: '',
    loan_product_id: '',
    branch_id: '',
    amount: 0,
    interest_rate: 0,
    term_months: 0,
    purpose: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Fetch clients from Supabase
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email')
        .order('last_name');
      
      if (error) throw error;
      return data as Client[];
    }
  });

  // Fetch loan products from Supabase
  const { data: loanProducts, isLoading: loanProductsLoading } = useQuery({
    queryKey: ['loan_products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as LoanProduct[];
    }
  });

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'purpose' ? value : Number(value) || value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If loan product changed, update interest rate
    if (name === 'loan_product_id' && loanProducts) {
      const selectedProduct = loanProducts.find(product => product.id === value);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          interest_rate: selectedProduct.interest_rate,
          term_months: selectedProduct.term_min_months
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.client_id) {
        throw new Error('Please select a client');
      }
      if (!formData.loan_product_id) {
        throw new Error('Please select a loan product');
      }
      if (!formData.branch_id) {
        throw new Error('Please select a branch');
      }
      if (!formData.amount || formData.amount <= 0) {
        throw new Error('Please enter a valid loan amount');
      }
      if (!formData.interest_rate || formData.interest_rate <= 0) {
        throw new Error('Please enter a valid interest rate');
      }
      if (!formData.term_months || formData.term_months <= 0) {
        throw new Error('Please enter a valid term in months');
      }

      // Create loan application
      const { data: loanData, error: loanError } = await supabase
        .from('loan_applications')
        .insert([
          {
            client_id: formData.client_id,
            loan_product_id: formData.loan_product_id,
            branch_id: formData.branch_id,
            amount: formData.amount,
            interest_rate: formData.interest_rate,
            term_months: formData.term_months,
            purpose: formData.purpose,
            status: 'PENDING'
          }
        ])
        .select();

      if (loanError) throw loanError;

      toast({
        title: "Loan Application Created",
        description: "The loan application has been successfully created."
      });

      // Navigate to loans list
      navigate('/loans');
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create loan",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = branchesLoading || clientsLoading || loanProductsLoading;

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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">1. Client Information</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="client_id">Select Client</Label>
                        <Select 
                          value={formData.client_id} 
                          onValueChange={(value) => handleSelectChange('client_id', value)}
                        >
                          <SelectTrigger id="client_id">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.first_name} {client.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">2. Loan Product</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="loan_product_id">Loan Product</Label>
                        <Select 
                          value={formData.loan_product_id}
                          onValueChange={(value) => handleSelectChange('loan_product_id', value)}
                        >
                          <SelectTrigger id="loan_product_id">
                            <SelectValue placeholder="Select loan product" />
                          </SelectTrigger>
                          <SelectContent>
                            {loanProducts?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch_id">Branch</Label>
                        <Select 
                          value={formData.branch_id}
                          onValueChange={(value) => handleSelectChange('branch_id', value)}
                          disabled={branchesLoading}
                        >
                          <SelectTrigger id="branch_id">
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
                        <Input 
                          id="amount" 
                          name="amount"
                          type="number" 
                          placeholder="Enter amount" 
                          value={formData.amount || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                        <Input 
                          id="interest_rate" 
                          name="interest_rate"
                          type="number" 
                          placeholder="e.g. 8.5" 
                          step="0.1" 
                          value={formData.interest_rate || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="term_months">Term (months)</Label>
                        <Input 
                          id="term_months" 
                          name="term_months"
                          type="number" 
                          placeholder="e.g. 12" 
                          value={formData.term_months || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">4. Additional Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="purpose">Loan Purpose</Label>
                        <Textarea 
                          id="purpose" 
                          name="purpose"
                          placeholder="Describe the purpose of this loan" 
                          value={formData.purpose}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-6 flex justify-between">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => navigate('/loans')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : "Create Loan"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateLoan;
