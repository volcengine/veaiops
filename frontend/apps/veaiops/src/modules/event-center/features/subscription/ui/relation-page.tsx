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

import { useSubscribeRelation } from '@/hooks/use-subscribe-relation';
import {
  type ModuleType,
  detectModuleTypeFromPath,
  getModuleConfig,
} from '@/types/module';
import { useLocation } from '@modern-js/runtime/router';
import { logger } from '@veaiops/utils';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { SubscribeRelationForm } from './relation-form';
import { SubscribeRelationTable } from './subscribe-relation-table/subscribe-relation-table';

interface SubscribeRelationPageProps {
  /** Module type, used to filter subscription relations */
  moduleType?: ModuleType;
  /** Page title */
  title?: string;
}

/**
 * Subscription relation management page
 * @description Provides event subscription relation management functionality, supports filtering by module type
 */
const SubscribeRelationPage: React.FC<SubscribeRelationPageProps> = ({
  moduleType,
  title,
}) => {
  const location = useLocation();

  // Automatically determine module type based on route
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

  // Use subscription relation management hook
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
   * Edit subscription relation
   */
  const handleEdit = (record: SubscribeRelationWithAttributes) => {
    // Edit subscription relation
    setEditingData(record);
    setFormVisible(true);
  };

  /**
   * Delete subscription relation
   */
  const handleDelete = async (id: string) => {
    await deleteSubscribeRelation(id);
  };

  /**
   * Create new subscription relation
   */
  const handleCreate = () => {
    // Create new subscription relation
    setEditingData(null);
    setFormVisible(true);
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (
    data: SubscribeRelationCreate | SubscribeRelationUpdate,
  ) => {
    try {
      if (editingData?._id) {
        // Edit mode
        return await updateSubscribeRelation({ id: editingData._id, data });
      } else {
        // Create mode
        return await createSubscribeRelation(data);
      }
    } catch (error: unknown) {
      // ✅ Note: Error has been handled in Hook, silent handling here is expected behavior
      // Use logger to record debug information (logger internally handles development environment check)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.debug({
        message: '表单提交错误（已在 Hook 中处理）',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'RelationPage',
        component: 'handleFormSubmit',
      });
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

  // Fetch subscription relation data when page loads
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

      {/* Subscription relation form drawer */}
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
