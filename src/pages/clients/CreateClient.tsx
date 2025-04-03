
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientForm } from '@/components/clients/ClientForm';
import { createClient } from '@/utils/clientUtils';
import { toast } from '@/hooks/use-toast';

// Mock function to fetch branches, replace with actual API call
const fetchBranches = async () => {
  // This would normally be an API call
  return {
    success: true,
    data: [
      { id: '1', name: 'Main Branch' },
      { id: '2', name: 'East Branch' },
      { id: '3', name: 'West Branch' },
    ]
  };
};

const CreateClient = () => {
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBranches = async () => {
      setIsLoading(true);
      const result = await fetchBranches();
      setIsLoading(false);
      
      if (result.success && result.data) {
        setBranches(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error loading branches",
          description: "Could not load branch data"
        });
      }
    };

    loadBranches();
  }, []);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    const result = await createClient(data);
    setIsSubmitting(false);
    
    if (result.success) {
      toast({
        title: "Client created",
        description: "The client has been created successfully"
      });
      navigate('/clients');
    } else {
      toast({
        variant: "destructive",
        title: "Error creating client",
        description: result.message
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/clients')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
            <p className="text-muted-foreground">
              Create a new client in the system
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <UserPlus className="h-5 w-5 mr-2" /> Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">Loading...</div>
              ) : (
                <ClientForm
                  branches={branches}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateClient;
