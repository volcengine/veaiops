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

import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';
import { useMetricTemplateCrud } from './use-crud';
import { useMetricTemplateForm } from './use-form';

/**
 * Metric template management logic Hook
 * Combines various sub Hooks to provide complete template management functionality
 */
export const useMetricTemplateManagementLogic = (
  refreshTable?: () => Promise<boolean>,
) => {
  // Use management refresh Hook to get refresh callback function
  const { afterCreate, afterUpdate, afterDelete } =
    useManagementRefresh(refreshTable);

  // Use CRUD operations Hook
  const {
    createTemplate,
    updateTemplate,
    deleteTemplate: originalDeleteTemplate,
  } = useMetricTemplateCrud();

  // Use form handling Hook
  const {
    form,
    editingTemplate,
    modalVisible,
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
  } = useMetricTemplateForm();

  /**
   * Handle modal confirmation
   */
  const handleModalOk = useCallback(async () => {
    return handleSubmit(async (completeValues) => {
      let result;
      if (editingTemplate?._id) {
        // Update mode
        result = await updateTemplate({
          templateId: editingTemplate._id,
          data: completeValues,
        });
        // Refresh table after successful update
        if (result) {
          const refreshResult = await afterUpdate();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: 'Failed to refresh table after update',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'MetricTemplateManagement',
              component: 'handleSave',
            });
          }
        }
      } else {
        // Create mode
        result = await createTemplate(completeValues);
        // Refresh table after successful create
        if (result) {
          const refreshResult = await afterCreate();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: 'Failed to refresh table after create',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'MetricTemplateManagement',
              component: 'handleSave',
            });
          }
        }
      }
      return result;
    });
  }, [
    handleSubmit,
    editingTemplate,
    updateTemplate,
    createTemplate,
    afterCreate,
    afterUpdate,
  ]);

  /**
   * Wrap delete method, add refresh logic
   */
  const deleteTemplate = useCallback(
    async (templateId: string): Promise<boolean> => {
      const result = await originalDeleteTemplate(templateId);
      // Refresh table after successful delete
      if (result) {
        const refreshResult = await afterDelete();
        if (!refreshResult.success && refreshResult.error) {
          logger.warn({
            message: 'Failed to refresh table after delete',
            data: {
              error: refreshResult.error.message,
              stack: refreshResult.error.stack,
              errorObj: refreshResult.error,
            },
            source: 'MetricTemplateManagement',
            component: 'deleteTemplate',
          });
        }
      }
      return result;
    },
    [originalDeleteTemplate, afterDelete],
  );

  return {
    // State
    editingTemplate,
    modalVisible,
    form,

    // Operation methods
    createTemplate,
    updateTemplate,
    deleteTemplate,
    handleEdit,
    handleAdd,
    handleModalOk,
    handleModalCancel: handleCancel,
  };
};
