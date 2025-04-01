
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockClients } from '@/data/mockData';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Client, ClientStatus } from '@/types/client';
import { Plus, Search, MoreHorizontal, FileEdit, Trash, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

// Client form validation schema
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
  const { toast } = useToast();

  // Setup form with react-hook-form and zod validation
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
    }
  });

  // Fetch clients from Supabase
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
        
        // Transform Supabase data to match Client type
        const transformedData = data.map((client): Client => ({
          id: client.id,
          firstName: client.first_name,
          lastName: client.last_name,
          email: client.email || undefined,
          phone: client.phone,
          address: client.address,
          nationalId: client.national_id,
          dateOfBirth: new Date(client.date_of_birth),
          gender: client.gender as 'male' | 'female' | 'other',
          occupation: client.occupation,
          incomeSource: client.income_source,
          monthlyIncome: Number(client.monthly_income),
          branchId: client.branch_id,
          createdAt: new Date(client.created_at),
          updatedAt: new Date(client.updated_at),
          status: client.status as ClientStatus,
          photo: client.photo || undefined,
        }));
        
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

  // Fetch branches for the dropdown
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

  const onSubmit = async (data: ClientFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Format data for Supabase
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
      
      // Transform the new client to match Client type
      const newClientTransformed: Client = {
        id: clientData[0].id,
        firstName: clientData[0].first_name,
        lastName: clientData[0].last_name,
        email: clientData[0].email || undefined,
        phone: clientData[0].phone,
        address: clientData[0].address,
        nationalId: clientData[0].national_id,
        dateOfBirth: new Date(clientData[0].date_of_birth),
        gender: clientData[0].gender as 'male' | 'female' | 'other',
        occupation: clientData[0].occupation,
        incomeSource: clientData[0].income_source,
        monthlyIncome: Number(clientData[0].monthly_income),
        branchId: clientData[0].branch_id,
        createdAt: new Date(clientData[0].created_at),
        updatedAt: new Date(clientData[0].updated_at),
        status: clientData[0].status as ClientStatus,
        photo: clientData[0].photo || undefined,
      };
      
      // Update the client list with the new client
      setClientData(prev => [newClientTransformed, ...prev]);
      
      toast({
        title: "Client added successfully",
        description: `${data.firstName} ${data.lastName} has been added to the system`,
      });
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      form.reset();
      
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast({
        title: "Error adding client",
        description: error.message || "There was a problem adding the client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (clientId: string) => {
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
        title: "Client deleted",
        description: "The client has been removed from the system",
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

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client database</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
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
                    {isSubmitting ? "Saving..." : "Save Client"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
            
          </DialogContent>
        </Dialog>
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
                          <DropdownMenuItem className="flex gap-2">
                            <FileEdit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex gap-2 text-rose-500 focus:text-rose-500"
                            onClick={() => handleDelete(client.id)}
                          >
                            <Trash className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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
