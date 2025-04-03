import React from 'react';
import {
  BarChart3,
  Users,
  DollarSign,
  BadgeDollarSign,
  Wallet,
  Settings,
  FileText,
  Home,
  Bell,
  Calendar,
  LayoutDashboard,
  Building,
  CreditCard,
  PiggyBank,
  Landmark,
  HelpCircle,
} from 'lucide-react';

// Main menu items
export const mainMenuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Clients', path: '/clients', icon: Users },
  { title: 'Calendar', path: '/calendar', icon: Calendar },
  { title: 'Reports', path: '/reports', icon: BarChart3 },
  { title: 'Notifications', path: '/notifications', icon: Bell },
];

// Loan menu items
export const loanMenuItems = [
  { title: 'All Loans', path: '/loans' },
  { title: 'Create Loan', path: '/loans/create' },
  { title: 'Loan Products', path: '/loans/products' },
  { title: 'Loan Applications', path: '/loans/applications' },
  { title: 'Loan Approvals', path: '/loans/approvals' },
  { title: 'Loan Disbursements', path: '/loans/disbursements' },
  { title: 'Loan Repayments', path: '/loans/repayments' },
  { title: 'Loan Collateral', path: '/loans/collateral' },
  { title: 'Loan Guarantors', path: '/loans/guarantors' },
];

// Payroll menu items
export const payrollMenuItems = [
  { title: 'Employees', path: '/payroll/employees' },
  { title: 'Salary Payments', path: '/payroll/payments' },
  { title: 'Payroll Settings', path: '/payroll/settings' },
  { title: 'Tax Settings', path: '/payroll/tax' },
  { title: 'Payroll Reports', path: '/payroll/reports' },
];

// Expense menu items
export const expenseMenuItems = [
  { title: 'All Expenses', path: '/expenses' },
  { title: 'Add Expense', path: '/expenses/add' },
  { title: 'Expense Categories', path: '/expenses/categories' },
  { title: 'Expense Reports', path: '/expenses/reports' },
  { title: 'Expense Approvals', path: '/expenses/approvals' },
];

// Other menu items
export const otherMenuItems = [
  { title: 'Branches', path: '/branches', icon: Building },
  { title: 'Transactions', path: '/transactions', icon: CreditCard },
  { title: 'Savings', path: '/savings', icon: PiggyBank },
  { title: 'Banking', path: '/banking', icon: Landmark },
  { title: 'Help', path: '/help', icon: HelpCircle },
];

// Settings menu items
export const settingsMenuItems = [
  { title: 'Organization', path: '/settings/organization' },
  { title: 'General', path: '/settings/general' },
  { title: 'Email', path: '/settings/email' },
  { title: 'SMS', path: '/settings/sms' },
  { title: 'System', path: '/settings/system' },
  { title: 'Role Management', path: '/settings/roles' },
  { title: 'Other', path: '/settings/other' },
  { title: 'Updates', path: '/settings/updates' },
];
