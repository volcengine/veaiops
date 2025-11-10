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

import {
  AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION,
  AGENT_OPTIONS_ONCALL_SUBSCRIPTION,
  AGENT_OPTIONS_THRESHOLD_FILTER,
} from '@/pages/event-center/card-template/types';
import { ModuleType } from '@/types/module';
import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { EVENT_LEVEL_OPTIONS } from '@ec/subscription';
// Subscription relation filter configuration function
// Follow CustomTable best practices to provide complete filter configuration
export const getSubscriptionFilters = ({
  query,
  handleChange,
  moduleType,
}: {
  query: any;
  handleChange: (key: any, value: unknown) => void;
  moduleType?: ModuleType;
}) => {
  // Select agent options based on module type
  const getAgentOptions = () => {
    // Oncall module: Only content recognition Agent
    if (moduleType === ModuleType.ONCALL) {
      return AGENT_OPTIONS_ONCALL_SUBSCRIPTION;
    }
    // Intelligent threshold module: Only intelligent threshold Agent
    if (moduleType === ModuleType.INTELLIGENT_THRESHOLD) {
      return AGENT_OPTIONS_THRESHOLD_FILTER;
    }
    // Event center module and default case: Content recognition Agent + Intelligent threshold Agent
    return AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION;
  };

  return [
    {
      type: 'Input',
      componentProps: {
        addBefore: '名称',
        placeholder: '请输入订阅名称',
        value: query?.name,
        allowClear: true,
        onChange: (v: string) => {
          handleChange('name', v);
        },
      },
    },
    {
      type: 'Select',
      componentProps: {
        addBefore: '智能体',
        placeholder: '请选择智能体',
        value: query?.agents,
        allowClear: true,
        mode: 'multiple',
        options: getAgentOptions(),
        onChange: (v: string[]) => {
          if (v?.length === 0) {
            Message.warning('智能体不能为空!');
            return;
          }
          handleChange('agents', v);
        },
      },
    },
    {
      type: 'Select',
      componentProps: {
        addBefore: '事件级别',
        placeholder: '请选择事件级别',
        value: query?.eventLevels,
        allowClear: true,
        mode: 'multiple',
        options: EVENT_LEVEL_OPTIONS,
        onChange: (v: string[]) => {
          handleChange('eventLevels', v);
        },
      },
    },
    {
      type: 'Select',
      componentProps: {
        addBefore: '是否开启WEBHOOK',
        placeholder: '请选择WEBHOOK状态',
        value: query?.enableWebhook,
        allowClear: true,
        options: [
          { label: '已开启', value: true },
          { label: '未开启', value: false },
        ],
        onChange: (v: boolean) => {
          handleChange('enableWebhook', v);
        },
      },
    },
    {
      type: 'Select',
      componentProps: {
        addBefore: '关注项目',
        placeholder: '请选择关注项目',
        value: query?.projects,
        allowClear: true,
        mode: 'multiple',
        dataSource: {
          serviceInstance: apiClient.projects,
          api: 'getApisV1ManagerSystemConfigProjects',
          payload: {},
          responseEntityKey: 'data',
          optionCfg: {
            labelKey: 'name',
            valueKey: 'name', // Use name (display name) to keep consistent with bot-attributes
          },
        },
        onChange: (v: string[]) => {
          handleChange('projects', v);
        },
      },
    },
  ];
};
