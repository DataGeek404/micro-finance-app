
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6 max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! We couldn't find the page you're looking for.</p>
        <div className="space-y-2">
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Return to Dashboard
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
