
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BranchStatus } from '@/types/branch';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// Validation schema
const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  managerName: z.string().min(1, "Manager name is required"),
  managerId: z.string().min(1, "Manager ID is required").uuid("Manager ID must be a valid UUID format"),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
  openingDate: z.string().min(1, "Opening date is required"),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email?: string | null;
  manager_name: string;
  manager_id: string;
  status: string;
  opening_date: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

interface EditBranchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch;
  onSuccess: () => void;
}

const EditBranchDialog = ({ isOpen, onClose, branch, onSuccess }: EditBranchDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: branch.name,
      location: branch.location,
      address: branch.address,
      phone: branch.phone,
      email: branch.email || "",
      managerName: branch.manager_name,
      managerId: branch.manager_id,
      status: branch.status as "ACTIVE" | "INACTIVE" | "PENDING",
      openingDate: branch.opening_date ? format(new Date(branch.opening_date), "yyyy-MM-dd") : "",
    },
  });

  const handleSubmit = async (values: BranchFormValues) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('branches')
        .update({
          name: values.name,
          location: values.location,
          address: values.address,
          phone: values.phone,
          email: values.email || null,
          manager_name: values.managerName,
          manager_id: values.managerId,
          status: values.status,
          opening_date: values.openingDate,
        })
        .eq('id', branch.id)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Branch updated",
        description: "The branch has been updated successfully",
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating branch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update branch",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
          <DialogDescription>
            Update the branch details. Manager ID must be a valid UUID format.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter branch name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="managerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manager name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager ID (UUID format)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter UUID format manager ID" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="openingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBranchDialog;
