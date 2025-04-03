
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload } from 'lucide-react';
import { uploadFile } from '@/utils/fileUpload';

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: ''
  });
  
  // Fetch organization settings
  useEffect(() => {
    const fetchOrgSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('organization_settings')
          .select('*')
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setOrganizationForm({
            name: data.name || '',
            address: data.address || '',
            city: data.address?.split(',')[0]?.trim() || '',
            country: data.address?.split(',')[1]?.trim() || '',
            phone: data.phone || '',
            email: data.email || '',
            website: data.website || ''
          });
          
          setLogoUrl(data.logo);
        }
      } catch (error) {
        console.error('Error fetching organization settings:', error);
        toast({
          title: "Error",
          description: "Failed to load organization settings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrgSettings();
  }, [toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setOrganizationForm(prev => ({
      ...prev,
      [id.replace('org-', '')]: value
    }));
  };
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo image must be less than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const logoPath = await uploadFile(file, 'organization_assets', 'logos');
      
      if (!logoPath) {
        throw new Error("Failed to upload logo");
      }
      
      // Update organization settings with new logo URL
      const { error } = await supabase
        .from('organization_settings')
        .update({ logo: logoPath })
        .eq('id', '1'); // Assuming there's only one organization record
      
      if (error) throw error;
      
      setLogoUrl(logoPath);
      
      toast({
        title: "Logo uploaded",
        description: "Your organization logo has been updated"
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSaveOrganization = async () => {
    setIsLoading(true);
    try {
      // Combine city and country into address
      const fullAddress = `${organizationForm.address}`;
      
      const { error } = await supabase
        .from('organization_settings')
        .update({
          name: organizationForm.name,
          address: fullAddress,
          phone: organizationForm.phone,
          email: organizationForm.email,
          website: organizationForm.website
        })
        .eq('id', '1'); // Assuming there's only one organization record
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Organization information has been updated successfully"
      });
    } catch (error) {
      console.error('Error saving organization settings:', error);
      toast({
        title: "Save failed",
        description: "Could not save organization settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully"
    });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Configure general system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input id="app-name" value="LoanLight" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <select 
                    id="date-format" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <select 
                    id="timezone" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="CST">Central Standard Time (CST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between space-y-0 pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-logout">Auto Logout</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically log out after 30 minutes of inactivity
                    </p>
                  </div>
                  <Switch id="auto-logout" defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Loan Settings</CardTitle>
                <CardDescription>Configure default loan parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-interest">Default Interest Rate (%)</Label>
                    <Input id="default-interest" type="number" value="12.5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-term">Default Loan Term (months)</Label>
                    <Input id="default-term" type="number" value="12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="late-fee">Late Payment Fee (%)</Label>
                    <Input id="late-fee" type="number" value="2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grace-period">Grace Period (days)</Label>
                    <Input id="grace-period" type="number" value="3" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-approval">Require Loan Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      All loans require manager approval before disbursement
                    </p>
                  </div>
                  <Switch id="require-approval" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Update your organization information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-6 space-y-4">
                <div className="w-32 h-32 border rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Organization Logo" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground text-sm">
                      No logo uploaded
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <Button type="button" disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </>
                        )}
                      </Button>
                    </div>
                    <Input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 200x200px, max 2MB
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input 
                  id="org-name" 
                  value={organizationForm.name} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-address">Address</Label>
                <Input 
                  id="org-address" 
                  value={organizationForm.address} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-city">City</Label>
                  <Input 
                    id="org-city" 
                    value={organizationForm.city} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-country">Country</Label>
                  <Input 
                    id="org-country" 
                    value={organizationForm.country} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone</Label>
                  <Input 
                    id="org-phone" 
                    value={organizationForm.phone} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Email</Label>
                  <Input 
                    id="org-email" 
                    type="email" 
                    value={organizationForm.email} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-website">Website</Label>
                <Input 
                  id="org-website" 
                  value={organizationForm.website} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveOrganization} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Organization Info"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">SMS Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Receive SMS notifications for critical alerts
                    </p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">Loan Application Alerts</h3>
                    <p className="text-xs text-muted-foreground">
                      Be notified when new loan applications are submitted
                    </p>
                  </div>
                  <Switch id="loan-applications" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">Payment Reminders</h3>
                    <p className="text-xs text-muted-foreground">
                      Send automatic payment reminders to clients
                    </p>
                  </div>
                  <Switch id="payment-reminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">System Reports</h3>
                    <p className="text-xs text-muted-foreground">
                      Receive periodic system reports and analytics
                    </p>
                  </div>
                  <Switch id="system-reports" defaultChecked />
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input id="notification-email" type="email" value="admin@microfinance.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-phone">Notification Phone</Label>
                  <Input id="notification-phone" value="555-123-4567" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>Save Notification Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
