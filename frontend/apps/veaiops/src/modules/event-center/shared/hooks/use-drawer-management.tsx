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

import { useState } from 'react';
import type {
  UseDrawerManagementConfig,
  UseDrawerManagementReturn,
} from './types/drawer-management';
import { useProjectImport } from './use-project-import';
import { useStrategyCreate } from './use-strategy-create';

/**
 * Drawer management Hook
 * Combines project import and strategy creation functionality, provides unified interface
 */
export const useDrawerManagement = (
  config: UseDrawerManagementConfig = {},
): UseDrawerManagementReturn => {
  const { onProjectImportSuccess, onStrategyCreateSuccess } = config;

  // Tooltip state management
  const [showProjectTooltip, setShowProjectTooltip] = useState(false);
  const [showStrategyTooltip, setShowStrategyTooltip] = useState(false);

  // Use project import Hook
  const projectImport = useProjectImport({
    onSuccess: () => {
      setShowProjectTooltip(true);
      onProjectImportSuccess?.();
    },
  });

  // Use strategy create Hook - Use smaller width (same as project import drawer)
  const strategyCreate = useStrategyCreate({
    onSuccess: () => {
      setShowStrategyTooltip(true);
      onStrategyCreateSuccess?.();
    },
    width: 520, // Same width as project import drawer
  });

  return {
    // Project import related
    projectImportVisible: projectImport.visible,
    projectImportLoading: projectImport.loading,
    projectRefreshTrigger: projectImport.refreshTrigger,
    openProjectImport: projectImport.open,
    closeProjectImport: projectImport.close,
    handleProjectImport: projectImport.handleImport,

    // Strategy create related
    strategyCreateVisible: strategyCreate.visible,
    strategyRefreshTrigger: strategyCreate.refreshTrigger,
    openStrategyCreate: strategyCreate.open,
    closeStrategyCreate: strategyCreate.close,
    handleStrategyCreate: strategyCreate.handleCreate,

    // Render components
    renderProjectImportDrawer: projectImport.renderDrawer,
    renderStrategyCreateDrawer: strategyCreate.renderDrawer,

    // Tooltip state
    showProjectTooltip,
    showStrategyTooltip,
    hideProjectTooltip: () => setShowProjectTooltip(false),
    hideStrategyTooltip: () => setShowStrategyTooltip(false),
  };
};

export default useDrawerManagement;
