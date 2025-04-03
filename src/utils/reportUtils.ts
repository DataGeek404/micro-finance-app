
import { formatCurrency } from '@/utils/dashboard/formatters';

/**
 * Generates a printable report HTML
 * @param title Report title
 * @param data Report data
 * @param options Report generation options
 * @returns HTML string for printing
 */
export const generateReportHTML = (
  title: string,
  data: any[] | Record<string, any>,
  options: {
    subtitle?: string;
    organizationName?: string;
    logo?: string;
    columns?: { key: string; label: string; format?: (value: any) => string }[];
    summary?: Record<string, any>;
    showDate?: boolean;
  } = {}
) => {
  const { subtitle, organizationName, logo, columns, summary, showDate = true } = options;
  const date = new Date().toLocaleDateString();

  const formatValue = (value: any, formatter?: (value: any) => string) => {
    if (formatter) return formatter(value);
    
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    
    return String(value);
  };

  let tableHTML = '';
  
  if (Array.isArray(data) && data.length > 0) {
    // If columns are provided, use them; otherwise use object keys
    const tableColumns = columns || Object.keys(data[0]).map(key => ({ key, label: key }));
    
    tableHTML = `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            ${tableColumns.map(col => `<th style="text-align: left;">${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${tableColumns.map(col => `
                <td>${formatValue(row[col.key], col.format)}</td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Add summary if provided
    if (summary && Object.keys(summary).length > 0) {
      tableHTML += `
        <div style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
          <h3 style="margin-top: 0;">Summary</h3>
          <table style="width: 100%;">
            ${Object.entries(summary).map(([key, value]) => `
              <tr>
                <td style="font-weight: bold; padding: 5px;">${key}</td>
                <td style="text-align: right; padding: 5px;">${value}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    }
  } else if (typeof data === 'object' && data !== null) {
    // For single record objects
    tableHTML = `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tbody>
          ${Object.entries(data).map(([key, value]) => `
            <tr>
              <th style="text-align: left; background-color: #f2f2f2; width: 30%;">${key}</th>
              <td>${formatValue(value)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .logo {
          margin-right: 20px;
          width: 80px;
          height: 80px;
        }
        .report-info {
          flex-grow: 1;
        }
        .report-date {
          text-align: right;
        }
        h1 {
          margin: 0;
          color: #2563eb;
        }
        h2 {
          color: #666;
          font-weight: normal;
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body {
            padding: 0;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logo ? `<img src="${logo}" alt="Organization Logo" class="logo">` : ''}
        <div class="report-info">
          ${organizationName ? `<h2>${organizationName}</h2>` : ''}
          <h1>${title}</h1>
          ${subtitle ? `<h2>${subtitle}</h2>` : ''}
        </div>
        ${showDate ? `<div class="report-date">Date: ${date}</div>` : ''}
      </div>
      
      <div class="report-content">
        ${tableHTML}
      </div>
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; background-color: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Print Report
        </button>
      </div>
    </body>
    </html>
  `;

  return html;
};

/**
 * Open a printable report in a new window
 * @param html HTML content to print
 */
export const openPrintableReport = (html: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    console.error('Failed to open print window. Please check if pop-ups are blocked.');
    alert('Failed to open print window. Please check if pop-ups are blocked.');
  }
};

/**
 * Generate and open a printable report
 * @param title Report title
 * @param data Report data
 * @param options Report options
 */
export const printReport = (
  title: string,
  data: any[] | Record<string, any>,
  options: {
    subtitle?: string;
    organizationName?: string;
    logo?: string;
    columns?: { key: string; label: string; format?: (value: any) => string }[];
    summary?: Record<string, any>;
    showDate?: boolean;
  } = {}
) => {
  const html = generateReportHTML(title, data, options);
  openPrintableReport(html);
};
