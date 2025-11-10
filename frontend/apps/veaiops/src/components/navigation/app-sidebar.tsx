// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//
import { layoutConfig } from '@/config/layout';
import { useLocation } from '@modern-js/runtime/router';
import type React from 'react';
import { useEffect, useState } from 'react';
import { getIconPath } from '../utils';
import { SidebarHeader } from './sidebar-header';
import { getMenuItems } from './sidebar-menu-config';
import { SidebarMenuItem } from './sidebar-menu-item';

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  activeModule: string;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onCollapse,
  activeModule,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const location = useLocation();

  const currentMenuItems = getMenuItems(activeModule);

  // Automatically set active menu item based on current path
  useEffect(() => {
    if (currentMenuItems.length === 0) {
      return;
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);

    if (pathSegments.length >= 2) {
      const [module, subPath] = pathSegments;

      // Ensure current module matches
      if (module === activeModule) {
        // Check if subPath is in current menu items
        const menuKeys = currentMenuItems.map((item) => item.key);
        if (menuKeys.includes(subPath)) {
          setSelectedKeys([subPath]);
        } else {
          // If subPath is not in menu, default to first menu item
          setSelectedKeys([currentMenuItems[0].key]);
        }
      }
    } else if (pathSegments.length === 1) {
      // If only module path, default to first menu item
      setSelectedKeys([currentMenuItems[0].key]);
    } else if (pathSegments.length === 0) {
      // If root path, also default to first menu item
      setSelectedKeys([currentMenuItems[0].key]);
    }
  }, [location.pathname, activeModule, currentMenuItems]);

  // Initialize selected state
  useEffect(() => {
    if (currentMenuItems.length > 0 && selectedKeys.length === 0) {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      if (pathSegments.length >= 2 && pathSegments[0] === activeModule) {
        const subPath = pathSegments[1];
        const menuKeys = currentMenuItems.map((item) => item.key);
        if (menuKeys.includes(subPath)) {
          setSelectedKeys([subPath]);
        } else {
          setSelectedKeys([currentMenuItems[0].key]);
        }
      } else {
        setSelectedKeys([currentMenuItems[0].key]);
      }
    }
  }, [currentMenuItems, activeModule, location.pathname, selectedKeys.length]);

  const handleMenuClick = (key: string) => {
    setSelectedKeys([key]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar header */}
      <SidebarHeader collapsed={collapsed} />

      {/* Sidebar menu */}
      <nav className="flex-1 py-4">
        <div id="sidebar-menu-container" className="space-y-2 px-[5px]">
          {currentMenuItems.map((item) => {
            const isSelected = selectedKeys.includes(item.key);

            return (
              <SidebarMenuItem
                key={item.key}
                itemKey={item.key}
                title={item.title}
                icon={item.icon}
                collapsed={collapsed}
                isSelected={isSelected}
                onClick={handleMenuClick}
                module={activeModule}
              />
            );
          })}
        </div>
      </nav>

      {/* Bottom collapse button */}
      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          className={`w-full p-1 rounded hover:bg-white/10 transition-colors flex items-center ${
            collapsed ? 'justify-center' : 'justify-center space-x-3'
          }`}
          onClick={() => onCollapse(!collapsed)}
          aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          <svg
            className={`${layoutConfig.icons.sidebarToggle} text-textSecondary`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-label="切换侧边栏"
          >
            <title>切换侧边栏</title>
            <path
              d={getIconPath(
                collapsed ? 'panel-left-open' : 'panel-left-close',
              )}
            />
          </svg>
          {!collapsed && (
            <span className="text-sm text-textSecondary">
              {collapsed ? '展开' : '收起'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export { AppSidebar };
