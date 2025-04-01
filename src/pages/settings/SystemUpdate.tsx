
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Download, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SystemUpdate = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const handleCheckForUpdates = () => {
    setIsChecking(true);
    
    // Simulate checking for updates
    setTimeout(() => {
      setIsChecking(false);
      setUpdateAvailable(true);
      toast({
        title: "Update Available",
        description: "A new system update (v2.5.0) is available for installation."
      });
    }, 2000);
  };

  const handleStartUpdate = () => {
    setIsUpdating(true);
    setProgress(0);
    
    // Simulate update progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          toast({
            title: "Update Complete",
            description: "The system has been successfully updated to version 2.5.0."
          });
          setUpdateAvailable(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  // Mock update history
  const updateHistory = [
    { version: 'v2.4.0', date: '2024-02-15', changes: 'Added new reporting features, UI improvements' },
    { version: 'v2.3.0', date: '2023-12-10', changes: 'Performance optimizations, bug fixes' },
    { version: 'v2.2.5', date: '2023-10-05', changes: 'Security updates' },
    { version: 'v2.2.0', date: '2023-08-20', changes: 'Added payroll module, improved loan calculations' },
    { version: 'v2.1.0', date: '2023-06-12', changes: 'Multi-branch support, dashboard enhancements' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Updates</h1>
          <p className="text-muted-foreground">Check for and install system updates</p>
        </div>

        <Tabs defaultValue="update">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="update">Updates</TabsTrigger>
            <TabsTrigger value="history">Update History</TabsTrigger>
          </TabsList>
          <TabsContent value="update" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  System Update Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Current Version</h3>
                      <p className="text-muted-foreground">v2.4.0 (Released: Feb 15, 2024)</p>
                    </div>
                    <Button 
                      onClick={handleCheckForUpdates} 
                      disabled={isChecking || isUpdating}
                    >
                      {isChecking ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Check for Updates
                        </>
                      )}
                    </Button>
                  </div>

                  {updateAvailable && (
                    <div className="bg-muted rounded-lg p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Update Available</h3>
                          <p className="text-muted-foreground">Version 2.5.0 is available to install</p>
                          <div className="mt-2 space-y-2">
                            <h4 className="text-sm font-medium">What's New:</h4>
                            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                              <li>Enhanced client management features</li>
                              <li>Improved reporting capabilities</li>
                              <li>Bug fixes and performance improvements</li>
                              <li>New expense tracking module</li>
                            </ul>
                          </div>
                          <div className="mt-4">
                            <Button 
                              onClick={handleStartUpdate} 
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <>
                                  <Download className="mr-2 h-4 w-4 animate-bounce" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Install Update
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isUpdating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Downloading and installing update...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {!updateAvailable && !isChecking && !isUpdating && (
                    <div className="bg-muted rounded-lg p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">System is Up to Date</h3>
                          <p className="text-muted-foreground">You are running the latest version of the system.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Settings</CardTitle>
                <CardDescription>Configure how system updates are handled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoCheck">Automatic Update Check</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically check for updates daily
                    </p>
                  </div>
                  <Switch id="autoCheck" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoDownload">Auto-Download Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically download updates when available
                    </p>
                  </div>
                  <Switch id="autoDownload" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Update History
                </CardTitle>
                <CardDescription>
                  Recent system updates and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {updateHistory.map((update, index) => (
                    <div key={index} className="pb-6 border-b last:border-b-0 last:pb-0">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                        <h3 className="text-base font-medium">{update.version}</h3>
                        <span className="text-sm text-muted-foreground">{update.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {update.changes}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SystemUpdate;
