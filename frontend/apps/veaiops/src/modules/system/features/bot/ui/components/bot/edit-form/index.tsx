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

import { Form, Message } from '@arco-design/web-react';
import {
  BOT_MESSAGES,
  type BotUpdateRequest,
  type ExtendedBot,
} from '@bot/lib';
import { logger } from '@veaiops/utils';
import { VolcCfgPayload } from 'api-generate';
import type React from 'react';
import { useEffect, useState } from 'react';
import { BaseConfig, ChatOpsConfig, FormActions } from './sections';

interface BotEditFormProps {
  bot: ExtendedBot;
  onSubmit: (values: BotUpdateRequest) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Bot edit form component
 *
 * Split description:
 * - sections/base-config.tsx: Base configuration section (enterprise collaboration tool, App ID, App Secret)
 * - sections/chat-ops-config.tsx: ChatOps extended configuration section (LLM configuration, knowledge base configuration)
 * - sections/form-actions.tsx: Action buttons section (cancel, update bot)
 * - index.tsx: Main entry component, responsible for assembly and rendering
 *
 * Corresponds to origin/feat/web-v2 branch implementation, ensuring functional consistency
 */
export const BotEditForm: React.FC<BotEditFormProps> = ({
  bot,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  // Password visibility state management
  const [showSecrets, setShowSecrets] = useState({
    secret: false,
    ak: false,
    sk: false,
    api_key: false,
  });

  // ChatOps advanced configuration toggle (corresponds to origin/feat/web-v2: check if name or ak exists)
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(
    Boolean(bot?.agent_cfg?.name || bot?.volc_cfg?.ak),
  );

  // Knowledge base collection state management
  // Corresponds to origin/feat/web-v2: if no knowledge base collection, initialize as [''] (array with one empty string)
  const [kbCollections, setKbCollections] = useState<string[]>(() => {
    if (
      bot?.volc_cfg?.extra_kb_collections &&
      bot.volc_cfg.extra_kb_collections.length > 0
    ) {
      return bot.volc_cfg.extra_kb_collections;
    }
    return [''];
  });

  // Toggle password visibility
  const toggleSecretVisibility = (
    field: 'secret' | 'ak' | 'sk' | 'api_key',
  ) => {
    setShowSecrets((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Knowledge base collection management (corresponds to origin/feat/web-v2 branch implementation, synchronize form values)
  const addKbCollection = () => {
    setKbCollections((prev) => [...prev, '']);
  };

  const removeKbCollection = (index: number) => {
    const newCollections = kbCollections.filter((_, i) => i !== index);
    setKbCollections(newCollections);
    // Synchronize form values (corresponds to origin/feat/web-v2 branch implementation)
    const currentValues = form.getFieldsValue();
    form.setFieldsValue({
      ...currentValues,
      volc_cfg: {
        ...(currentValues.volc_cfg as BotUpdateRequest['volc_cfg']),
        extra_kb_collections: newCollections,
      },
    });
  };

  const updateKbCollection = (index: number, value: string) => {
    const newCollections = [...kbCollections];
    newCollections[index] = value;
    setKbCollections(newCollections);
    // Synchronize form values (corresponds to origin/feat/web-v2 branch implementation)
    const currentValues = form.getFieldsValue();
    form.setFieldsValue({
      ...currentValues,
      volc_cfg: {
        ...(currentValues.volc_cfg as BotUpdateRequest['volc_cfg']),
        extra_kb_collections: newCollections,
      },
    });
  };

  useEffect(() => {
    if (bot) {
      // Extract knowledge base collections from bot data, use default value if none (corresponds to origin/feat/web-v2)
      const initialKbCollections =
        bot.volc_cfg?.extra_kb_collections &&
        bot.volc_cfg.extra_kb_collections.length > 0
          ? bot.volc_cfg.extra_kb_collections
          : [''];

      setKbCollections(initialKbCollections);

      // Check if ChatOps configuration already exists (corresponds to origin/feat/web-v2: check if name or ak exists)
      const hasChatOpsConfig = Boolean(bot.agent_cfg?.name || bot.volc_cfg?.ak);
      setShowAdvancedConfig(hasChatOpsConfig);

      // Set form initial values (corresponds to origin/feat/web-v2 branch implementation)
      const formValues: Partial<BotUpdateRequest> & {
        channel?: string;
        bot_id?: string;
      } = {
        channel: bot.channel, // Used for display and Form.useWatch
        bot_id: bot.bot_id || '', // Used for display and Form.useWatch, empty string default value
        secret: '', // Explicitly assign empty string to avoid type errors
        webhook_urls: bot.webhook_urls,
      };

      // Only set these fields when ChatOps configuration is enabled (corresponds to origin/feat/web-v2)
      if (hasChatOpsConfig) {
        formValues.volc_cfg = {
          ak: '', // Explicitly assign empty string (corresponds to origin/feat/web-v2)
          sk: '', // Explicitly assign empty string (corresponds to origin/feat/web-v2)
          tos_region:
            (bot.volc_cfg?.tos_region as VolcCfgPayload.tos_region) ||
            VolcCfgPayload.tos_region.CN_BEIJING,
          network_type:
            (bot.volc_cfg?.network_type as VolcCfgPayload.network_type) ||
            VolcCfgPayload.network_type.INTERNAL,
          extra_kb_collections: initialKbCollections,
        };
        formValues.agent_cfg = {
          name: bot.agent_cfg?.name || '',
          embedding_name: bot.agent_cfg?.embedding_name || '',
          api_base:
            bot.agent_cfg?.api_base ||
            'https://ark.cn-beijing.volces.com/api/v3',
          api_key: '', // Explicitly assign empty string (corresponds to origin/feat/web-v2)
        };
      }

      form.setFieldsValue(formValues);
    }
  }, [bot, form]);

  /**
   * Form value type definition
   * Why use Record<string, unknown>:
   * - Form.useForm() returns dynamic form value types that cannot be fully inferred
   * - Form fields include: bot_id, secret, channel, webhook_urls, volc_cfg, agent_cfg
   * - Need to convert form values to BotUpdateRequest through type conversion
   */
  /**
   * Form submission handler
   * Corresponds to origin/feat/web-v2 branch implementation, ensuring functional consistency
   *
   * Processing logic:
   * 1. Filter empty knowledge base collections
   * 2. Deep intercept empty values: if secret fields are empty (empty string or null), set to undefined to avoid overwriting original values
   * 3. Only submit volc_cfg or agent_cfg when all required fields exist
   */
  const handleSubmit = async (
    values: Record<string, unknown>,
  ): Promise<boolean> => {
    try {
      // Filter empty knowledge base collections
      const filteredKbCollections = kbCollections.filter(
        (collection) => collection.trim() !== '',
      );

      // Deep intercept: if secret fields are empty (empty string or null), remove from submission data to avoid overwriting original values
      // Backend logic: empty values preserve original configuration, only non-empty values will be updated
      // Important: All required fields of AgentCfgPayload and VolcCfgPayload must be provided, otherwise backend will error
      // Solution: Only submit agent_cfg or volc_cfg when all required fields have values
      const submitData: BotUpdateRequest = {
        ...values,
        // Handle secret: do not submit if empty string or undefined, preserve original value
        secret:
          values.secret && String(values.secret).trim()
            ? (values.secret as string)
            : undefined,
      } as BotUpdateRequest;

      // Handle volc_cfg: only submit when all required fields exist
      // Required fields: tos_region (ak and sk are Optional, can be empty)
      if ((values.volc_cfg as BotUpdateRequest['volc_cfg'])?.tos_region) {
        submitData.volc_cfg = {
          ...(values.volc_cfg as BotUpdateRequest['volc_cfg']),
          // Set ak and sk to undefined when empty string, backend will preserve original value
          ak:
            (values.volc_cfg as BotUpdateRequest['volc_cfg'])?.ak &&
            String((values.volc_cfg as BotUpdateRequest['volc_cfg']).ak).trim()
              ? (values.volc_cfg as BotUpdateRequest['volc_cfg']).ak
              : undefined,
          sk:
            (values.volc_cfg as BotUpdateRequest['volc_cfg'])?.sk &&
            String((values.volc_cfg as BotUpdateRequest['volc_cfg']).sk).trim()
              ? (values.volc_cfg as BotUpdateRequest['volc_cfg']).sk
              : undefined,
          extra_kb_collections: filteredKbCollections,
          // Ensure required fields exist
          tos_region: (values.volc_cfg as BotUpdateRequest['volc_cfg'])
            .tos_region,
          network_type:
            (values.volc_cfg as BotUpdateRequest['volc_cfg']).network_type ||
            VolcCfgPayload.network_type.INTERNAL,
        };
      } else {
        // If no volc_cfg or missing required fields, do not submit (backend will preserve original value)
        submitData.volc_cfg = undefined;
      }

      // Handle agent_cfg: only submit when all required fields exist
      // Required fields: name, embedding_name, api_base (api_key is Optional during update, can be empty)
      const agentCfg = values.agent_cfg as BotUpdateRequest['agent_cfg'];
      if (agentCfg?.name && agentCfg.embedding_name && agentCfg.api_base) {
        submitData.agent_cfg = {
          ...agentCfg,
          // Set api_key to undefined when empty string, backend will preserve original value
          api_key:
            agentCfg.api_key && String(agentCfg.api_key).trim()
              ? agentCfg.api_key
              : undefined,
          // Ensure all required fields exist
          name: agentCfg.name,
          embedding_name: agentCfg.embedding_name,
          api_base: agentCfg.api_base,
        };
      } else {
        // If no agent_cfg or missing required fields, do not submit (backend will preserve original value)
        submitData.agent_cfg = undefined;
      }

      // If secret is empty, remove the field (backend will preserve original value)
      if (!submitData.secret) {
        delete submitData.secret;
      }

      const success = await onSubmit(submitData);
      if (success) {
        Message.success(BOT_MESSAGES.update.success);
        form.resetFields();
        onCancel?.();
      }
      // ✅ Fix: Remove fixed error message to avoid duplication with business logic layer error messages
      // Reason: useUpdateBot's catch block already displays detailed error messages
      return success;
    } catch (error: unknown) {
      // ✅ Correct: expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || BOT_MESSAGES.update.error;
      Message.error(errorMessage);
      logger.error({
        message: '机器人更新失败',
        data: {
          error: errorMessage,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'BotEditForm',
        component: 'handleSubmit',
      });
      return false;
    }
  };

  // URL validator (corresponds to origin/feat/web-v2 branch implementation)
  const urlValidator = (value: string, callback: (error?: string) => void) => {
    if (!value) {
      callback();
      return;
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(value)) {
      callback('请输入有效的URL地址（以http://或https://开头）');
      return;
    }
    callback();
  };

  return (
    <Form form={form} layout="vertical" onSubmit={handleSubmit}>
      <BaseConfig
        form={form}
        showSecrets={showSecrets}
        toggleSecretVisibility={toggleSecretVisibility}
        bot={bot}
      />
      <ChatOpsConfig
        form={form}
        bot={bot}
        showAdvancedConfig={showAdvancedConfig}
        setShowAdvancedConfig={setShowAdvancedConfig}
        kbCollections={kbCollections}
        showSecrets={showSecrets}
        toggleSecretVisibility={toggleSecretVisibility}
        addKbCollection={addKbCollection}
        removeKbCollection={removeKbCollection}
        updateKbCollection={updateKbCollection}
        urlValidator={urlValidator}
      />
      <FormActions onCancel={onCancel} loading={loading} />
    </Form>
  );
};

export default BotEditForm;
