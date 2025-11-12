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
 * Data source creation step component
 * @description Execute data source creation operation and display results
 */

import { Message } from '@arco-design/web-react';
import type React from 'react';
import { useState } from 'react';
import {
  DataSourceType,
  type WizardActions,
  type WizardState,
} from '../../../types';
import { CreateUI } from './create-ui';
import {
  type CreateResult,
  createAliyunDataSource,
  createVolcengineDataSource,
  createZabbixDataSource,
  updateAliyunDataSource,
  updateVolcengineDataSource,
  updateZabbixDataSource,
  validateConfiguration,
} from './datasource-creator';

export interface CreateStepProps {
  dataSourceType: DataSourceType;
  state: WizardState;
  actions: WizardActions;
}

export const CreateStep: React.FC<CreateStepProps> = ({
  dataSourceType,
  state,
  actions,
}) => {
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<CreateResult | null>(null);
  const [progress, setProgress] = useState(0);

  const createOrUpdateDataSource = async (
    type: DataSourceType,
    wizardState: WizardState,
  ): Promise<CreateResult> => {
    const isEditMode = Boolean(wizardState.editingDataSourceId);

    if (isEditMode && wizardState.editingDataSourceId) {
      // Edit mode: call update API
      switch (type) {
        case DataSourceType.ZABBIX:
          return updateZabbixDataSource(
            wizardState.editingDataSourceId,
            wizardState,
          );
        case DataSourceType.ALIYUN:
          return updateAliyunDataSource(
            wizardState.editingDataSourceId,
            wizardState,
          );
        case DataSourceType.VOLCENGINE:
          return updateVolcengineDataSource(
            wizardState.editingDataSourceId,
            wizardState,
          );
        default:
          return {
            success: false,
            message: '不支持的数据源类型',
            error: '不支持的数据源类型',
          };
      }
    } else {
      // Create mode: call create API
      switch (type) {
        case DataSourceType.ZABBIX:
          return createZabbixDataSource(wizardState);
        case DataSourceType.ALIYUN:
          return createAliyunDataSource(wizardState);
        case DataSourceType.VOLCENGINE:
          return createVolcengineDataSource(wizardState);
        default:
          return {
            success: false,
            message: '不支持的数据源类型',
            error: '不支持的数据源类型',
          };
      }
    }
  };

  const handleCreate = async () => {
    const validationError = validateConfiguration(dataSourceType, state);
    if (validationError) {
      Message.error(validationError);
      return;
    }

    setCreating(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const createResult = await createOrUpdateDataSource(
        dataSourceType,
        state,
      );

      clearInterval(progressInterval);
      setProgress(100);
      setResult(createResult);

      if (createResult.success) {
        Message.success(createResult.message);
      } else {
        Message.error(createResult.message);
      }
    } catch (error) {
      setResult({
        success: false,
        message: '创建过程中发生异常，请重试',
        error: (error as any)?.message || String(error),
      });
      Message.error('创建过程中发生异常，请重试');
    } finally {
      setCreating(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setProgress(0);
    handleCreate();
  };

  const handleReset = () => {
    setResult(null);
    setProgress(0);
    actions.resetWizard();
  };

  return (
    <CreateUI
      dataSourceType={dataSourceType}
      state={state}
      actions={actions}
      creating={creating}
      result={result}
      progress={progress}
      onRetry={handleRetry}
      onReset={handleReset}
      onCreate={handleCreate}
    />
  );
};

export default CreateStep;
