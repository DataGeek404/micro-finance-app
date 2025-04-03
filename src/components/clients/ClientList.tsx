
import React from 'react';
import { format } from "date-fns";
import { Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

import { Client, ClientStatus } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

type ClientListProps = {
  clients: Client[];
  onDelete: (id: string) => void;
  isLoading: boolean;
};

export const ClientList = ({ clients, onDelete, isLoading }: ClientListProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE:
        return <Badge variant="success" className="bg-green-500">Active</Badge>;
      case ClientStatus.INACTIVE:
        return <Badge variant="outline">Inactive</Badge>;
      case ClientStatus.BLACKLISTED:
        return <Badge variant="destructive">Blacklisted</Badge>;
      case ClientStatus.PENDING:
        return <Badge variant="warning" className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading clients...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-2" />
        <h3 className="text-xl font-medium mb-1">No Clients Found</h3>
        <p>There are no clients in the system yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>ID Number</TableHead>
            <TableHead>Monthly Income</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">
                {client.firstName} {client.lastName}
                <div className="text-xs text-muted-foreground">
                  {client.email || 'No email provided'}
                </div>
              </TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>{client.nationalId}</TableCell>
              <TableCell>{client.monthlyIncome.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(client.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {client.firstName} {client.lastName}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(client.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
