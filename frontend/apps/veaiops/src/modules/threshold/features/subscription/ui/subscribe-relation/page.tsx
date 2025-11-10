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

import { useSubscribeRelation } from '@/hooks';
import {
  type ModuleType,
  detectModuleTypeFromPath,
  getModuleConfig,
} from '@/types/module';
import { useLocation } from '@modern-js/runtime/router';
import { logger } from '@veaiops/utils';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import SubscribeRelationForm from './form';
import { SubscribeRelationTable } from './table';

interface SubscribeRelationPageProps {
  /** Module type, used to filter subscribe relations */
  moduleType?: ModuleType;
  /** Page title */
  title?: string;
}

/**
 * Subscribe relation management page
 * @description Provides event subscribe relation management functionality, supports filtering by module type
 */
const SubscribeRelationPage: React.FC<SubscribeRelationPageProps> = ({
  moduleType,
  title,
}) => {
  const location = useLocation();

  // Automatically detect module type based on route
  const detectedModuleType = useMemo(() => {
    if (moduleType) {
      return moduleType;
    }

    return detectModuleTypeFromPath(location.pathname);
  }, [moduleType, location.pathname]);

  // Set page title based on module type
  const pageTitle = useMemo(() => {
    if (title) {
      return title;
    }

    const config = getModuleConfig(detectedModuleType);
    return config.pageTitle;
  }, [title, detectedModuleType]);

  // Use subscribe relation management hook
  const {
    loading,
    fetchSubscribeRelations,
    createSubscribeRelation,
    updateSubscribeRelation,
    deleteSubscribeRelation,
  } = useSubscribeRelation(detectedModuleType);

  // Form drawer state
  const [formVisible, setFormVisible] = useState(false);
  const [editingData, setEditingData] =
    useState<SubscribeRelationWithAttributes | null>(null);
  /**
   * Edit subscribe relation
   */
  const handleEdit = async (
    record: SubscribeRelationWithAttributes,
  ): Promise<boolean> => {
    // Edit subscribe relation
    setEditingData(record);
    setFormVisible(true);
    return true; // Edit operation successful
  };

  /**
   * Delete subscribe relation
   */
  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      await deleteSubscribeRelation(id);
      return true; // Delete operation successful
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage =
        errorObj.message || 'Failed to delete subscribe relation';
      logger.error({
        message: 'Failed to delete subscribe relation',
        data: {
          error: errorMessage,
          stack: errorObj.stack,
          errorObj,
          id,
        },
        source: 'SubscribeRelationPage',
        component: 'handleDelete',
      });
      return false; // Delete operation failed
    }
  };

  /**
   * Create new subscribe relation
   */
  const handleCreate = async (): Promise<boolean> => {
    // Create new subscribe relation
    setEditingData(null);
    setFormVisible(true);
    return true; // Create operation successful
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (data: any) => {
    try {
      if (editingData?._id) {
        // Edit mode
        return await updateSubscribeRelation({ id: editingData._id, data });
      } else {
        // Create mode
        return await createSubscribeRelation(data);
      }
    } catch (error) {
      // Error already handled in Hook, silently handle here
      return false;
    }
  };

  /**
   * Close form drawer
   */
  const handleFormClose = () => {
    setFormVisible(false);
    setEditingData(null);
  };

  // Fetch subscribe relation data when page loads
  useEffect(() => {
    fetchSubscribeRelations();
  }, [fetchSubscribeRelations]);

  return (
    <>
      <SubscribeRelationTable
        moduleType={detectedModuleType}
        title={pageTitle}
        showModuleTypeColumn={true}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => fetchSubscribeRelations()}
        loading={loading}
      />

      {/* Subscribe relation form drawer */}
      <SubscribeRelationForm
        visible={formVisible}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editData={editingData}
        moduleType={detectedModuleType}
      />
    </>
  );
};

export default SubscribeRelationPage;
