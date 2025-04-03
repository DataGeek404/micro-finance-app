import React, { useEffect, useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [criticalTimeout, setCriticalTimeout] = useState(false);

  useEffect(() => {
    if (isLoading) {
      console.log("AppLayout: Loading auth state...");
      
      const timeout = setTimeout(() => {
        console.log("Loading state is taking too long. Current auth state:", { isLoading, isAuthenticated });
        setLoadingTimeout(true);
      }, 2000);
      
      const criticalTimeoutId = setTimeout(() => {
        console.error("Critical timeout reached. Forcing redirect to login page");
        setCriticalTimeout(true);
      }, 5000);
      
      return () => {
        clearTimeout(timeout);
        clearTimeout(criticalTimeoutId);
      };
    } else {
      console.log("AppLayout: Auth state loaded, authenticated:", isAuthenticated);
      setLoadingTimeout(false);
      setCriticalTimeout(false);
    }
  }, [isLoading, isAuthenticated]);

  if (criticalTimeout) {
    console.log("Critical timeout reached, redirecting to login");
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center mb-4">
            <Skeleton className="h-12 w-[200px] mx-auto mb-2" />
            <Skeleton className="h-4 w-[300px] mx-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4 mx-auto" />
          </div>
          <div className="text-center text-sm text-muted-foreground mt-2">
            {loadingTimeout ? 
              <div>
                <p>Authentication timed out. Please try refreshing the page...</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 text-xs rounded bg-primary text-white hover:bg-primary/90"
                >
                  Refresh Now
                </button>
              </div> : 
              "Loading your account..."}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 p-0 overflow-auto">
          <div className="container p-6 mx-auto">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
