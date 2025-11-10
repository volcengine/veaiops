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

import { Message } from '@arco-design/web-react';
import { useState } from 'react';
import { importProjects } from '../../../system/features/project/lib/api';
import { ProjectImportDrawer } from '../../../system/features/project/ui/project-import-drawer';
import type {
  UseProjectImportConfig,
  UseProjectImportReturn,
} from './types/drawer-management';

/**
 * Project import Hook
 * Provides complete functionality for project import, including state management, API calls, and UI rendering
 */
export const useProjectImport = (
  config: UseProjectImportConfig = {},
): UseProjectImportReturn => {
  const { onSuccess } = config;

  // State management
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Open project import drawer
   */
  const open = () => {
    setVisible(true);
  };

  /**
   * Close project import drawer
   */
  const close = () => {
    setVisible(false);
  };

  /**
   * Handle project import
   */
  const handleImport = async (file: File): Promise<boolean> => {
    try {
      setLoading(true);

      // Use project import API
      const result = await importProjects(file);
      const { success } = result;

      if (!success && result.message) {
        Message.error(result.message);
      }

      if (success) {
        Message.success('项目导入成功');
        setVisible(false);
        // Trigger project list refresh
        setRefreshTrigger((prev) => prev + 1);
        // Execute success callback
        onSuccess?.();
      } else {
        Message.error('项目导入失败，请重试');
      }

      return success;
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || '项目导入失败，请重试';
      Message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render project import drawer
   */
  const renderDrawer = () => {
    return (
      <ProjectImportDrawer
        visible={visible}
        loading={loading}
        onImport={handleImport}
        onClose={close}
      />
    );
  };

  return {
    visible,
    loading,
    refreshTrigger,
    open,
    close,
    handleImport,
    renderDrawer,
  };
};
