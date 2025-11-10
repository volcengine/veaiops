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
 * Create step UI component
 * @description Handles UI rendering logic for the create step
 * @author AI Assistant
 * @date 2025-01-17
 */

import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Progress,
  Result,
  Space,
  Typography,
} from '@arco-design/web-react';
import { IconLoading } from '@arco-design/web-react/icon';
import type React from 'react';
import styles from '../../../datasource-wizard.module.less';
import { DataSourceType } from '../../../types';
import type { WizardActions, WizardState } from '../../../types';
import type { CreateResult } from './datasource-creator';

const { Title, Text } = Typography;

export interface CreateUIProps {
  dataSourceType: DataSourceType;
  state: WizardState;
  actions: WizardActions;
  creating: boolean;
  result: CreateResult | null;
  progress: number;
  onRetry: () => void;
  onReset: () => void;
  onCreate: () => void;
}

export const CreateUI: React.FC<CreateUIProps> = ({
  dataSourceType,
  state,
  actions,
  creating,
  result,
  progress,
  onRetry,
  onReset,
  onCreate,
}) => {
  if (creating) {
    return (
      <Card className={styles.configCard}>
        <div className={styles.loadingContainer}>
          <IconLoading
            style={{ fontSize: 48, color: '#165DFF', marginBottom: 16 }}
            spin
          />
          <Title heading={6} className={styles.loadingTitle}>
            {state.editingDataSourceId
              ? '正在更新数据源...'
              : '正在创建数据源...'}
          </Title>
          <Text type="secondary" className={styles.loadingDescription}>
            数据源名称: {state.dataSourceName}
          </Text>
          <Progress
            percent={progress}
            status={progress === 100 ? 'success' : 'normal'}
            className={styles.progressBar}
          />
        </div>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className={styles.configCard}>
        <Result
          status={result.success ? 'success' : 'error'}
          title={result.success ? '数据源创建成功' : '数据源创建失败'}
          subTitle={result.message}
          extra={
            <Space>
              {result.success ? (
                <Button type="primary" onClick={onReset}>
                  创建新的数据源
                </Button>
              ) : (
                <>
                  <Button onClick={onRetry}>重试</Button>
                  <Button type="primary" onClick={onReset}>
                    重新开始
                  </Button>
                </>
              )}
            </Space>
          }
        />

        {result.success && result.dataSourceId && (
          <Alert
            type="success"
            title="创建详情"
            content={
              <div>
                <Text>数据源ID: {result.dataSourceId}</Text>
                <br />
                <Text>数据源名称: {state.dataSourceName}</Text>
                <br />
                <Text>
                  数据源类型:{' '}
                  {dataSourceType === DataSourceType.ZABBIX && 'Zabbix'}
                  {dataSourceType === DataSourceType.ALIYUN && '阿里云'}
                  {dataSourceType === DataSourceType.VOLCENGINE && '火山引擎'}
                </Text>
              </div>
            }
            className={styles.resultAlert}
          />
        )}

        {!result.success && result.error && (
          <Alert
            type="error"
            title="错误详情"
            content={result.error}
            className={styles.resultAlert}
          />
        )}
      </Card>
    );
  }

  // Display data source name input form
  const isEditMode = Boolean(state.editingDataSourceId);

  return (
    <Card className={styles.configCard}>
      <div className={styles.configHeader}>
        <Title heading={6} className={styles.configTitle}>
          数据源配置
        </Title>
        <Text type="secondary" className={styles.configDescription}>
          请输入数据源名称，完成最后的配置
        </Text>
      </div>

      <div className={styles.configContent}>
        <Form layout="vertical">
          <Form.Item
            label={'数据源名称'}
            required
            help={
              isEditMode
                ? '数据源名称不可编辑'
                : '请输入数据源的名称，用于标识此数据源'
            }
            validateStatus={!state.dataSourceName ? undefined : 'success'}
          >
            <Input
              placeholder="请输入数据源名称"
              value={state.dataSourceName}
              onChange={(value) => actions.setDataSourceName(value)}
              allowClear
              disabled={isEditMode}
            />
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
};

export default CreateUI;
