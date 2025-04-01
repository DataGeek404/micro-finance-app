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
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { DollarSign, LogOut, Settings, BadgeDollarSign, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

// Import our components and data
import { SimpleMenuItem } from './SimpleMenuItem';
import { CollapsibleMenuItem } from './CollapsibleMenuItem';
import { 
  mainMenuItems, 
  loanMenuItems, 
  payrollMenuItems, 
  expenseMenuItems,
  settingsMenuItems, 
  otherMenuItems 
} from './sidebar-data';

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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              {/* Main Menu Items */}
              {mainMenuItems.map((item) => (
                <SimpleMenuItem
                  key={item.path}
                  title={item.title}
                  path={item.path}
                  icon={item.icon}
                />
              ))}
              
              {/* Loans Menu with Submenu */}
              <CollapsibleMenuItem
                title="Loans"
                icon={DollarSign}
                items={loanMenuItems}
                isExpanded={expandedMenus.loans}
                toggleMenu={() => toggleMenu('loans')}
              />

              {/* Payroll Menu with Submenu */}
              <CollapsibleMenuItem
                title="Payroll"
                icon={BadgeDollarSign}
                items={payrollMenuItems}
                isExpanded={expandedMenus.payroll}
                toggleMenu={() => toggleMenu('payroll')}
              />

              {/* Expenses Menu with Submenu */}
              <CollapsibleMenuItem
                title="Expenses"
                icon={Wallet}
                items={expenseMenuItems}
                isExpanded={expandedMenus.expenses}
                toggleMenu={() => toggleMenu('expenses')}
              />

              {/* Other Menu Items */}
              {otherMenuItems.map((item) => (
                <SimpleMenuItem
                  key={item.path}
                  title={item.title}
                  path={item.path}
                  icon={item.icon}
                />
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
              <CollapsibleMenuItem
                title="Settings"
                icon={Settings}
                items={settingsMenuItems}
                isExpanded={expandedMenus.settings}
                toggleMenu={() => toggleMenu('settings')}
              />
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
