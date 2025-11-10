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

import { Form, type FormInstance, Message } from '@arco-design/web-react';
import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import type {
  AgentTemplate,
  AgentTemplateCreateRequest,
  AgentTemplateUpdateRequest,
} from 'api-generate';
import { useCallback, useState } from 'react';
import {
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from '../card-template';

/**
 * Card template management logic Hook parameters interface
 */
export interface UseCardTemplateManagementLogicParams {
  refreshTable?: () => Promise<boolean>;
}

/**
 * Card template management logic Hook return value interface
 */
export interface UseCardTemplateManagementLogicReturn {
  // State
  modalVisible: boolean;
  editingTemplate: AgentTemplate | null;
  form: FormInstance;

  // Event handlers
  handleEdit: (template: AgentTemplate) => void;
  handleAdd: () => void;
  handleCancel: () => void;
  handleSubmit: (
    values: AgentTemplateCreateRequest | AgentTemplateUpdateRequest,
  ) => Promise<boolean>;
  handleDelete: (templateId: string) => Promise<boolean>;
}

/**
 * Card template management logic Hook
 * Provides all business logic for card template management page
 */
export const useCardTemplateManagementLogic = (
  refreshTable?: () => Promise<boolean>,
): UseCardTemplateManagementLogicReturn => {
  // Use management refresh Hook
  const { afterCreate, afterUpdate, afterDelete } =
    useManagementRefresh(refreshTable);

  const [form] = Form.useForm();
  const [editingTemplate, setEditingTemplate] = useState<AgentTemplate | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Delete template handler
  const handleDelete = useCallback(
    async (templateId: string) => {
      try {
        const success = await deleteTemplate(templateId);
        if (success) {
          // Refresh table after successful deletion
          const refreshResult = await afterDelete();
          if (!refreshResult.success && refreshResult.error) {
            // ✅ Correct: Use logger to record warning, pass complete error information
            const errorObj = refreshResult.error;
            logger.warn({
              message: 'Failed to refresh table after deletion',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
              },
              source: 'CardTemplate',
              component: 'handleDelete',
            });
          }
          return true;
        }
        return false;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error ? error.message : '删除失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [afterDelete],
  );

  // Create template handler
  const handleCreate = useCallback(
    async (values: AgentTemplateCreateRequest) => {
      try {
        const success = await createTemplate(values);
        if (success) {
          setModalVisible(false);
          form.resetFields();
          // Refresh table after successful creation
          const refreshResult = await afterCreate();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: 'Failed to refresh table after creation',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'CardTemplateManagement',
              component: 'handleCreate',
            });
          }
          return true;
        }
        return false;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error ? error.message : '创建失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [form, afterCreate],
  );

  // Update template handler
  const handleUpdate = useCallback(
    async (values: AgentTemplateUpdateRequest) => {
      if (!editingTemplate) {
        return false;
      }

      const targetId = editingTemplate._id ?? editingTemplate._id;

      if (!targetId) {
        Message.error('更新失败，缺少模板标识');
        return false;
      }

      // ✅ Use logger to record debug information (object destructuring parameters)
      logger.debug({
        message: 'Update template',
        data: {
          targetId,
          values,
        },
        source: 'useCardTemplate',
        component: 'handleUpdate',
      });

      try {
        const success = await updateTemplate({
          templateId: targetId,
          updateData: values,
        });
        if (success) {
          setModalVisible(false);
          setEditingTemplate(null);
          form.resetFields();
          // Refresh table after successful update
          const refreshResult = await afterUpdate();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: 'Failed to refresh table after update',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'CardTemplateManagement',
              component: 'handleUpdate',
            });
          }
          return true;
        }
        return false;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error ? error.message : '更新失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [editingTemplate, form, afterUpdate],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: AgentTemplateCreateRequest | AgentTemplateUpdateRequest) => {
      if (editingTemplate) {
        return handleUpdate(values as AgentTemplateUpdateRequest);
      }
      return handleCreate(values as AgentTemplateCreateRequest);
    },
    [editingTemplate, handleUpdate, handleCreate],
  );

  // Open edit modal
  const handleEdit = useCallback(
    (template: any) => {
      setEditingTemplate(template);
      form.setFieldsValue({
        ...template,
        agents: template?.agent_type ? [template?.agent_type] : undefined,
      });
      setModalVisible(true);
    },
    [form],
  );

  // Open add modal
  const handleAdd = useCallback(() => {
    setEditingTemplate(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  // Close modal
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingTemplate(null);
    form.resetFields();
  }, [form]);

  return {
    // State
    modalVisible,
    editingTemplate,
    form,

    // Event handlers
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
    handleDelete,
  };
};
