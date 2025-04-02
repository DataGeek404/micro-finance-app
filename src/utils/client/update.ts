
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { transformClientData } from "./transform";

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
