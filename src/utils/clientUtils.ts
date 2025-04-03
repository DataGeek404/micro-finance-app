
import { supabase } from "@/integrations/supabase/client";
import { Client, ClientStatus } from "@/types/client";
import { toast } from "@/hooks/use-toast";

/**
 * Converts a client from Supabase format to application format
 */
export const transformClientData = (client: any): Client => ({
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
});

/**
 * Fetches all clients from the database
 */
export const fetchClients = async (): Promise<{success: boolean, message: string, data?: Client[]}> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      message: "Clients fetched successfully",
      data: data.map(transformClientData)
    };
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return {
      success: false,
      message: error.message || "There was a problem fetching clients"
    };
  }
};

/**
 * Fetches a single client by ID
 */
export const fetchClientById = async (id: string): Promise<{success: boolean, message: string, data?: Client}> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      message: "Client fetched successfully",
      data: transformClientData(data)
    };
  } catch (error: any) {
    console.error('Error fetching client:', error);
    return {
      success: false,
      message: error.message || "There was a problem fetching the client"
    };
  }
};

/**
 * Creates a new client in the database
 */
export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<{success: boolean, message: string, data?: Client}> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        first_name: client.firstName,
        last_name: client.lastName,
        email: client.email || null,
        phone: client.phone,
        address: client.address,
        national_id: client.nationalId,
        date_of_birth: new Date(client.dateOfBirth).toISOString(),
        gender: client.gender,
        occupation: client.occupation,
        income_source: client.incomeSource,
        monthly_income: client.monthlyIncome,
        branch_id: client.branchId,
        status: client.status
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      message: "Client created successfully",
      data: transformClientData(data)
    };
  } catch (error: any) {
    console.error('Error creating client:', error);
    return {
      success: false,
      message: error.message || "There was a problem creating the client"
    };
  }
};

/**
 * Updates a client in the database
 */
export const updateClient = async (client: Client): Promise<{success: boolean, message: string, data?: Client}> => {
  try {
    // Ensure dateOfBirth is properly formatted as an ISO string
    const dateOfBirth = client.dateOfBirth instanceof Date 
      ? client.dateOfBirth.toISOString() 
      : new Date(client.dateOfBirth).toISOString();
      
    const { data, error } = await supabase
      .from('clients')
      .update({
        first_name: client.firstName,
        last_name: client.lastName,
        email: client.email || null,
        phone: client.phone,
        address: client.address,
        national_id: client.nationalId,
        date_of_birth: dateOfBirth,
        gender: client.gender,
        occupation: client.occupation,
        income_source: client.incomeSource,
        monthly_income: client.monthlyIncome,
        branch_id: client.branchId,
        status: client.status
      })
      .eq('id', client.id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      message: "Client updated successfully",
      data: transformClientData(data)
    };
  } catch (error: any) {
    console.error('Error updating client:', error);
    return {
      success: false,
      message: error.message || "There was a problem updating the client"
    };
  }
};

/**
 * Deletes a client from the database
 */
export const deleteClient = async (id: string): Promise<{success: boolean, message: string}> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      message: "Client deleted successfully"
    };
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return {
      success: false,
      message: error.message || "There was a problem deleting the client"
    };
  }
};
