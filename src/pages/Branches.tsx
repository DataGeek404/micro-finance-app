
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BranchStatus } from '@/types/branch';
import { Building2, Users, Phone, Mail, Calendar, MapPin, Plus, Loader2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import EditBranchDialog from '@/components/branches/EditBranchDialog';

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  managerName: z.string().min(1, "Manager name is required"),
  managerId: z.string().min(1, "Manager ID is required").uuid("Manager ID must be a valid UUID format"),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
  openingDate: z.string().min(1, "Opening date is required")
});

type BranchFormValues = z.infer<typeof branchSchema>;

const Branches = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      location: "",
      address: "",
      phone: "",
      email: "",
      managerName: "",
      managerId: "00000000-0000-0000-0000-000000000000",
      status: "PENDING",
      openingDate: format(new Date(), "yyyy-MM-dd")
    },
  });

  const checkAuth = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setAuthError("You must be logged in to view and manage branches");
      return false;
    }
    setAuthError(null);
    return true;
  };

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        fetchBranches();
      } else {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      console.log("Fetching branches...");
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Fetched branches:", data);
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: BranchFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a branch",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting branch data:", values);
      
      const branchData = {
        name: values.name,
        location: values.location,
        address: values.address,
        phone: values.phone,
        email: values.email || null,
        manager_name: values.managerName,
        manager_id: values.managerId,
        status: values.status,
        opening_date: values.openingDate,
        employee_count: 0
      };

      console.log("Formatted branch data for insert:", branchData);

      const { data, error } = await supabase
        .from('branches')
        .insert(branchData)
        .select();
      
      console.log("Insert response:", { data, error });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Branch created successfully",
      });
      
      form.reset();
      setIsDialogOpen(false);
      
      fetchBranches();
    } catch (error: any) {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBranch = (branch: any) => {
    setSelectedBranch(branch);
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: BranchStatus) => {
    switch(status) {
      case BranchStatus.ACTIVE:
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case BranchStatus.INACTIVE:
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case BranchStatus.PENDING:
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  if (authError) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <div className="mb-4 text-red-500">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold">{authError}</h2>
          <p className="mt-2">Please login to view and manage branches.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">Manage your organization's branches</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Add Branch</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
              <DialogDescription>
                Enter the branch details. Manager ID must be a valid UUID format, 
                like 550e8400-e29b-41d4-a716-446655440000.
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
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Branch
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Branches Found</h3>
          <p className="text-muted-foreground mt-2">Start by adding your first branch</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{branch.name}</CardTitle>
                  <Badge className={getStatusColor(branch.status as BranchStatus)} variant="outline">
                    {branch.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {branch.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Manager: {branch.manager_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{branch.email || 'No email'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Opened: {formatDate(branch.opening_date)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{branch.employee_count} employees</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex space-x-2">
                <Button variant="outline" className="w-full" onClick={() => handleEditBranch(branch)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Branch
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedBranch && (
        <EditBranchDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          branch={selectedBranch}
          onSuccess={fetchBranches}
        />
      )}
    </AppLayout>
  );
};

export default Branches;
