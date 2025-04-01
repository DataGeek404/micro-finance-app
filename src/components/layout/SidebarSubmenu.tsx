
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';

interface MenuItemProps {
  title: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarSubmenuProps {
  items: MenuItemProps[];
  isExpanded: boolean;
}

export function SidebarSubmenu({ items, isExpanded }: SidebarSubmenuProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isExpanded) return null;

  return (
    <SidebarMenuSub>
      {items.map((item) => (
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
  );
}
