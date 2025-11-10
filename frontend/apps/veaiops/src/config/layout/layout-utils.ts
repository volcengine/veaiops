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

import { layoutConfig, moduleConfig } from './layout-config';

/**
 * Layout utility functions
 */
export const layoutUtils = {
  // Get module default path
  getModuleDefaultPath: (module: string): string => {
    return (
      moduleConfig.defaultPaths[
        module as keyof typeof moduleConfig.defaultPaths
      ] || '/'
    );
  },

  // Check if module is active
  isActiveModule: (currentPath: string, module: string): boolean => {
    return currentPath.startsWith(`/${module}`);
  },

  // Get sidebar width class name
  getSidebarWidthClass: (collapsed: boolean): string => {
    return collapsed
      ? layoutConfig.sidebar.collapsedWidth
      : layoutConfig.sidebar.expandedWidth;
  },

  // Get main content margin class name
  getMainMarginClass: (collapsed: boolean): string => {
    return collapsed ? 'ml-16' : 'ml-60';
  },
};
