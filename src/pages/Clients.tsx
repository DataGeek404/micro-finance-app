
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, RefreshCw, Users } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientList } from '@/components/clients/ClientList';
import { fetchClients, deleteClient } from '@/utils/clientUtils';
import { Client } from '@/types/client';
import { toast } from '@/hooks/use-toast';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadClients = async () => {
    setIsLoading(true);
    const result = await fetchClients();
    setIsLoading(false);
    
    if (result.success && result.data) {
      setClients(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error loading clients",
        description: result.message
      });
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleDeleteClient = async (id: string) => {
    const result = await deleteClient(id);
    
    if (result.success) {
      toast({
        title: "Client deleted",
        description: result.message
      });
      loadClients();
    } else {
      toast({
        variant: "destructive",
        title: "Error deleting client",
        description: result.message
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              View and manage all your clients
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadClients}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button onClick={() => navigate('/clients/new')}>
              <UserPlus className="h-4 w-4 mr-2" /> Add Client
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2" /> Client List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientList 
                clients={clients} 
                onDelete={handleDeleteClient} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Clients;
