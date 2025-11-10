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

import { AIAgentIcon } from '@/components/global-guide';
import { layoutConfig } from '@/config/layout';
import type React from 'react';

interface SidebarHeaderProps {
  collapsed: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ collapsed }) => {
  return (
    <div className="flex items-center p-4 border-b border-white/10">
      {/* Logo area */}
      <div className="flex items-center space-x-3">
        <div
          className={`${layoutConfig.logo.gradient} ${layoutConfig.logo.sidebar.size} rounded-lg flex items-center justify-center`}
        >
          <AIAgentIcon size={20} color="#ffffff" />
        </div>
        {!collapsed && (
          <span
            id="logo-text"
            className="text-lg font-bold text-text transition-all duration-200"
          >
            veaiops
          </span>
        )}
      </div>
    </div>
  );
};

export { SidebarHeader };
