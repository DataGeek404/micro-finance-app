
import React from 'react';
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
} from '@/components/ui/sidebar';
import {
  BarChart3,
  Users,
  DollarSign,
  Home,
  Building2,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

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
    {
      title: 'Loans',
      path: '/loans',
      icon: DollarSign,
    },
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

  const settingsMenuItems = [
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
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
                    active={isActive(item.path)}
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
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    active={isActive(item.path)}
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
