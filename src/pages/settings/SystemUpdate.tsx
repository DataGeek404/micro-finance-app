
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Check, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const SystemUpdate = () => {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentVersion] = useState('1.2.3');
  const [latestVersion] = useState('1.3.0');
  const [changelogItems] = useState([
    'Improved loan application process',
    'Enhanced report generation',
    'Fixed issues with client registration',
    'Added support for bulk SMS sending',
    'Performance improvements and bug fixes'
  ]);
  
  const simulateUpdate = () => {
    setUpdating(true);
    setProgress(0);
    
    // Simulate update process with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Simulate completion after reaching 100%
          setTimeout(() => {
            setUpdating(false);
            toast({
              title: "Update Complete",
              description: `System successfully updated to version ${latestVersion}`,
            });
          }, 500);
          
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };
  
  const checkForUpdates = () => {
    toast({
      title: "Checking for updates",
      description: "No new updates available at this time.",
    });
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">System Update</h1>
        <p className="text-muted-foreground">Check for and install system updates</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Version</CardTitle>
            <CardDescription>Information about your current system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Installed Version</p>
              <p className="text-2xl font-bold">{currentVersion}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Installation Date</p>
              <p className="text-muted-foreground">March 15, 2025</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-muted-foreground">March 28, 2025</p>
            </div>
            
            <Button variant="outline" onClick={checkForUpdates}>
              Check for Updates
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Update</CardTitle>
                <CardDescription>New version available</CardDescription>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Latest Version</p>
              <p className="text-2xl font-bold">{latestVersion}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Changelog</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {changelogItems.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {updating ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Installing Update...</p>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progress === 100 ? 'Completing installation...' : `${progress}% complete`}
                </p>
              </div>
            ) : (
              <Button className="w-full" onClick={simulateUpdate}>
                <Download className="mr-2 h-4 w-4" />
                Install Update
              </Button>
            )}
            
            <div className="flex items-center rounded-md border p-4 text-sm">
              <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
              <p className="text-muted-foreground">
                Always backup your data before updating. The system will be unavailable during the update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Update History</CardTitle>
          <CardDescription>Previous system updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-4">
              <div>
                <p className="font-medium">Version 1.2.3</p>
                <p className="text-sm text-muted-foreground">Security patches and minor improvements</p>
              </div>
              <p className="text-sm text-muted-foreground">March 28, 2025</p>
            </div>
            
            <div className="flex justify-between border-b pb-4">
              <div>
                <p className="font-medium">Version 1.2.0</p>
                <p className="text-sm text-muted-foreground">Added SMS integration and reporting features</p>
              </div>
              <p className="text-sm text-muted-foreground">March 15, 2025</p>
            </div>
            
            <div className="flex justify-between border-b pb-4">
              <div>
                <p className="font-medium">Version 1.1.0</p>
                <p className="text-sm text-muted-foreground">Enhanced client management and loan processing</p>
              </div>
              <p className="text-sm text-muted-foreground">February 20, 2025</p>
            </div>
            
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Version 1.0.0</p>
                <p className="text-sm text-muted-foreground">Initial release</p>
              </div>
              <p className="text-sm text-muted-foreground">January 10, 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default SystemUpdate;
