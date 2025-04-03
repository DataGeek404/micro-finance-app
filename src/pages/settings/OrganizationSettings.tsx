
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Building2, Upload, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/utils/fileUpload';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const OrganizationSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [orgSettings, setOrgSettings] = useState({
    name: 'LoanLight Microfinance',
    logo: '',
    address: '123 Finance Street, Business District',
    phone: '+1 (555) 123-4567',
    email: 'info@loanlight.com',
    website: 'www.loanlight.com',
    taxId: 'TX123456789',
    currencyCode: 'USD',
    fiscalYearStartMonth: 1,
    fiscalYearEndMonth: 12,
  });

  // Fetch organization settings from the database
  useEffect(() => {
    const fetchOrgSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('organization_settings')
          .select('*')
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setOrgSettings({
            name: data.name,
            logo: data.logo || '',
            address: data.address,
            phone: data.phone,
            email: data.email,
            website: data.website || '',
            taxId: data.tax_id || '',
            currencyCode: data.currency_code,
            fiscalYearStartMonth: data.fiscal_year_start_month,
            fiscalYearEndMonth: data.fiscal_year_end_month,
          });
        }
      } catch (error) {
        console.error("Error fetching organization settings:", error);
        toast({
          title: "Error",
          description: "Failed to load organization settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrgSettings();
  }, [toast]);

  const handleChange = (field: string, value: string | number) => {
    setOrgSettings({
      ...orgSettings,
      [field]: value
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF or SVG image file",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const logoUrl = await uploadFile(file, 'organization_assets', 'logos');
      
      if (logoUrl) {
        setOrgSettings({
          ...orgSettings,
          logo: logoUrl
        });
        
        toast({
          title: "Logo uploaded",
          description: "Your logo has been uploaded successfully",
        });
      } else {
        throw new Error("Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your logo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          name: orgSettings.name,
          logo: orgSettings.logo,
          address: orgSettings.address,
          phone: orgSettings.phone,
          email: orgSettings.email,
          website: orgSettings.website,
          tax_id: orgSettings.taxId,
          currency_code: orgSettings.currencyCode,
          fiscal_year_start_month: orgSettings.fiscalYearStartMonth,
          fiscal_year_end_month: orgSettings.fiscalYearEndMonth,
        }, {
          onConflict: 'id'
        });
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your organization settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving organization settings:", error);
      toast({
        title: "Error",
        description: "Failed to save organization settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">Manage your organization's profile and configuration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Organization Profile
            </CardTitle>
            <CardDescription>
              Update your organization's basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center justify-center p-6 border rounded-lg">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
                    {orgSettings.logo ? (
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={orgSettings.logo} alt="Organization logo" />
                        <AvatarFallback>
                          <Building2 className="h-16 w-16 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Building2 className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <Label htmlFor="logo-upload" className="w-full">
                    <div className={`w-full flex items-center justify-center ${isUploading ? 'opacity-50' : ''}`}>
                      <Button variant="outline" className="w-full" disabled={isUploading} asChild>
                        <div>
                          {isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          {isUploading ? "Uploading..." : "Upload Logo"}
                        </div>
                      </Button>
                    </div>
                    <Input 
                      id="logo-upload" 
                      type="file" 
                      onChange={handleFileUpload}
                      className="sr-only"
                      accept="image/jpeg,image/png,image/gif,image/svg+xml"
                      disabled={isUploading}
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: Square image, 512x512px or larger. JPG, PNG, GIF or SVG.
                  </p>
                </div>
                
                <div className="md:w-2/3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        value={orgSettings.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / Registration Number</Label>
                      <Input
                        id="taxId"
                        value={orgSettings.taxId}
                        onChange={(e) => handleChange('taxId', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={orgSettings.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={orgSettings.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={orgSettings.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={orgSettings.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currencyCode">Base Currency</Label>
                    <Select 
                      value={orgSettings.currencyCode}
                      onValueChange={(value) => handleChange('currencyCode', value)}
                    >
                      <SelectTrigger id="currencyCode">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - United States Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fiscalStart">Fiscal Year Start</Label>
                    <Select
                      value={orgSettings.fiscalYearStartMonth.toString()}
                      onValueChange={(value) => handleChange('fiscalYearStartMonth', parseInt(value))}
                    >
                      <SelectTrigger id="fiscalStart">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fiscalEnd">Fiscal Year End</Label>
                    <Select
                      value={orgSettings.fiscalYearEndMonth.toString()}
                      onValueChange={(value) => handleChange('fiscalYearEndMonth', parseInt(value))}
                    >
                      <SelectTrigger id="fiscalEnd">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OrganizationSettings;
