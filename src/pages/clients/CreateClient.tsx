
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientForm } from '@/components/clients/ClientForm';
import { createClient } from '@/utils/clientUtils';
import { toast } from '@/hooks/use-toast';

// Define proper branch type
type Branch = {
  id: string;
  name: string;
};

const CreateClient = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBranches = async () => {
      setIsLoading(true);
      try {
        // Using mock data for branches with proper UUIDs
        const mockBranches = [
          { id: "123e4567-e89b-12d3-a456-426614174000", name: 'Main Branch' },
          { id: "223e4567-e89b-12d3-a456-426614174001", name: 'East Branch' },
          { id: "323e4567-e89b-12d3-a456-426614174002", name: 'West Branch' },
        ];
        
        setBranches(mockBranches);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading branches:", error);
        toast({
          variant: "destructive",
          title: "Error loading branches",
          description: "Could not load branch data"
        });
        setIsLoading(false);
      }
    };

    loadBranches();
  }, []);

  const handleSubmit = async (data: any) => {
    console.log("Submitting client data:", data);
    setIsSubmitting(true);
    
    try {
      // Validate branch ID is a valid UUID
      if (!data.branchId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.branchId)) {
        throw new Error("Invalid branch ID format");
      }
      
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
    } catch (error) {
      console.error("Error in client creation:", error);
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Error creating client",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
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
              ) : branches.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-destructive mb-2">No branches available</p>
                  <p className="text-sm text-muted-foreground">
                    Please create a branch before adding clients
                  </p>
                </div>
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
