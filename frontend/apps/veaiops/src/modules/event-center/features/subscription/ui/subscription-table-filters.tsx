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

import { ModuleType, detectModuleTypeFromPath } from '@/types/module';
import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { EVENT_LEVEL_OPTIONS } from '@ec/subscription';
import { useLocation } from '@modern-js/runtime/router';
import type { FieldItem, HandleFilterProps } from '@veaiops/components';
import {
  AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION,
  AGENT_OPTIONS_ONCALL_SUBSCRIPTION,
} from '@veaiops/constants';
import { useCallback } from 'react';

/**
 * Subscription relation table filter configuration Hook
 */
export const useSubscriptionTableFilters = () => {
  const location = useLocation();
  const moduleType = detectModuleTypeFromPath(location.pathname);

  const handleFilters = useCallback(
    (props: HandleFilterProps<Record<string, unknown>>): FieldItem[] => {
      const { query, handleChange } = props;
      // Select agent options based on module type
      const getAgentOptions = () => {
        if (moduleType === ModuleType.ONCALL) {
          return AGENT_OPTIONS_ONCALL_SUBSCRIPTION;
        }
        return AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION;
      };

      return [
        {
          field: 'name',
          label: '名称',
          type: 'Input',
          componentProps: {
            placeholder: '请输入订阅名称',
            value: query?.name as string | undefined,
            allowClear: true,
            onChange: (v: string) => {
              handleChange({ key: 'name', value: v });
            },
          },
        },
        {
          field: 'agents',
          label: '智能体',
          type: 'Select',
          componentProps: {
            placeholder: '请选择智能体',
            value: query?.agents as string[] | undefined,
            allowClear: true,
            mode: 'multiple',
            options: getAgentOptions(),
            onChange: (v: string[]) => {
              if (v?.length === 0) {
                Message.warning('智能体不能为空!');
                return;
              }
              handleChange({ key: 'agents', value: v });
            },
          },
        },
        {
          field: 'eventLevels',
          label: '事件级别',
          type: 'Select',
          componentProps: {
            placeholder: '请选择事件级别',
            value: query?.eventLevels as string[] | undefined,
            allowClear: true,
            mode: 'multiple',
            options: EVENT_LEVEL_OPTIONS,
            onChange: (v: string[]) => {
              handleChange({ key: 'eventLevels', value: v });
            },
          },
        },
        {
          field: 'enableWebhook',
          label: '是否开启WEBHOOK',
          type: 'Select',
          componentProps: {
            placeholder: '请选择WEBHOOK状态',
            value: query?.enableWebhook as boolean | undefined,
            allowClear: true,
            options: [
              { label: '已开启', value: true },
              { label: '未开启', value: false },
            ],
            onChange: (v: boolean) => {
              handleChange({ key: 'enableWebhook', value: v });
            },
          },
        },
        {
          field: 'projects',
          label: '关注项目',
          type: 'Select',
          componentProps: {
            placeholder: '请选择关注项目',
            value: query?.projects as string[] | undefined,
            allowClear: true,
            mode: 'multiple',
            dataSource: {
              serviceInstance: apiClient.projects,
              api: 'getApisV1ManagerSystemConfigProjects',
              payload: {},
              responseEntityKey: 'data',
              optionCfg: {
                labelKey: 'name',
                valueKey: 'project_id',
              },
            },
            onChange: (v: string[]) => {
              handleChange({ key: 'projects', value: v });
            },
          },
        },
      ];
    },
    [moduleType],
  );

  return handleFilters;
};
