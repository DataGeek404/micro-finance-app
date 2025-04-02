
import { supabase } from "@/integrations/supabase/client";
import { Client, ClientStatus } from "@/types/client";
import { toast } from "@/hooks/use-toast";
import { transformClientData } from "./transform";

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
    
    // Ensure dateOfBirth is properly formatted as ISO string
    if (!clientData.dateOfBirth) {
      throw new Error("Date of birth is required");
    }
    
    let dateOfBirthIso: string;
    try {
      // If it's already a Date object
      if (clientData.dateOfBirth instanceof Date) {
        dateOfBirthIso = clientData.dateOfBirth.toISOString();
      } else {
        // If it's a string, create a Date object
        dateOfBirthIso = new Date(clientData.dateOfBirth).toISOString();
      }
      console.log("Formatted date of birth:", dateOfBirthIso);
    } catch (dateError) {
      console.error("Date conversion error:", dateError);
      throw new Error("Invalid date format for date of birth");
    }
    
    // Validate required fields
    if (!clientData.firstName) throw new Error("First name is required");
    if (!clientData.lastName) throw new Error("Last name is required");
    if (!clientData.phone) throw new Error("Phone is required");
    if (!clientData.nationalId) throw new Error("National ID is required");
    if (!clientData.branchId) throw new Error("Branch selection is required");
    
    const newClient = {
      first_name: clientData.firstName,
      last_name: clientData.lastName,
      email: clientData.email || null,
      phone: clientData.phone,
      address: clientData.address,
      national_id: clientData.nationalId,
      date_of_birth: dateOfBirthIso,
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
