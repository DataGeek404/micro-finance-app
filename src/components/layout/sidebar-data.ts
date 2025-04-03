
import { 
  Home, 
  Users,
  DollarSign, 
  Building2, 
  LogOut, 
  Settings, 
  Wallet, 
  Calculator, 
  CreditCard, 
  PieChart, 
  Receipt, 
  BadgeDollarSign, 
  Mail, 
  MessageSquare, 
  MonitorSmartphone, 
  RefreshCw, 
  MoreHorizontal, 
  BarChart3 
} from 'lucide-react';

export const mainMenuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: Home,
  },
  {
    title: 'Clients',
    path: '/clients',
    icon: Users,
  },
];

export const loanMenuItems = [
  { title: 'View Loans', path: '/loans', icon: DollarSign },
  { title: 'View Applications', path: '/loans/applications', icon: Receipt },
  { title: 'Create Loan', path: '/loans/create', icon: CreditCard },
  { title: 'Manage Products', path: '/loans/products', icon: BadgeDollarSign },
  { title: 'Manage Charges', path: '/loans/charges', icon: Wallet },
  { title: 'Loan Calculator', path: '/loans/calculator', icon: Calculator },
];

export const payrollMenuItems = [
  { title: 'View Payroll', path: '/payroll', icon: BadgeDollarSign },
  { title: 'Create Payroll', path: '/payroll/create', icon: DollarSign },
  { title: 'Manage Payroll Items', path: '/payroll/items', icon: Receipt },
  { title: 'Manage Payroll Templates', path: '/payroll/templates', icon: PieChart },
];

export const expenseMenuItems = [
  { title: 'View Expenses', path: '/expenses', icon: Wallet },
  { title: 'Create Expense', path: '/expenses/create', icon: CreditCard },
  { title: 'Manage Expense Types', path: '/expenses/types', icon: PieChart },
];

export const settingsMenuItems = [
  { title: 'Organisation Settings', path: '/settings/organization', icon: Building2 },
  { title: 'General Settings', path: '/settings/general', icon: Settings },
  { title: 'Email Settings', path: '/settings/email', icon: Mail },
  { title: 'SMS Settings', path: '/settings/sms', icon: MessageSquare },
  { title: 'System Settings', path: '/settings/system', icon: MonitorSmartphone },
  { title: 'System Update', path: '/settings/update', icon: RefreshCw },
  { title: 'Other Settings', path: '/settings/other', icon: MoreHorizontal },
];

export const otherMenuItems = [
  {
    title: 'Branches',
    path: '/branches',
    icon: Building2,
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: BarChart3,
  },
];
