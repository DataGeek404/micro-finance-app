
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';

interface SimpleMenuItemProps {
  title: string;
  path: string;
  icon: LucideIcon;
}

export function SimpleMenuItem({ title, path, icon: Icon }: SimpleMenuItemProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive(path)}
        onClick={() => navigate(path)}
      >
        <Icon className="h-5 w-5" />
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
