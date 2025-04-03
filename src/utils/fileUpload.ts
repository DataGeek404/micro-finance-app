
import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a file to Supabase storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param path The path within the bucket (optional)
 * @returns The file URL if successful, null otherwise
 */
export const uploadFile = async (
  file: File,
  bucket: string,
  path?: string
): Promise<string | null> => {
  try {
    // Create a unique file name to prevent overwrites
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading file:", error);
      return null;
    }

    // Get the public URL
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
    
    return publicUrl.publicUrl;
  } catch (error) {
    console.error("Unexpected error during file upload:", error);
    return null;
  }
};
