
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    console.log("Index page: auth state", { isLoading, isAuthenticated });
  }, [isLoading, isAuthenticated]);

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
          </div>
          <div className="text-center text-sm text-muted-foreground mt-2">
            <p>Loading authentication state...</p>
            <p className="mt-2 text-xs">If loading takes too long, <button onClick={() => window.location.reload()} className="text-primary underline">click here to refresh</button></p>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default Index;
