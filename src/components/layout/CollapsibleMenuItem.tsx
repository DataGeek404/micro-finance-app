
import React from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { SidebarSubmenu } from './SidebarSubmenu';

interface MenuItemProps {
  title: string;
  path: string;
  icon: LucideIcon;
}

interface CollapsibleMenuItemProps {
  title: string;
  icon: LucideIcon;
  items: MenuItemProps[];
  isExpanded: boolean;
  toggleMenu: () => void;
}

export function CollapsibleMenuItem({
  title,
  icon: Icon,
  items,
  isExpanded,
  toggleMenu,
}: CollapsibleMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={toggleMenu}>
        <Icon className="h-5 w-5" />
        <span>{title}</span>
        {isExpanded ? (
          <ChevronDown className="ml-auto h-4 w-4" />
        ) : (
          <ChevronRight className="ml-auto h-4 w-4" />
        )}
      </SidebarMenuButton>
      <SidebarSubmenu items={items} isExpanded={isExpanded} />
    </SidebarMenuItem>
  );
}
