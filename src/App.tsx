
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth/AuthProvider";

// Main pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Branches from "./pages/Branches";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Loans pages
import Loans from "./pages/Loans";
import LoanApplications from "./pages/loans/LoanApplications";
import CreateLoan from "./pages/loans/CreateLoan";
import LoanProducts from "./pages/loans/LoanProducts";
import LoanCharges from "./pages/loans/LoanCharges";
import LoanCalculator from "./pages/loans/LoanCalculator";
import LoanRepayments from "./pages/loans/LoanRepayments";

// Payroll pages
import Payroll from "./pages/Payroll";
import CreatePayroll from "./pages/payroll/CreatePayroll";
import PayrollItems from "./pages/payroll/PayrollItems";
import PayrollTemplates from "./pages/payroll/PayrollTemplates";

// Expenses pages
import Expenses from "./pages/Expenses";
import CreateExpense from "./pages/expenses/CreateExpense";
import ExpenseTypes from "./pages/expenses/ExpenseTypes";

// Settings pages
import OrganizationSettings from "./pages/settings/OrganizationSettings";
import GeneralSettings from "./pages/settings/GeneralSettings";
import EmailSettings from "./pages/settings/EmailSettings";
import SMSSettings from "./pages/settings/SMSSettings";
import SystemSettings from "./pages/settings/SystemSettings";
import SystemUpdate from "./pages/settings/SystemUpdate";
import OtherSettings from "./pages/settings/OtherSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            
            {/* Loans routes */}
            <Route path="/loans" element={<Loans />} />
            <Route path="/loans/applications" element={<LoanApplications />} />
            <Route path="/loans/create" element={<CreateLoan />} />
            <Route path="/loans/products" element={<LoanProducts />} />
            <Route path="/loans/charges" element={<LoanCharges />} />
            <Route path="/loans/calculator" element={<LoanCalculator />} />
            <Route path="/loans/repayments/:id" element={<LoanRepayments />} />
            
            {/* Payroll routes */}
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/payroll/create" element={<CreatePayroll />} />
            <Route path="/payroll/items" element={<PayrollItems />} />
            <Route path="/payroll/templates" element={<PayrollTemplates />} />
            
            {/* Expenses routes */}
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/create" element={<CreateExpense />} />
            <Route path="/expenses/types" element={<ExpenseTypes />} />
            
            {/* Branch and report routes */}
            <Route path="/branches" element={<Branches />} />
            <Route path="/reports" element={<Reports />} />
            
            {/* Settings routes */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/organization" element={<OrganizationSettings />} />
            <Route path="/settings/general" element={<GeneralSettings />} />
            <Route path="/settings/email" element={<EmailSettings />} />
            <Route path="/settings/sms" element={<SMSSettings />} />
            <Route path="/settings/system" element={<SystemSettings />} />
            <Route path="/settings/update" element={<SystemUpdate />} />
            <Route path="/settings/other" element={<OtherSettings />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
