
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { printReport } from '@/utils/reportUtils';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PrintableReportProps {
  title: string;
  data: any[] | Record<string, any>;
  subtitle?: string;
  columns?: { key: string; label: string; format?: (value: any) => string }[];
  summary?: Record<string, any>;
  children?: React.ReactNode;
}

const PrintableReport = ({
  title,
  data,
  subtitle,
  columns,
  summary,
  children
}: PrintableReportProps) => {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [orgName, setOrgName] = useState<string>('');
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  
  // Fetch organization details for the report
  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('organization_settings')
          .select('name, logo')
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setOrgName(data.name);
          setOrgLogo(data.logo);
        }
      } catch (error) {
        console.error('Error fetching organization details:', error);
      }
    };
    
    fetchOrgDetails();
  }, []);

  const handlePrint = () => {
    setIsPrinting(true);
    
    try {
      printReport(title, data, {
        subtitle,
        organizationName: orgName,
        logo: orgLogo || undefined,
        columns,
        summary
      });
      
      toast({
        title: "Report Prepared",
        description: "Your report has been generated and is ready to print."
      });
    } catch (error) {
      console.error('Error printing report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div>
      {children}
      
      <div className="mt-4">
        <Button onClick={handlePrint} disabled={isPrinting}>
          {isPrinting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing Report...
            </>
          ) : (
            <>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PrintableReport;
