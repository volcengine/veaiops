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
 * Password input form component
 */

import { Form } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import type { DataSourceType } from 'api-generate';
import { forwardRef, useImperativeHandle } from 'react';
import { FormActions } from './form-actions';
import { FormFieldsList } from './form-fields-list';
import type { PasswordFormProps, PasswordFormRef } from './types';

export const PasswordForm = forwardRef<PasswordFormRef, PasswordFormProps>(
  (
    {
      connectType,
      connect,
      onSubmit,
      onCancel,
      loading = false,
      showButtons = true,
    },
    ref,
  ) => {
    const [form] = Form.useForm();

    // Determine fields to disable based on connection type (except password/Secret fields)
    const getDisabledFields = (type: DataSourceType): string[] => {
      switch (type) {
        case 'Zabbix':
          return ['zabbix_api_url', 'zabbix_api_user']; // Disable URL and username, keep password editable
        case 'Aliyun':
          return ['aliyun_access_key_id']; // Disable Access Key ID, keep Secret editable
        case 'Volcengine':
          return ['volcengine_access_key_id']; // Disable Access Key ID, keep Secret editable
        default:
          return [];
      }
    };

    const disabledFields = getDisabledFields(connectType);

    const handleSubmit = async () => {
      try {
        const values = await form.validate();
        onSubmit(values);
      } catch (error: unknown) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '[PasswordForm] 表单验证失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            timestamp: Date.now(),
          },
          source: 'PasswordForm',
          component: 'handleSubmit',
        });
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    return (
      <div className="py-4">
        <div className="mb-4 text-[#666]">输入连接所需的认证信息</div>

        <Form form={form} layout="vertical" autoComplete="off">
          <FormFieldsList
            connectType={connectType}
            connect={connect}
            disabledFields={disabledFields}
          />
        </Form>

        {showButtons && (
          <FormActions
            onSubmit={handleSubmit}
            onCancel={onCancel}
            loading={loading}
          />
        )}
      </div>
    );
  },
);
