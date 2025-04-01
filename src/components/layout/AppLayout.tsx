
import React, { useEffect, useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [criticalTimeout, setCriticalTimeout] = useState(false);

  // Add timeouts for better debugging and user experience
  useEffect(() => {
    if (isLoading) {
      console.log("AppLayout: Loading auth state...");
      
      // Set a timeout to detect if loading takes too long
      const timeout = setTimeout(() => {
        console.log("Loading state is taking too long. Current auth state:", { isLoading, isAuthenticated });
        setLoadingTimeout(true);
      }, 30000); // Extended from 2000ms to 30000ms (30 seconds)
      
      // Set a critical timeout for very long loading
      const criticalTimeoutId = setTimeout(() => {
        console.error("Critical timeout reached. Forcing redirect to login page");
        setCriticalTimeout(true);
      }, 60000); // Extended from 5000ms to 60000ms (1 minute)
      
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

  // Force redirect if critical timeout is reached
  if (criticalTimeout) {
    console.log("Critical timeout reached, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Show loading UI while authentication state is being determined
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Render the app layout if authenticated
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Regular sidebar for desktop */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        {/* Content area with mobile menu */}
        <div className="flex-1 p-0 overflow-auto">
          {/* Mobile menu is included inside AppSidebar component */}
          <div className="md:hidden">
            <AppSidebar />
          </div>
          <div className="container p-6 mx-auto pt-14 md:pt-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
