
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
