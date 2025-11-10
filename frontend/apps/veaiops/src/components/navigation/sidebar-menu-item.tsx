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

import { Tooltip } from '@arco-design/web-react';
import { useNavigate } from '@modern-js/runtime/router';
import type React from 'react';
import { getIconPath } from '../utils';

interface SidebarMenuItemProps {
  itemKey: string;
  title: string;
  icon: string;
  collapsed: boolean;
  isSelected: boolean;
  onClick: (key: string) => void;
  module: string; // Add module parameter
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  itemKey,
  title,
  icon,
  collapsed,
  isSelected,
  onClick,
  module,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Build route path
    const routePath = `/${module}/${itemKey}`;

    // Navigate to corresponding route
    navigate(routePath);

    // Call original click handler
    onClick(itemKey);
  };

  const iconElement = (
    <div
      className="flex items-center flex-shrink-0"
      style={{ width: '20px', height: '20px' }}
    >
      <svg
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d={getIconPath(icon)} />
      </svg>
    </div>
  );

  const menuItem = (
    <button
      type="button"
      className={`sidebar-menu-item w-full flex items-center px-4 rounded-lg transition-colors border-none cursor-pointer ${
        collapsed ? 'justify-center' : 'space-x-3'
      }`}
      style={{
        height: collapsed ? 80 : 50,
        backgroundColor: isSelected
          ? 'rgba(24, 144, 255, 0.15)'
          : 'transparent',
        color: isSelected
          ? 'var(--color-primary)'
          : 'var(--color-text-secondary)',
        border: isSelected
          ? '1px solid rgba(24, 144, 255, 0.3)'
          : '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
          e.currentTarget.style.color = 'var(--color-text-base)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }
      }}
      onClick={handleClick}
      aria-label={title}
    >
      {iconElement}
      <span
        className={`menu-text transition-all duration-200 overflow-hidden ${
          collapsed
            ? 'opacity-0 transform -translate-x-2 w-0'
            : 'opacity-100 transform translate-x-0 w-auto'
        }`}
      >
        {title}
      </span>
    </button>
  );

  return collapsed ? (
    <Tooltip content={title} position="right">
      {menuItem}
    </Tooltip>
  ) : (
    menuItem
  );
};

export { SidebarMenuItem };
