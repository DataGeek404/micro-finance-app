
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeDollarSign, Plus, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_term: number;
  max_term: number;
  interest_rate: number;
  interest_type: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  minAmount: number | '';
  maxAmount: number | '';
  minTerm: number | '';
  maxTerm: number | '';
  interestRate: number | '';
  interestType: string;
  active: boolean;
}

const LoanProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    minTerm: '',
    maxTerm: '',
    interestRate: '',
    interestType: 'FLAT',
    active: true
  });

  // Fetch loan products from Supabase
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['loanProducts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_products')
        .select('*');
      
      if (error) throw error;
      return data as LoanProduct[];
    }
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: Omit<ProductFormData, 'id'>) => {
      const { data, error } = await supabase
        .from('loan_products')
        .insert({
          name: productData.name,
          description: productData.description || '',
          min_amount: productData.minAmount as number,
          max_amount: productData.maxAmount as number,
          min_term: productData.minTerm as number,
          max_term: productData.maxTerm as number,
          interest_rate: productData.interestRate as number,
          interest_type: productData.interestType,
          status: productData.active ? 'ACTIVE' : 'INACTIVE'
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanProducts'] });
      toast({
        title: "Product Added",
        description: "Loan product has been added successfully."
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add product: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { data, error } = await supabase
        .from('loan_products')
        .update({
          name: productData.name,
          description: productData.description || '',
          min_amount: productData.minAmount as number,
          max_amount: productData.maxAmount as number,
          min_term: productData.minTerm as number,
          max_term: productData.maxTerm as number,
          interest_rate: productData.interestRate as number,
          interest_type: productData.interestType,
          status: productData.active ? 'ACTIVE' : 'INACTIVE'
        })
        .eq('id', productData.id as string)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanProducts'] });
      toast({
        title: "Product Updated",
        description: "Loan product has been updated successfully."
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error}`,
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      minAmount: '',
      maxAmount: '',
      minTerm: '',
      maxTerm: '',
      interestRate: '',
      interestType: 'FLAT',
      active: true
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || 
        formData.minAmount === '' || 
        formData.maxAmount === '' || 
        formData.minTerm === '' || 
        formData.maxTerm === '' || 
        formData.interestRate === '') {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    addProductMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || 
        formData.minAmount === '' || 
        formData.maxAmount === '' || 
        formData.minTerm === '' || 
        formData.maxTerm === '' || 
        formData.interestRate === '') {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    updateProductMutation.mutate(formData);
  };

  const handleEditClick = (product: LoanProduct) => {
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description || '',
      minAmount: product.min_amount,
      maxAmount: product.max_amount,
      minTerm: product.min_term,
      maxTerm: product.max_term,
      interestRate: product.interest_rate,
      interestType: product.interest_type,
      active: product.status === 'ACTIVE'
    });
    setIsEditDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Loan Products</h1>
            <p className="text-muted-foreground">Manage loan product offerings and interest rates</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Loan Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Business Loan" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input 
                      id="interestRate" 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g. 8.5" 
                      value={formData.interestRate}
                      onChange={(e) => handleInputChange('interestRate', e.target.valueAsNumber || '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Min Amount</Label>
                    <Input 
                      id="minAmount" 
                      type="number" 
                      placeholder="e.g. 1000" 
                      value={formData.minAmount}
                      onChange={(e) => handleInputChange('minAmount', e.target.valueAsNumber || '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Max Amount</Label>
                    <Input 
                      id="maxAmount" 
                      type="number" 
                      placeholder="e.g. 50000" 
                      value={formData.maxAmount}
                      onChange={(e) => handleInputChange('maxAmount', e.target.valueAsNumber || '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minTerm">Min Term (months)</Label>
                    <Input 
                      id="minTerm" 
                      type="number" 
                      placeholder="e.g. 3" 
                      value={formData.minTerm}
                      onChange={(e) => handleInputChange('minTerm', e.target.valueAsNumber || '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTerm">Max Term (months)</Label>
                    <Input 
                      id="maxTerm" 
                      type="number" 
                      placeholder="e.g. 36" 
                      value={formData.maxTerm}
                      onChange={(e) => handleInputChange('maxTerm', e.target.valueAsNumber || '')}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch 
                      id="active" 
                      checked={formData.active}
                      onCheckedChange={(checked) => handleInputChange('active', checked)}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addProductMutation.isPending}>
                    {addProductMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Product'
                    )}
                  </Button>
                </DialogFooter>
              </form>
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
            {isLoading ? (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : error ? (
              <div className="text-center p-10 text-red-500">
                Failed to load loan products. Please try again later.
              </div>
            ) : (
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
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          ${product.min_amount.toLocaleString()} - ${product.max_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{product.min_term} - {product.max_term} months</TableCell>
                        <TableCell>{product.interest_rate}%</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {product.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClick(product)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No loan products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Loan Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input 
                  id="edit-name" 
                  placeholder="e.g. Business Loan" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-interestRate">Interest Rate (%)</Label>
                <Input 
                  id="edit-interestRate" 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g. 8.5" 
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.valueAsNumber || '')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minAmount">Min Amount</Label>
                <Input 
                  id="edit-minAmount" 
                  type="number" 
                  placeholder="e.g. 1000" 
                  value={formData.minAmount}
                  onChange={(e) => handleInputChange('minAmount', e.target.valueAsNumber || '')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxAmount">Max Amount</Label>
                <Input 
                  id="edit-maxAmount" 
                  type="number" 
                  placeholder="e.g. 50000" 
                  value={formData.maxAmount}
                  onChange={(e) => handleInputChange('maxAmount', e.target.valueAsNumber || '')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minTerm">Min Term (months)</Label>
                <Input 
                  id="edit-minTerm" 
                  type="number" 
                  placeholder="e.g. 3" 
                  value={formData.minTerm}
                  onChange={(e) => handleInputChange('minTerm', e.target.valueAsNumber || '')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxTerm">Max Term (months)</Label>
                <Input 
                  id="edit-maxTerm" 
                  type="number" 
                  placeholder="e.g. 36" 
                  value={formData.maxTerm}
                  onChange={(e) => handleInputChange('maxTerm', e.target.valueAsNumber || '')}
                />
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <Switch 
                  id="edit-active" 
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default LoanProducts;
