
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
    if (!clientData.firstName.trim()) throw new Error("First name is required");
    if (!clientData.lastName.trim()) throw new Error("Last name is required");
    if (!clientData.phone.trim()) throw new Error("Phone is required");
    if (!clientData.nationalId.trim()) throw new Error("National ID is required");
    if (!clientData.branchId) throw new Error("Branch selection is required");
    
    // Check for duplicate national ID
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('national_id', clientData.nationalId)
      .single();
      
    if (existingClient && !checkError) {
      throw new Error(`A client with National ID ${clientData.nationalId} already exists`);
    }
    
    const newClient = {
      first_name: clientData.firstName.trim(),
      last_name: clientData.lastName.trim(),
      email: clientData.email ? clientData.email.trim() : null,
      phone: clientData.phone.trim(),
      address: clientData.address.trim(),
      national_id: clientData.nationalId.trim(),
      date_of_birth: dateOfBirthIso,
      gender: clientData.gender,
      occupation: clientData.occupation.trim(),
      income_source: clientData.incomeSource.trim(),
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
