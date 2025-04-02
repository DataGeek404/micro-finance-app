
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

/**
 * Fetches a single client by id
 */
export const fetchClientById = async (clientId: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
      
    if (error) {
      console.error('Error fetching client:', error);
      return null;
    }
    
    return transformClientData(data);
  } catch (error) {
    console.error('Error fetching client by id:', error);
    return null;
  }
};

/**
 * Checks if a national ID is already in use
 */
export const checkNationalIdExists = async (nationalId: string, excludeClientId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from('clients')
      .select('id')
      .eq('national_id', nationalId);
      
    if (excludeClientId) {
      query = query.neq('id', excludeClientId);
    }
    
    const { data, error } = await query;
      
    if (error) {
      throw error;
    }
    
    return data.length > 0;
  } catch (error) {
    console.error('Error checking national ID:', error);
    return false;
  }
};
