
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { toast } from "@/hooks/use-toast";
import { transformClientData } from "./transform";

/**
 * Fetches all clients from the database
 */
export const fetchAllClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data.map(client => transformClientData(client));
  } catch (error) {
    console.error('Error fetching clients:', error);
    toast({
      title: "Error fetching clients",
      description: "There was a problem fetching client data",
      variant: "destructive",
    });
    return [];
  }
};
