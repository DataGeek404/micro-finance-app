
import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

// Define types for DB data
interface DbClient {
  id: string;
  first_name: string;
  last_name: string;
}

interface DbLoanProduct {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_term: number;
  max_term: number;
  interest_rate: number;
}

interface DbBranch {
  id: string;
  name: string;
}

interface LoanFormData {
  clientId: string;
  productId: string;
  branchId: string;
  amount: number | '';
  interestRate: number | '';
  term: number | '';
  purpose: string;
}

const CreateLoan = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<LoanFormData>({
    clientId: '',
    productId: '',
    branchId: '',
    amount: '',
    interestRate: '',
    term: '',
    purpose: ''
  });

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<DbLoanProduct | null>(null);

  // Fetch clients
  const { 
    data: clients, 
    isLoading: isLoadingClients,
    error: clientsError
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      return data as DbClient[];
    }
  });

  // Fetch loan products
  const { 
    data: loanProducts, 
    isLoading: isLoadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['loanProducts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_products')
        .select('*')
        .eq('status', 'ACTIVE');
      
      if (error) throw error;
      return data as DbLoanProduct[];
    }
  });

  // Fetch branches
  const { 
    data: branches, 
    isLoading: isLoadingBranches,
    error: branchesError
  } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name');
      
      if (error) throw error;
      return data as DbBranch[];
    }
  });

  // Create loan mutation
  const createLoanMutation = useMutation({
    mutationFn: async (loanData: LoanFormData) => {
      const { data, error } = await supabase
        .from('loans')
        .insert([{
          client_id: loanData.clientId,
          product_id: loanData.productId,
          branch_id: loanData.branchId,
          amount: loanData.amount,
          interest_rate: loanData.interestRate,
          term: loanData.term,
          purpose: loanData.purpose,
          status: 'PENDING'
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Loan Created",
        description: "The loan has been successfully created."
      });
      navigate('/loans');
    },
    onError: (error) => {
      console.error('Error creating loan:', error);
      toast({
        title: "Error",
        description: "Failed to create loan. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update form data
  const handleChange = (field: keyof LoanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle product selection
  useEffect(() => {
    if (!formData.productId || !loanProducts) return;
    
    const product = loanProducts.find(p => p.id === formData.productId);
    if (product) {
      setSelectedProduct(product);
      handleChange('interestRate', product.interest_rate);
    }
  }, [formData.productId, loanProducts]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.clientId) {
      toast({ title: "Error", description: "Please select a client", variant: "destructive" });
      return;
    }
    
    if (!formData.productId) {
      toast({ title: "Error", description: "Please select a loan product", variant: "destructive" });
      return;
    }
    
    if (!formData.branchId) {
      toast({ title: "Error", description: "Please select a branch", variant: "destructive" });
      return;
    }

    if (!formData.amount) {
      toast({ title: "Error", description: "Please enter a loan amount", variant: "destructive" });
      return;
    }
    
    if (selectedProduct) {
      if (Number(formData.amount) < selectedProduct.min_amount || 
          Number(formData.amount) > selectedProduct.max_amount) {
        toast({ 
          title: "Invalid Amount", 
          description: `Amount must be between ${selectedProduct.min_amount} and ${selectedProduct.max_amount}`,
          variant: "destructive"
        });
        return;
      }
      
      if (Number(formData.term) < selectedProduct.min_term || 
          Number(formData.term) > selectedProduct.max_term) {
        toast({ 
          title: "Invalid Term", 
          description: `Term must be between ${selectedProduct.min_term} and ${selectedProduct.max_term} months`,
          variant: "destructive"
        });
        return;
      }
    }
    
    createLoanMutation.mutate(formData as LoanFormData);
  };

  const isLoading = isLoadingClients || isLoadingProducts || isLoadingBranches;
  const hasError = clientsError || productsError || branchesError;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Loan</h1>
          <p className="text-muted-foreground">Create a new loan for a client</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading loan data...</span>
          </div>
        ) : hasError ? (
          <div className="p-8 text-center">
            <p className="text-destructive mb-4">Failed to load required data. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        ) : (
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
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client">Select Client</Label>
                      <Select
                        value={formData.clientId}
                        onValueChange={(value) => handleChange('clientId', value)}
                      >
                        <SelectTrigger id="client">
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
                      <Label htmlFor="loanProduct">Loan Product</Label>
                      <Select
                        value={formData.productId}
                        onValueChange={(value) => handleChange('productId', value)}
                      >
                        <SelectTrigger id="loanProduct">
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
                      {selectedProduct && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Amount: {selectedProduct.min_amount} - {selectedProduct.max_amount}, 
                          Term: {selectedProduct.min_term} - {selectedProduct.max_term} months
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Select
                        value={formData.branchId}
                        onValueChange={(value) => handleChange('branchId', value)}
                      >
                        <SelectTrigger id="branch">
                          <SelectValue placeholder="Select branch" />
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
                        type="number" 
                        placeholder="Enter amount"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', e.target.valueAsNumber || '')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interest">Interest Rate (%)</Label>
                      <Input 
                        id="interest" 
                        type="number" 
                        placeholder="e.g. 8.5" 
                        step="0.1"
                        value={formData.interestRate}
                        onChange={(e) => handleChange('interestRate', e.target.valueAsNumber || '')}
                        disabled={!!selectedProduct}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="term">Term (months)</Label>
                      <Input 
                        id="term" 
                        type="number" 
                        placeholder="e.g. 12"
                        value={formData.term}
                        onChange={(e) => handleChange('term', e.target.valueAsNumber || '')}
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
                        placeholder="Describe the purpose of this loan"
                        value={formData.purpose}
                        onChange={(e) => handleChange('purpose', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
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
                  disabled={createLoanMutation.isPending}
                >
                  {createLoanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Loan'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default CreateLoan;
