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

import type { FormInstance } from '@arco-design/web-react/es/Form';
import type { OptionInfo } from '@arco-design/web-react/es/Select/interface';
import { Input, Select } from '@veaiops/components';
import type React from 'react';

/**
 * Select.Block data source type
 * Based on Select.Block interface definition in @veaiops/components
 */
type SelectDataSource =
  | ((props: {
      search?: unknown;
      remoteSearchParams?: unknown;
      pageReq?: { skip: number; limit: number };
      value?: unknown;
    }) => Promise<unknown> | unknown)
  | {
      serviceInstance: unknown;
      api: string;
      payload?: unknown;
      responseEntityKey: string;
      JsonParseEntityKey?: string;
      optionCfg: Partial<Record<string, unknown>>;
    };

/**
 * Basic information section component parameters
 */
interface BasicInfoSectionProps {
  form: FormInstance;
  loading: boolean;
  templateDataSource: SelectDataSource;
  projectsDataSource: SelectDataSource;
}

/**
 * Task basic information section
 */
export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  form,
  loading,
  templateDataSource,
  projectsDataSource,
}) => {
  return (
    <>
      {/* Task name */}
      <Input.Block
        isControl
        inline
        required
        formItemProps={{
          label: '任务名称',
          field: 'taskName',
          rules: [{ required: true, message: '任务名称必填' }],
          extra: '智能阈值任务设置一个唯一且描述性的名称',
        }}
        controlProps={{
          placeholder: '请输入任务名称',
          onChange: () => {
            form.setFieldValue('datasourceId', undefined);
          },
          disabled: loading,
        }}
      />

      {/* Metric template */}
      <Select.Block
        isControl
        inline
        required
        formItemProps={{
          label: '指标模版',
          field: 'name',
          rules: [{ required: true, message: '请选择指标模版' }],
          extra: '根据指标类型选择合适的模版，给指标详情初始默认值',
        }}
        controlProps={{
          placeholder: '请选择指标模版',
          disabled: loading,
          isDebouncedFetch: true,
          isCascadeRemoteSearch: true,
          isScrollFetching: true,
          isValueEmptyTriggerOptions: true,
          dataSource: templateDataSource,
          onChange: (
            _: string | number | undefined,
            option: OptionInfo | (OptionInfo | undefined)[] | undefined,
          ) => {
            // Handle single option case
            const singleOption = Array.isArray(option) ? option[0] : option;
            if (
              singleOption &&
              typeof singleOption === 'object' &&
              'extra' in singleOption &&
              singleOption.extra
            ) {
              form.setFieldValue('metric_template_value', {
                ...(singleOption.extra as Record<string, unknown>),
              });
            }
          },
        }}
      />

      {/* Project */}
      <Select.Block
        isControl
        inline
        formItemProps={{
          label: '项目',
          field: 'projects',
          extra: '将任务关联到特定项目，用于权限管理和任务组织',
        }}
        controlProps={{
          mode: 'multiple',
          placeholder: '请选择项目',
          disabled: loading,
          isDebouncedFetch: true,
          isCascadeRemoteSearch: true,
          isScrollFetching: true,
          isValueEmptyTriggerOptions: true,
          dataSource: projectsDataSource,
        }}
      />
    </>
  );
};
