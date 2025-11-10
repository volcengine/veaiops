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

/**
 * Card Template CRUD operations Hook
 * @description Card template create, update, delete operations
 */

import apiClient from '@/utils/api-client';
import { Form, Message } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type {
  AgentTemplate,
  AgentTemplateCreateRequest,
  AgentTemplateUpdateRequest,
} from 'api-generate';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Card Template CRUD Hook return value
 */
export interface UseCardTemplateCRUDReturn {
  // State
  form: FormInstance;
  editingTemplate: AgentTemplate | null;
  modalVisible: boolean;

  // State management
  setEditingTemplate: (template: AgentTemplate | null) => void;
  setModalVisible: (visible: boolean) => void;

  // CRUD operations
  createTemplate: (
    templateData: AgentTemplateCreateRequest,
  ) => Promise<boolean>;
  updateTemplate: (params: {
    templateId: string;
    updateData: AgentTemplateUpdateRequest;
  }) => Promise<boolean>;
  deleteTemplate: (templateId: string) => Promise<boolean>;

  // Business handlers
  handleEdit: (template: AgentTemplate) => void; // Only responsible for opening modal, no return value needed
  handleAdd: () => void; // Only responsible for opening modal, no return value needed
  handleCancel: () => void;
  handleDelete: (templateId: string) => Promise<boolean>;
  handleCreate: (values: AgentTemplateCreateRequest) => Promise<boolean>;
  handleUpdate: (values: AgentTemplateUpdateRequest) => Promise<boolean>;
  handleSubmit: (
    values: AgentTemplateCreateRequest | AgentTemplateUpdateRequest,
  ) => Promise<boolean>;
}

/**
 * Card Template CRUD Hook
 */
