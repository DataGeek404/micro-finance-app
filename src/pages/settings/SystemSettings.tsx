
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { MonitorSmartphone, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemSettings as SystemSettingsType } from '@/types/settings';

const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettingsType>({
    maintenanceMode: false,
    debugMode: false,
    maxFileUploadSize: 10,
    allowedFileTypes: ['pdf', 'jpg', 'png', 'docx', 'xlsx'],
  });
  
  // Handle switch changes
  const handleSwitchChange = (id: keyof SystemSettingsType) => {
    setSettings(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev]
    }));
  };

  // Handle input changes
  const handleInputChange = (id: string, value: string | number) => {
    if (id === 'allowedTypes') {
      // Convert comma-separated string to array
      const fileTypes = (value as string).split(',').map(type => type.trim()).filter(Boolean);
      setSettings(prev => ({ ...prev, allowedFileTypes: fileTypes }));
    } else if (id === 'maxFileSize') {
      setSettings(prev => ({ ...prev, maxFileUploadSize: Number(value) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically save the settings to your backend
    console.log("Saving settings:", settings);
    
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully."
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure core system settings and behavior</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MonitorSmartphone className="mr-2 h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Status</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put the system in maintenance mode to prevent user access while updating
                      </p>
                    </div>
                    <Switch 
                      id="maintenanceMode" 
                      checked={settings.maintenanceMode}
                      onCheckedChange={() => handleSwitchChange('maintenanceMode')} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="debugMode">Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable detailed logging and error reporting for troubleshooting
                      </p>
                    </div>
                    <Switch 
                      id="debugMode" 
                      checked={settings.debugMode}
                      onCheckedChange={() => handleSwitchChange('debugMode')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">File Upload Settings</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Upload Size (MB)</Label>
                    <Input 
                      id="maxFileSize" 
                      type="number" 
                      value={settings.maxFileUploadSize}
                      onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowedTypes">Allowed File Types</Label>
                    <Input 
                      id="allowedTypes" 
                      value={settings.allowedFileTypes.join(', ')}
                      onChange={(e) => handleInputChange('allowedTypes', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Comma-separated list of file extensions (e.g., pdf, jpg, png)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security Settings</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require two-factor authentication for all users
                      </p>
                    </div>
                    <Switch id="twoFactorAuth" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="strongPasswords">Strong Password Policy</Label>
                      <p className="text-sm text-muted-foreground">
                        Enforce complex password requirements
                      </p>
                    </div>
                    <Switch id="strongPasswords" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sessionTimeout">Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log users out after inactivity
                      </p>
                    </div>
                    <Switch id="sessionTimeout" defaultChecked />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTime">Session Timeout (minutes)</Label>
                    <Input id="sessionTime" type="number" defaultValue={30} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Backup</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoBackups">Automated Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable scheduled system backups
                      </p>
                    </div>
                    <Switch id="autoBackups" defaultChecked />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="backupFrequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupRetention">Retention Period (days)</Label>
                    <Input id="backupRetention" type="number" defaultValue={30} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-6">
              <Button type="submit" className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SystemSettings;
