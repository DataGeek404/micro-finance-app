
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { transformClientData } from "./transform";

/**
 * Updates a client in the database
 */
export const updateClient = async (client: Client): Promise<{success: boolean, message: string, data?: Client}> => {
  try {
    // Validate that the client id exists
    if (!client.id) {
      throw new Error("Client ID is required");
    }
    
    // Check for duplicate national ID excluding the current client
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('national_id', client.nationalId)
      .neq('id', client.id)
      .single();
      
    if (existingClient && !checkError) {
      throw new Error(`Another client with National ID ${client.nationalId} already exists`);
    }
    
    const { data, error } = await supabase
      .from('clients')
      .update({
        first_name: client.firstName.trim(),
        last_name: client.lastName.trim(),
        email: client.email ? client.email.trim() : null,
        phone: client.phone.trim(),
        address: client.address.trim(),
        national_id: client.nationalId.trim(),
        date_of_birth: client.dateOfBirth.toISOString(),
        gender: client.gender,
        occupation: client.occupation.trim(),
        income_source: client.incomeSource.trim(),
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
