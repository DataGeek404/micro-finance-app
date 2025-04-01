import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  Users,
  DollarSign,
  Home,
  Building2,
  LogOut,
  Settings,
  Wallet,
  Calculator,
  CreditCard,
  PieChart,
  ChevronDown,
  ChevronRight,
  Receipt,
  BadgeDollarSign,
  User,
  Mail,
  MessageSquare,
  MonitorSmartphone,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    loans: location.pathname.includes('/loans'),
    payroll: location.pathname.includes('/payroll'),
    expenses: location.pathname.includes('/expenses'),
    settings: location.pathname.includes('/settings'),
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const mainMenuItems = [
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

  const loanMenuItems = [
    { title: 'View Loans', path: '/loans', icon: DollarSign },
    { title: 'View Applications', path: '/loans/applications', icon: Receipt },
    { title: 'Create Loan', path: '/loans/create', icon: CreditCard },
    { title: 'Manage Products', path: '/loans/products', icon: BadgeDollarSign },
    { title: 'Manage Charges', path: '/loans/charges', icon: Wallet },
    { title: 'Loan Calculator', path: '/loans/calculator', icon: Calculator },
  ];

  const payrollMenuItems = [
    { title: 'View Payroll', path: '/payroll', icon: BadgeDollarSign },
    { title: 'Create Payroll', path: '/payroll/create', icon: DollarSign },
    { title: 'Manage Payroll Items', path: '/payroll/items', icon: Receipt },
    { title: 'Manage Payroll Templates', path: '/payroll/templates', icon: PieChart },
  ];

  const expenseMenuItems = [
    { title: 'View Expenses', path: '/expenses', icon: Wallet },
    { title: 'Create Expense', path: '/expenses/create', icon: CreditCard },
    { title: 'Manage Expense Types', path: '/expenses/types', icon: PieChart },
  ];

  const settingsMenuItems = [
    { title: 'Organisation Settings', path: '/settings/organization', icon: Building2 },
    { title: 'General Settings', path: '/settings/general', icon: Settings },
    { title: 'Email Settings', path: '/settings/email', icon: Mail },
    { title: 'SMS Settings', path: '/settings/sms', icon: MessageSquare },
    { title: 'System Settings', path: '/settings/system', icon: MonitorSmartphone },
    { title: 'System Update', path: '/settings/update', icon: RefreshCw },
    { title: 'Other Settings', path: '/settings/other', icon: MoreHorizontal },
  ];

  const otherMenuItems = [
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex items-center">
        <div className="flex gap-2 items-center">
          <DollarSign className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-xl text-sidebar-primary">LoanLight</span>
        </div>
        <div className="ml-auto md:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary opacity-70">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Loans Menu with Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => toggleMenu('loans')}>
                  <DollarSign className="h-5 w-5" />
                  <span>Loans</span>
                  {expandedMenus.loans ? (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </SidebarMenuButton>
                {expandedMenus.loans && (
                  <SidebarMenuSub>
                    {loanMenuItems.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          isActive={isActive(item.path)}
                          onClick={() => navigate(item.path)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Payroll Menu with Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => toggleMenu('payroll')}>
                  <BadgeDollarSign className="h-5 w-5" />
                  <span>Payroll</span>
                  {expandedMenus.payroll ? (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </SidebarMenuButton>
                {expandedMenus.payroll && (
                  <SidebarMenuSub>
                    {payrollMenuItems.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          isActive={isActive(item.path)}
                          onClick={() => navigate(item.path)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Expenses Menu with Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => toggleMenu('expenses')}>
                  <Wallet className="h-5 w-5" />
                  <span>Expenses</span>
                  {expandedMenus.expenses ? (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </SidebarMenuButton>
                {expandedMenus.expenses && (
                  <SidebarMenuSub>
                    {expenseMenuItems.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          isActive={isActive(item.path)}
                          onClick={() => navigate(item.path)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Other Menu Items */}
              {otherMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary opacity-70">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={location.pathname.includes('/settings')}
                  onClick={() => toggleMenu('settings')}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                  {expandedMenus.settings ? (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </SidebarMenuButton>
                {expandedMenus.settings && (
                  <SidebarMenuSub>
                    {settingsMenuItems.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          isActive={isActive(item.path)}
                          onClick={() => navigate(item.path)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sidebar-primary opacity-70 hover:opacity-100 transition-opacity w-full px-3 py-2"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
