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

import { Alert } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import type { OptionInfo } from '@arco-design/web-react/es/Select/interface';
import {
  type DataSourceSetter,
  Input,
  LinkRender,
  Select,
  type SelectDataSourceProps,
  WrapperWithTitle,
} from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useEffect } from 'react';

interface BasicInfoFieldsProps {
  form: FormInstance;
  loading: boolean;
  datasourceType?: string;
  setDatasourceType: (type: string) => void;
  datasourceDataSource?:
    | DataSourceSetter
    | ((props: SelectDataSourceProps) => Promise<any> | any);
  templateDataSource:
    | DataSourceSetter
    | ((props: SelectDataSourceProps) => Promise<any> | any);
  projectsDataSource:
    | DataSourceSetter
    | ((props: SelectDataSourceProps) => Promise<any> | any);
}

/**
 * Basic information fields section
 */
export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  form,
  loading,
  datasourceType,
  setDatasourceType,
  datasourceDataSource,
  templateDataSource,
  projectsDataSource,
}) => {
  // 🔍 Add log: Track component props and form field values
  useEffect(() => {
    const formDatasourceType = form.getFieldValue('datasourceType');
    logger.info({
      message: '[BasicInfoFields] Component props or form field values changed',
      data: {
        datasourceTypeProp: datasourceType,
        formFieldValue: formDatasourceType,
        valuesMatch: formDatasourceType === datasourceType,
        hasDatasourceDataSource: Boolean(datasourceDataSource),
        datasourceDataSourceApi: datasourceDataSource
          ? (datasourceDataSource as any).api
          : undefined,
        timestamp: Date.now(),
      },
      source: 'BasicInfoFields',
      component: 'useEffect',
    });
  }, [form, datasourceType, datasourceDataSource]);

  return (
    <WrapperWithTitle
      title="基本信息"
      level={2}
      contentStyle={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
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
          onChange: (_: string, option: OptionInfo | OptionInfo[]) => {
            if (
              option &&
              !Array.isArray(option) &&
              'extra' in option &&
              option.extra
            ) {
              form.setFieldValue('metric_template_value', {
                ...option.extra,
              });
            }
          },
        }}
      />

      {/* Timeseries datasource type */}
      <Select.Block
        isControl
        inline
        required
        formItemProps={{
          label: '监控数据源类型',
          field: 'datasourceType',
          rules: [{ required: true, message: '监控数据源类型必填' }],
          extra: '选择监控数据的来源平台',
        }}
        controlProps={{
          placeholder: '请选择数据源类型',
          onChange: (value: string) => {
            const previousFormValue = form.getFieldValue('datasourceType');
            logger.info({
              message:
                '[BasicInfoFields] Datasource type field onChange triggered',
              data: {
                newDatasourceType: value,
                previousDatasourceTypeState: datasourceType,
                previousFormFieldValue: previousFormValue,
                currentDatasourceId: form.getFieldValue('datasourceId'),
                timestamp: Date.now(),
              },
              source: 'BasicInfoFields',
              component: 'datasourceType_onChange',
            });

            // 🔍 Log state before update
            logger.info({
              message:
                '[BasicInfoFields] Preparing to update datasourceType state',
              data: {
                newValue: value,
                currentState: datasourceType,
                currentFormValue: previousFormValue,
              },
              source: 'BasicInfoFields',
              component: 'datasourceType_onChange',
            });

            setDatasourceType(value);
            // ✅ Clear selected datasource when datasource type changes (reasonable business logic)
            form.setFieldValue('datasourceId', undefined);

            // 🔍 Log state after update
            const afterFormValue = form.getFieldValue('datasourceType');
            logger.info({
              message:
                '[BasicInfoFields] After datasource type changed, datasourceId has been cleared',
              data: {
                newDatasourceType: value,
                datasourceIdAfterClear: form.getFieldValue('datasourceId'),
                formFieldValueAfterChange: afterFormValue,
                // Note: State update is asynchronous, datasourceType state may still be the old value
                stateValueAfterChange: datasourceType,
                timestamp: Date.now(),
              },
              source: 'BasicInfoFields',
              component: 'datasourceType_onChange',
            });
          },
          options: [
            { label: '火山引擎', value: 'Volcengine' },
            { label: '阿里云', value: 'Aliyun' },
            { label: 'Zabbix', value: 'Zabbix' },
          ],
          disabled: loading,
        }}
      />

      {/* Timeseries datasource */}
      <Select.Block
        isControl
        inline
        required
        formItemProps={{
          label: '监控数据源',
          field: 'datasourceId',
          rules: [{ required: true, message: '请选择数据源' }],
          extra: '选择具体的监控数据源实例',
        }}
        controlProps={{
          placeholder: '请选择数据源',
          disabled: !datasourceType || loading,
          canFetch: Boolean(datasourceType),
          isDebouncedFetch: true,
          isCascadeRemoteSearch: true,
          isScrollFetching: true,
          isValueEmptyTriggerOptions: true,
          dependency: (() => {
            // 🔍 Add log: Track dependency array construction
            const formDatasourceType = form.getFieldValue('datasourceType');
            const dependencyArray = [datasourceType];
            logger.info({
              message:
                '[BasicInfoFields] Datasource field dependency array construction',
              data: {
                dependencyArray,
                datasourceTypeState: datasourceType,
                formFieldValue: formDatasourceType,
                valuesMatch: formDatasourceType === datasourceType,
                hasDatasourceDataSource: Boolean(datasourceDataSource),
                datasourceDataSourceApi: datasourceDataSource
                  ? (datasourceDataSource as any).api
                  : undefined,
                timestamp: Date.now(),
              },
              source: 'BasicInfoFields',
              component: 'dependency_build',
            });
            return dependencyArray;
          })(),
          searchKey: 'name',
          dataSource: (() => {
            // 🔍 Add log: Track dataSource passing
            const formDatasourceType = form.getFieldValue('datasourceType');
            logger.info({
              message: '[BasicInfoFields] Datasource field dataSource passing',
              data: {
                datasourceTypeState: datasourceType,
                formFieldValue: formDatasourceType,
                valuesMatch: formDatasourceType === datasourceType,
                hasDatasourceDataSource: Boolean(datasourceDataSource),
                datasourceDataSourceApi: datasourceDataSource
                  ? (datasourceDataSource as any).api
                  : undefined,
                datasourceDataSourceType: typeof datasourceDataSource,
                timestamp: Date.now(),
              },
              source: 'BasicInfoFields',
              component: 'dataSource_pass',
            });
            return datasourceDataSource;
          })(),
          onChange: (value: string, option: OptionInfo | OptionInfo[]) => {
            logger.info({
              message: '[BasicInfoFields] Datasource field onChange triggered',
              data: {
                datasourceId: value,
                datasourceType,
                formFieldValue: form.getFieldValue('datasourceType'),
                hasOption: Boolean(option),
                optionLabel:
                  !Array.isArray(option) && option && 'label' in option
                    ? (option as any).label
                    : undefined,
              },
              source: 'BasicInfoFields',
              component: 'datasourceId_onChange',
            });
          },
          dropdownRender: (dom: React.ReactNode) => (
            <div className={'w-[100%]'}>
              <Alert
                showIcon={false}
                content={
                  <div
                    className="flex items-center gap-1 nowrap"
                    style={{ fontWeight: 'bold' }}
                  >
                    <div style={{ whiteSpace: 'nowrap' }}>找不到数据源？</div>
                    <LinkRender
                      ellipsisStyle={{ width: 'auto' }}
                      text={'创建监控数据源'}
                      link={'/system/datasource'}
                      linkProps={{ rel: 'noopener noreferrer' }}
                    />
                  </div>
                }
              />
              {dom}
            </div>
          ),
        }}
      />

      {/* Projects */}
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

      {/* Auto-update threshold */}
      <Select.Block
        isControl
        inline
        formItemProps={{
          label: '自动更新阈值',
          field: 'autoUpdate',
          extra: '开启后系统将定期自动重新计算和更新阈值',
          initialValue: 'true',
        }}
        controlProps={{
          placeholder: '请选择',
          disabled: loading,
          options: [
            { label: '开启', value: 'true' },
            { label: '关闭', value: 'false' },
          ],
        }}
      />

      {/* Threshold direction */}
      <Select.Block
        isControl
        inline
        required
        formItemProps={{
          label: '阈值方向',
          field: 'direction',
          rules: [{ required: true, message: '阈值方向必填' }],
          extra: '计算正常阈值的上限、下限还是包含上下限',
          initialValue: 'both',
        }}
        controlProps={{
          placeholder: '请选择阈值方向',
          options: [
            { label: '上界', value: 'up' },
            { label: '下界', value: 'down' },
            { label: '双向', value: 'both' },
          ],
          disabled: loading,
        }}
      />

      {/* Sliding window */}
      <Input.Number
        isControl
        required
        inline
        formItemProps={{
          label: '滑动窗口',
          field: 'nCount',
          rules: [{ required: true, message: '请输入滑动窗口' }],
          extra: '连续几个数据点作为计算阈值的最小窗口，默认3',
        }}
        controlProps={{
          min: 1,
          max: 100,
          precision: 0,
        }}
      />
    </WrapperWithTitle>
  );
};
