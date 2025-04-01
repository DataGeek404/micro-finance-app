
import React, { useState } from 'react';
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

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clientData, setClientData] = useState(mockClients);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const { toast } = useToast();

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

  const handleDelete = (clientId: string) => {
    setClientData(clientData.filter(client => client.id !== clientId));
    toast({
      title: "Client deleted",
      description: "The client has been removed from the system",
    });
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client database</p>
        </div>
        
        <Dialog>
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
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input id="nationalId" placeholder="Enter national ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" placeholder="Enter occupation" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Enter address" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save Client</Button>
            </DialogFooter>
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
              {filteredClients.length === 0 ? (
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
