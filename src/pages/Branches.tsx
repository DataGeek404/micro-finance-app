
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditBranchDialog from '@/components/branches/EditBranchDialog';
import AppLayout from '@/components/layout/AppLayout';

const Branches = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  
  // Fetch branches
  const { data: branches, isLoading } = useQuery({
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
  
  // Delete branch mutation
  const deleteBranch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['branches']
      });
      toast({
        title: "Branch Deleted",
        description: "The branch has been removed successfully."
      });
    },
    onError: (error) => {
      console.error('Error deleting branch:', error);
      toast({
        title: "Delete Failed",
        description: "There was a problem deleting the branch. It may be referenced by other records.",
        variant: "destructive"
      });
    }
  });
  
  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
  };
  
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete branch "${name}"?`)) {
      deleteBranch.mutate(id);
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
        <p className="text-muted-foreground">Manage your organization's branches</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Branch List</CardTitle>
              <CardDescription>View and manage all branches</CardDescription>
            </div>
            <Button>Add New Branch</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No branches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    branches?.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.location}</TableCell>
                        <TableCell>{branch.manager_name}</TableCell>
                        <TableCell>{branch.phone}</TableCell>
                        <TableCell>{branch.status}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(branch)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(branch.id, branch.name)}
                              disabled={deleteBranch.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {editingBranch && (
        <EditBranchDialog
          branch={editingBranch}
          isOpen={!!editingBranch}
          onClose={() => setEditingBranch(null)}
        />
      )}
    </AppLayout>
  );
};

export default Branches;
