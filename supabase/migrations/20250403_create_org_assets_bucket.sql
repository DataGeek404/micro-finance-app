
-- Create storage bucket for organization assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('organization_assets', 'Organization Assets', true);

-- Create policy to allow authenticated users to upload organization assets
CREATE POLICY "Allow authenticated users to upload organization assets"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'organization_assets');

-- Create policy to allow anyone to view organization assets
CREATE POLICY "Allow anyone to view organization assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'organization_assets');

-- Create policy to allow authenticated users to update organization assets
CREATE POLICY "Allow authenticated users to update organization assets"
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'organization_assets');

-- Create policy to allow authenticated users to delete organization assets
CREATE POLICY "Allow authenticated users to delete organization assets"
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'organization_assets');

-- Create trigger for updating the updated_at column on organization_settings
CREATE TRIGGER IF NOT EXISTS update_organization_settings_updated_at
BEFORE UPDATE ON public.organization_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
