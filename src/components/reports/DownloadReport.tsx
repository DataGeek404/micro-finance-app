
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DownloadReportProps {
  title: string;
  data: any[];
  filename: string;
}

const DownloadReport: React.FC<DownloadReportProps> = ({
  title,
  data,
  filename,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const downloadCSV = () => {
    try {
      setIsGenerating(true);
      
      // Get headers from the first object
      const headers = Object.keys(data[0] || {});
      
      // Convert data to CSV format
      const csvContent = [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map(row => 
          headers.map(header => {
            // Handle special cases (objects, arrays, etc.)
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
            // Escape commas and quotes in string values
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          }).join(',')
        )
      ].join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set link properties
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      
      // Add to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Downloaded",
        description: `${title} has been downloaded successfully.`
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your report.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline"
      className="w-full flex items-center gap-2"
      onClick={downloadCSV}
      disabled={isGenerating || !data.length}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Download {title}</span>
        </>
      )}
    </Button>
  );
};

export default DownloadReport;
