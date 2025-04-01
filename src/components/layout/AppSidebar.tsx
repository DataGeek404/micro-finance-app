import React, { useState, useEffect } from 'react';
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
import { DollarSign, LogOut, Settings, BadgeDollarSign, Wallet, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    loans: location.pathname.includes('/loans'),
    payroll: location.pathname.includes('/payroll'),
    expenses: location.pathname.includes('/expenses'),
    settings: location.pathname.includes('/settings'),
  });

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setDrawerOpen(false);
    }
  }, [location.pathname, isMobile]);

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

  // Mobile drawer menu
  const MobileMenu = () => {
    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[85%] max-h-[85vh]">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="flex gap-2 items-center">
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Muchiri LoanLight</span>
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="overflow-y-auto flex-1 p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Main Menu</h3>
                <div className="space-y-1">
                  {mainMenuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Loans</h3>
                <div className="space-y-1">
                  {loanMenuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Payroll</h3>
                <div className="space-y-1">
                  {payrollMenuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Expenses</h3>
                <div className="space-y-1">
                  {expenseMenuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Other</h3>
                <div className="space-y-1">
                  {otherMenuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Settings</h3>
                <div className="space-y-1">
                  {settingsMenuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <DrawerFooter className="border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => { handleLogout(); setDrawerOpen(false); }}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Close menu</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <>
      {/* Mobile drawer menu */}
      <MobileMenu />
      
      {/* Regular sidebar for larger screens */}
      <Sidebar>
        <SidebarHeader className="p-4 flex items-center">
          <div className="flex gap-2 items-center">
            <DollarSign className="h-6 w-6 text-sidebar-primary" />
            <span className="font-bold text-xl text-sidebar-primary hidden sm:inline">Muchiri LoanLight</span>
            <span className="font-bold text-xl text-sidebar-primary sm:hidden">LoanLight</span>
          </div>
          <div className="ml-auto">
            <SidebarTrigger aria-label="Toggle sidebar menu" />
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
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