export const useCardTemplateCRUD = (): UseCardTemplateCRUDReturn => {
  // 🔍 Log: Hook execution entry
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  logger.info({
    message: '🟢 [useCardTemplateCRUD] Hook executed',
    data: {
      renderCount: renderCountRef.current,
      timestamp: Date.now(),
    },
    source: 'useCardTemplateCRUD',
    component: 'entry',
  });

  const [form] = Form.useForm();
  const [editingTemplate, setEditingTemplate] = useState<AgentTemplate | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  // 🔍 Log: Monitor modalVisible changes
  useEffect(() => {
    logger.info({
      message: '🔵 [useCardTemplateCRUD] modalVisible state changed',
      data: {
        modalVisible,
        hasEditingTemplate: Boolean(editingTemplate),
        editingTemplateId: editingTemplate?._id,
        timestamp: Date.now(),
        stack: new Error().stack?.split('\n').slice(1, 5).join('\n'), // Call stack
      },
      source: 'useCardTemplateCRUD',
      component: 'modalVisible-effect',
    });
  }, [modalVisible, editingTemplate]);

  // 🎯 CRUD operation functions
  /**
   * Create card template
   */
  const createTemplate = useCallback(
    async (templateData: AgentTemplateCreateRequest): Promise<boolean> => {
      try {
        const response =
          (await apiClient.agentTemplate.postApisV1ManagerEventCenterAgentTemplate(
            {
              requestBody: templateData,
            },
          )) as { code: number; data?: unknown; message?: string };

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          Message.success('卡片模版创建成功');
          return true;
        } else {
          throw new Error(response.message || '创建卡片模版失败');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '创建卡片模版失败';
        Message.error(errorMessage);
        return false;
      }
    },
    [],
  );

  /**
   * Update card template
   */
  interface UpdateTemplateParams {
    templateId: string;
    updateData: AgentTemplateUpdateRequest;
  }

  const updateTemplate = useCallback(
    async ({
      templateId,
      updateData,
    }: UpdateTemplateParams): Promise<boolean> => {
      try {
        const response =
          (await apiClient.agentTemplate.putApisV1ManagerEventCenterAgentTemplate(
            {
              agentTemplateId: templateId,
              requestBody: updateData,
            },
          )) as { code: number; message?: string };

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success('卡片模版更新成功');
          return true;
        }

        throw new Error(response.message || '更新卡片模版失败');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '更新卡片模版失败';
        Message.error(errorMessage);
        return false;
      }
    },
    [],
  );

  /**
   * Delete card template
   */
  const deleteTemplate = useCallback(
    async (templateId: string): Promise<boolean> => {
      try {
        const response =
          await apiClient.agentTemplate.deleteApisV1ManagerEventCenterAgentTemplate(
            {
              agentTemplateId: templateId,
            },
          );

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success('卡片模版删除成功');
          return true;
        }

        throw new Error(response.message || '删除卡片模版失败');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '删除卡片模版失败';
        Message.error(errorMessage);
        return false;
      }
    },
    [],
  );

  // 🎯 Business logic handlers
  const handleDelete = useCallback(
    async (templateId: string) => {
      try {
        const success = await deleteTemplate(templateId);
        return success;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '删除失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [deleteTemplate],
  );

  const handleCreate = useCallback(
    async (values: AgentTemplateCreateRequest) => {
      try {
        const success = await createTemplate(values);
        if (success) {
          setModalVisible(false);
          form.resetFields();
          return true;
        }
        return false;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '创建失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [createTemplate, form],
  );

  const handleUpdate = useCallback(
    async (values: AgentTemplateUpdateRequest) => {
      if (!editingTemplate || !editingTemplate._id) {
        Message.error('模版 ID 不能为空');
        return false;
      }

      try {
        const success = await updateTemplate({
          templateId: editingTemplate._id,
          updateData: values,
        });
        if (success) {
          setModalVisible(false);
          setEditingTemplate(null);
          form.resetFields();
          return true;
        }
        return false;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '更新失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [editingTemplate, updateTemplate, form],
  );

  const handleSubmit = useCallback(
    async (values: AgentTemplateCreateRequest | AgentTemplateUpdateRequest) => {
      if (editingTemplate) {
        return await handleUpdate(values as AgentTemplateUpdateRequest);
      } else {
        return await handleCreate(values as AgentTemplateCreateRequest);
      }
    },
    [editingTemplate, handleUpdate, handleCreate],
  );

  const handleEdit = useCallback(
    (template: AgentTemplate) => {
      logger.info({
        message: '🟢 [useCardTemplateCRUD] handleEdit called',
        data: {
          timestamp: Date.now(),
          templateId: template._id,
          stack: new Error().stack?.split('\n').slice(1, 8).join('\n'), // Call stack
        },
        source: 'useCardTemplateCRUD',
        component: 'handleEdit',
      });
      setEditingTemplate(template);
      // ✅ Fix: Convert backend agent_type field to form agents array
      form.setFieldsValue({
        ...template,
        agents: template?.agent_type ? [template?.agent_type] : undefined,
      });
      setModalVisible(true);
    },
    [form],
  );

  const handleAdd = useCallback(() => {
    logger.info({
      message: '🟢 [useCardTemplateCRUD] handleAdd called',
      data: {
        timestamp: Date.now(),
        stack: new Error().stack?.split('\n').slice(1, 8).join('\n'), // Call stack
      },
      source: 'useCardTemplateCRUD',
      component: 'handleAdd',
    });
    setEditingTemplate(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleCancel = useCallback(() => {
    logger.info({
      message: '🟢 [useCardTemplateCRUD] handleCancel called',
      data: {
        timestamp: Date.now(),
      },
      source: 'useCardTemplateCRUD',
      component: 'handleCancel',
    });
    setModalVisible(false);
    setEditingTemplate(null);
    form.resetFields();
  }, [form]);

  return {
    form,
    editingTemplate,
    modalVisible,
    setEditingTemplate,
    setModalVisible,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    handleEdit,
    handleAdd,
    handleCancel,
    handleDelete,
    handleCreate,
    handleUpdate,
    handleSubmit,
  };
};
