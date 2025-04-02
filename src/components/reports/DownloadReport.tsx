
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Loader2, FilePdf, FileText } from 'lucide-react';
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
  const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const downloadCSV = () => {
    try {
      setIsGeneratingCSV(true);
      
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
        title: "CSV Downloaded",
        description: `${title} has been downloaded as CSV successfully.`
      });
    } catch (error) {
      console.error('Error downloading CSV report:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your CSV report.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCSV(false);
    }
  };
  
  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Import jsPDF and autoTable dynamically to reduce bundle size
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      // Get headers and rows for table
      const headers = Object.keys(data[0] || {});
      const rows = data.map(row => headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
      }));
      
      // Add table
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });
      
      // Save PDF
      doc.save(`${filename}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: `${title} has been downloaded as PDF successfully.`
      });
    } catch (error) {
      console.error('Error downloading PDF report:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your PDF report.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline"
        className="flex items-center gap-2"
        onClick={downloadCSV}
        disabled={isGeneratingCSV || isGeneratingPDF || !data.length}
      >
        {isGeneratingCSV ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating CSV...</span>
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            <span>CSV</span>
          </>
        )}
      </Button>
      
      <Button 
        variant="outline"
        className="flex items-center gap-2"
        onClick={downloadPDF}
        disabled={isGeneratingCSV || isGeneratingPDF || !data.length}
      >
        {isGeneratingPDF ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <FilePdf className="h-4 w-4" />
            <span>PDF</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default DownloadReport;
