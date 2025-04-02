
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
  photo: client.photo || undefined,
});

/**
 * Updates a client in the database
 */
export const updateClient = async (client: Client): Promise<{success: boolean, message: string, data?: Client}> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({
        first_name: client.firstName,
        last_name: client.lastName,
        email: client.email || null,
        phone: client.phone,
        address: client.address,
        national_id: client.nationalId,
        date_of_birth: client.dateOfBirth.toISOString(),
        gender: client.gender,
        occupation: client.occupation,
        income_source: client.incomeSource,
        monthly_income: client.monthlyIncome,
        branch_id: client.branchId,
        status: client.status,
        photo: client.photo || null
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
 * Creates a client and returns the result
 */
export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
  success: boolean;
  message: string;
  data?: Client;
}> => {
  try {
    // Log the client data being sent
    console.log("Creating client with data:", clientData);
    
    const newClient = {
      first_name: clientData.firstName,
      last_name: clientData.lastName,
      email: clientData.email || null,
      phone: clientData.phone,
      address: clientData.address,
      national_id: clientData.nationalId,
      date_of_birth: clientData.dateOfBirth.toISOString(),
      gender: clientData.gender,
      occupation: clientData.occupation,
      income_source: clientData.incomeSource,
      monthly_income: clientData.monthlyIncome,
      branch_id: clientData.branchId,
      status: clientData.status,
      photo: clientData.photo || null
    };
    
    // Log the formatted data being sent to Supabase
    console.log("Formatted client data for Supabase:", newClient);
    
    const { data, error } = await supabase
      .from('clients')
      .insert([newClient])
      .select()
      .single();
      
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    console.log("Client created successfully:", data);
    
    return {
      success: true,
      message: `${clientData.firstName} ${clientData.lastName} has been added successfully`,
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
 * Deletes a client from the database
 */
export const deleteClient = async (clientId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);
      
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

/**
 * Prepares client data for CSV export
 */
export const prepareClientsForExport = (clients: Client[]): Record<string, string>[] => {
  return clients.map(client => ({
    'ID': client.id,
    'First Name': client.firstName,
    'Last Name': client.lastName,
    'Email': client.email || '',
    'Phone': client.phone,
    'Address': client.address,
    'National ID': client.nationalId,
    'Date of Birth': client.dateOfBirth.toISOString().split('T')[0],
    'Gender': client.gender,
    'Occupation': client.occupation,
    'Income Source': client.incomeSource,
    'Monthly Income': client.monthlyIncome.toString(),
    'Status': client.status,
    'Created At': client.createdAt.toISOString().split('T')[0],
  }));
};

/**
 * Converts client data to PDF-ready format
 */
export const prepareClientsForPDF = (clients: Client[]): any[] => {
  return clients.map(client => ({
    id: client.id,
    name: `${client.firstName} ${client.lastName}`,
    contact: client.email || client.phone,
    nationalId: client.nationalId,
    income: `$${client.monthlyIncome.toLocaleString()}`,
    status: client.status,
    createdAt: client.createdAt.toISOString().split('T')[0]
  }));
};
