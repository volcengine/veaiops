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

import type { InformStrategyCreate, InformStrategyUpdate } from 'api-generate';
import type React from 'react';

/**
 * Project import Hook return value type
 */
export interface UseProjectImportReturn {
  visible: boolean;
  loading: boolean;
  refreshTrigger: number;
  open: () => void;
  close: () => void;
  handleImport: (file: File) => Promise<boolean>;
  renderDrawer: () => React.ReactNode;
}

/**
 * Strategy create Hook return value type
 */
export interface UseStrategyCreateReturn {
  visible: boolean;
  refreshTrigger: number;
  open: () => void;
  close: () => void;
  handleCreate: (
    values: InformStrategyCreate | InformStrategyUpdate,
  ) => Promise<boolean>;
  renderDrawer: () => React.ReactNode;
}

/**
 * Drawer management Hook return value type
 */
export interface UseDrawerManagementReturn {
  // Project import related
  projectImportVisible: boolean;
  projectImportLoading: boolean;
  projectRefreshTrigger: number;
  openProjectImport: () => void;
  closeProjectImport: () => void;
  handleProjectImport: (file: File) => Promise<boolean>;

  // Strategy create related
  strategyCreateVisible: boolean;
  strategyRefreshTrigger: number;
  openStrategyCreate: () => void;
  closeStrategyCreate: () => void;
  handleStrategyCreate: (
    values: InformStrategyCreate | InformStrategyUpdate,
  ) => Promise<boolean>;

  // Render components
  renderProjectImportDrawer: () => React.ReactNode;
  renderStrategyCreateDrawer: () => React.ReactNode;

  // Tooltip state
  showProjectTooltip: boolean;
  showStrategyTooltip: boolean;
  hideProjectTooltip: () => void;
  hideStrategyTooltip: () => void;
}

/**
 * Project import Hook configuration
 */
export interface UseProjectImportConfig {
  /**
   * Callback after successful project import
   */
  onSuccess?: () => void;
}

/**
 * Strategy create Hook configuration
 */
export interface UseStrategyCreateConfig {
  /**
   * Callback after successful strategy creation
   */
  onSuccess?: () => void;

  /**
   * Drawer width, default is 800px
   */
  width?: number;
}

/**
 * Drawer management Hook configuration
 */
export interface UseDrawerManagementConfig {
  /**
   * Callback after successful project import
   */
  onProjectImportSuccess?: () => void;

  /**
   * Callback after successful strategy creation
   */
  onStrategyCreateSuccess?: () => void;
}
