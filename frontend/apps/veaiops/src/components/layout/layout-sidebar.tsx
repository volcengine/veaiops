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
// config/index.ts exports both layout and routes, importing via @/config would load both and cause circular dependency
import { layoutConfig } from '@/config/layout';
import type React from 'react';
import { AppSidebar } from '../navigation/app-sidebar';

interface LayoutSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  activeModule: string;
}

const LayoutSidebar: React.FC<LayoutSidebarProps> = ({
  collapsed,
  onCollapse,
  activeModule,
}) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-full z-10 transition-all ${
        layoutConfig.sidebar.transitionDuration
      } ${layoutConfig.sidebar.background} ${
        layoutConfig.sidebar.backdropFilter
      } ${layoutConfig.sidebar.borderRight} ${layoutConfig.sidebar.shadow} ${
        collapsed
          ? layoutConfig.sidebar.collapsedWidth
          : layoutConfig.sidebar.expandedWidth
      }`}
    >
      <AppSidebar
        collapsed={collapsed}
        onCollapse={onCollapse}
        activeModule={activeModule}
      />
    </aside>
  );
};

export { LayoutSidebar };
