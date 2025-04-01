
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Client, ClientStatus } from '@/types/client';
import { Plus, Search, MoreHorizontal, FileEdit, Trash, Eye, Eraser } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { deleteAllClientsExcept, transformClientData, updateClient } from '@/utils/clientUtils';

const clientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  nationalId: z.string().min(1, "National ID is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  occupation: z.string().min(1, "Occupation is required"),
  incomeSource: z.string().min(1, "Income source is required"),
  monthlyIncome: z.coerce.number().min(0, "Monthly income must be positive"),
  branchId: z.string().min(1, "Branch is required"),
  status: z.enum(["ACTIVE", "INACTIVE", "BLACKLISTED", "PENDING"]),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clientData, setClientData] = useState<Client[]>([]);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState<{id: string, name: string}[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const { toast } = useToast();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      nationalId: "",
      dateOfBirth: "",
      gender: "male",
      occupation: "",
      incomeSource: "",
      monthlyIncome: 0,
      branchId: "",
      status: "ACTIVE",
    }
  });

  useEffect(() => {
    async function fetchClients() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        const transformedData = data.map(client => transformClientData(client));
        
        setClientData(transformedData);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Error fetching clients",
          description: "There was a problem fetching client data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchClients();
  }, [toast]);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: "Error fetching branches",
          description: "There was a problem loading branch data",
          variant: "destructive",
        });
      }
    }
    
    fetchBranches();
  }, [toast]);

  // Reset form when opening in add mode
  useEffect(() => {
    if (isDialogOpen && !isEditMode) {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        nationalId: "",
        dateOfBirth: "",
        gender: "male",
        occupation: "",
        incomeSource: "",
        monthlyIncome: 0,
        branchId: "",
      });
    }
  }, [isDialogOpen, isEditMode, form]);

  // Set form values when editing
  useEffect(() => {
    if (isEditMode && currentClient) {
      form.reset({
        firstName: currentClient.firstName,
        lastName: currentClient.lastName,
        email: currentClient.email || "",
        phone: currentClient.phone,
        address: currentClient.address,
        nationalId: currentClient.nationalId,
        dateOfBirth: currentClient.dateOfBirth.toISOString().split('T')[0],
        gender: currentClient.gender,
        occupation: currentClient.occupation,
        incomeSource: currentClient.incomeSource,
        monthlyIncome: currentClient.monthlyIncome,
        branchId: currentClient.branchId,
        status: currentClient.status,
      });
    }
  }, [isEditMode, currentClient, form]);

  const handleDeleteAllExcept = async () => {
    try {
      setIsDeletingAll(true);
      const result = await deleteAllClientsExcept("james analysis");
      
      if (result.success) {
        // Refresh client list
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        const transformedData = data.map(client => transformClientData(client));
        setClientData(transformedData);
        
        toast({
          title: "Clients deleted",
          description: result.message,
        });
      } else {
        toast({
          title: "Error deleting clients",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAll(false);
      setDeleteDialogOpen(false);
    }
  };

  const onSubmit = async (data: ClientFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode && currentClient) {
        // Update existing client
        const updatedClient: Client = {
          ...currentClient,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || undefined,
          phone: data.phone,
          address: data.address,
          nationalId: data.nationalId,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender as 'male' | 'female' | 'other',
          occupation: data.occupation,
          incomeSource: data.incomeSource,
          monthlyIncome: data.monthlyIncome,
          branchId: data.branchId,
          status: data.status as ClientStatus,
        };
        
        const result = await updateClient(updatedClient);
        
        if (result.success && result.data) {
          setClientData(prev => 
            prev.map(client => client.id === result.data!.id ? result.data! : client)
          );
          
          toast({
            title: "Client updated successfully",
            description: `${data.firstName} ${data.lastName}'s information has been updated`,
          });
        } else {
          throw new Error(result.message);
        }
      } else {
        // Add new client
        const newClient = {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email || null,
          phone: data.phone,
          address: data.address,
          national_id: data.nationalId,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          occupation: data.occupation,
          income_source: data.incomeSource,
          monthly_income: data.monthlyIncome,
          branch_id: data.branchId,
          status: 'ACTIVE',
        };
        
        const { data: clientData, error } = await supabase
          .from('clients')
          .insert([newClient])
          .select();
          
        if (error) {
          throw error;
        }
        
        const newClientTransformed = transformClientData(clientData[0]);
        
        setClientData(prev => [newClientTransformed, ...prev]);
        
        toast({
          title: "Client added successfully",
          description: `${data.firstName} ${data.lastName} has been added to the system`,
        });
      }
      
      setIsDialogOpen(false);
      setIsEditMode(false);
      setCurrentClient(null);
      form.reset();
      
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: isEditMode ? "Error updating client" : "Error adding client",
        description: error.message || "There was a problem saving the client data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (client: Client) => {
    setCurrentClient(client);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (clientId: string, clientName: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
        
      if (error) {
        throw error;
      }
      
      setClientData(clientData.filter(client => client.id !== clientId));
      toast({
        title: "Client permanently deleted",
        description: `${clientName} has been completely removed from the system`,
      });
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error deleting client",
        description: error.message || "There was a problem deleting the client",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clientData.filter(client => 
    client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    (client.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: ClientStatus) => {
    switch(status) {
      case ClientStatus.ACTIVE:
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case ClientStatus.INACTIVE:
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case ClientStatus.BLACKLISTED:
        return 'bg-rose-100 text-rose-700 hover:bg-rose-200';
      case ClientStatus.PENDING:
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const dialogTitle = isEditMode ? "Edit Client" : "Add New Client";
  const dialogButtonText = isEditMode ? "Update Client" : "Save Client";
  
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client database</p>
        </div>
        
        <div className="flex gap-2">
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Eraser className="h-4 w-4" />
                <span>Delete All Except James Analysis</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Clients Except James Analysis</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will delete ALL clients except those with name "James Analysis".
                  This cannot be undone. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteAllExcept}
                  disabled={isDeletingAll}
                >
                  {isDeletingAll ? "Deleting..." : "Delete All Except James Analysis"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setIsEditMode(false);
              setCurrentClient(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Client</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
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
                      name="nationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter national ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter occupation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="incomeSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Income Source</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter income source" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="branchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {branches.map(branch => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {isEditMode && (
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
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
                    <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : dialogButtonText}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
              
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading clients...</p>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={client.photo} />
                          <AvatarFallback>
                            {client.firstName.charAt(0)}
                            {client.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{client.firstName} {client.lastName}</p>
                          <p className="text-sm text-muted-foreground">{client.email || 'No email'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>${client.monthlyIncome.toLocaleString()}/month</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(client.status)} variant="outline">
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setViewClient(client)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Client Details</DialogTitle>
                          </DialogHeader>
                          {viewClient && (
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Full Name</h4>
                                <p>{viewClient.firstName} {viewClient.lastName}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">National ID</h4>
                                <p>{viewClient.nationalId}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Email</h4>
                                <p>{viewClient.email || 'N/A'}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Phone</h4>
                                <p>{viewClient.phone}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Address</h4>
                                <p>{viewClient.address}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Gender</h4>
                                <p className="capitalize">{viewClient.gender}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Occupation</h4>
                                <p>{viewClient.occupation}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Monthly Income</h4>
                                <p>${viewClient.monthlyIncome.toLocaleString()}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Income Source</h4>
                                <p>{viewClient.incomeSource}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Status</h4>
                                <Badge className={getStatusColor(viewClient.status)} variant="outline">
                                  {viewClient.status}
                                </Badge>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Date of Birth</h4>
                                <p>{format(viewClient.dateOfBirth, 'PPP')}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Created At</h4>
                                <p>{format(viewClient.createdAt, 'PPP')}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex gap-2" onClick={() => handleEdit(client)}>
                            <FileEdit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="flex gap-2 text-rose-500 focus:text-rose-500"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Permanently Delete Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete {client.firstName} {client.lastName} 
                                  and all associated data from the database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(client.id, `${client.firstName} ${client.lastName}`)}
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Clients;
