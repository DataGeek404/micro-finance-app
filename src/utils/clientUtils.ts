
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
 * Deletes all clients except the specified one
 */
export const deleteAllClientsExcept = async (exactName: string): Promise<{success: boolean, message: string}> => {
  try {
    // Find client with exact name match (first_name + last_name combination)
    const { data: clientsToKeep, error: findError } = await supabase
      .from('clients')
      .select('id')
      .ilike('first_name', '%james%')
      .ilike('last_name', '%analysis%');
      
    if (findError) {
      throw findError;
    }
    
    if (!clientsToKeep || clientsToKeep.length === 0) {
      return {
        success: false, 
        message: `No clients found with name "James Analysis". No deletions performed.`
      };
    }
    
    // Get IDs to keep
    const idsToKeep = clientsToKeep.map(client => client.id);
    
    // Delete all clients except those in the idsToKeep array
    const { error: deleteError, count } = await supabase
      .from('clients')
      .delete()
      .not('id', 'in', idsToKeep)
      .select('count');
    
    if (deleteError) {
      throw deleteError;
    }
    
    return {
      success: true,
      message: `Successfully deleted ${count || 'all'} clients except those matching "James Analysis".`
    };
  } catch (error: any) {
    console.error('Error deleting clients:', error);
    return {
      success: false,
      message: error.message || "There was a problem deleting clients"
    };
  }
};

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
