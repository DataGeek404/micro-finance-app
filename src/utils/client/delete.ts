
import { supabase } from "@/integrations/supabase/client";

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
