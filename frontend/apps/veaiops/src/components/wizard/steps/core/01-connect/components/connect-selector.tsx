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
 * Connection selector component
 * @description Connection selection step with search, auto-selection, and status prompts
 */

import { useConnections } from '@/hooks/use-connections';
import { CreateConnectionModal } from '@/modules/system/features/datasource/connection/ui/modals';
import { Button, Card, Message, Typography } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import {
  DataSourceType as ApiDataSourceType,
  type Connect,
  type ConnectCreateRequest,
  DataSource,
} from '@veaiops/api-client';
import { logger } from '@veaiops/utils';
import type { WizardActions, WizardState } from '@wizard/types';
import { DataSourceType as WizardDataSourceType } from '@wizard/types';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import styles from '../../../../styles/main.module.less';
import { ConnectList } from './connect-list';

const { Title, Text } = Typography;

/**
 * Convert wizard's DataSourceType (lowercase) to API's DataSourceType (capitalized)
 *
 * @param wizardType - DataSourceType in wizard (lowercase: 'zabbix', 'aliyun', 'volcengine')
 * @returns API's DataSourceType (capitalized: 'Zabbix', 'Aliyun', 'Volcengine')
 */
const convertWizardTypeToApiType = (
  wizardType: DataSource.type | null,
): ApiDataSourceType | undefined => {
  if (!wizardType) {
    return undefined;
  }

  switch (wizardType) {
    case DataSource.type.ZABBIX:
      return ApiDataSourceType.ZABBIX;
    case DataSource.type.ALIYUN:
      return ApiDataSourceType.ALIYUN;
    case DataSource.type.VOLCENGINE:
      return ApiDataSourceType.VOLCENGINE;
    default:
      return undefined;
  }
};

export interface ConnectSelectorProps {
  connects: Connect[];
  selectedConnect?: Connect | null;
  actions: WizardActions;
  state: WizardState;
}

/**
 * Connection selector component
 */
export const ConnectSelector: React.FC<ConnectSelectorProps> = ({
  connects,
  selectedConnect,
  actions,
  state,
}) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Convert wizard's DataSourceType to API's DataSourceType
  const apiDataSourceType = useMemo(
    () => convertWizardTypeToApiType(state.dataSourceType),
    [state.dataSourceType],
  );

  // Get connection creation method (requires API's DataSourceType)
  // ✅ Fixed: Remove unnecessary type assertion, use default value instead
  const { create } = useConnections(
    apiDataSourceType ?? ApiDataSourceType.ZABBIX,
  );

  // Open create connection modal
  const handleOpenCreateModal = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  // Cancel connection creation
  const handleCancelCreate = useCallback(() => {
    setCreateModalVisible(false);
  }, []);

  // Submit connection creation
  const handleCreateSubmit = useCallback(
    async (values: ConnectCreateRequest): Promise<boolean> => {
      try {
        const response = await create(values);

        if (response?._id) {
          Message.success(`连接 "${response.name}" 创建成功`);
          setCreateModalVisible(false);

          // Refresh connection list (using wizard's DataSourceType)
          await actions.fetchConnects(state.dataSourceType ?? undefined);

          // Automatically select newly created connection
          actions.setSelectedConnect(response);

          return true;
        } else {
          Message.warning('创建可能未完全成功，请检查连接列表');
          setCreateModalVisible(false);
          return false;
        }
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));

        logger.error({
          message: '创建连接失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            dataSourceType: state.dataSourceType,
          },
          source: 'ConnectSelector',
          component: 'handleCreateSubmit',
        });

        Message.error(errorObj.message || '创建连接失败，请重试');

        // Convert error to Error object before throwing (complies with specification)
        throw errorObj;
      }
    },
    [create, actions, state.dataSourceType],
  );

  return (
    <>
      <Card className={styles.configCard}>
        <div className={styles.configHeader}>
          <div className="flex items-center justify-between">
            <div>
              <Title heading={6} className={styles.configTitle}>
                连接配置
              </Title>
              <Text type="secondary" className={styles.configDescription}>
                选择已配置的数据源连接，或创建新的连接
              </Text>
            </div>
            <Button
              type="primary"
              icon={<IconPlus />}
              onClick={handleOpenCreateModal}
            >
              创建新连接
            </Button>
          </div>
        </div>

        <div className={styles.configContent}>
          <ConnectList
            connects={connects}
            selectedConnect={selectedConnect}
            onConnectSelect={(connect) => actions.setSelectedConnect(connect)}
          />
        </div>
      </Card>

      {/* Create connection modal */}
      {apiDataSourceType && (
        <CreateConnectionModal
          type={apiDataSourceType}
          visible={createModalVisible}
          onSubmit={handleCreateSubmit}
          onCancel={handleCancelCreate}
        />
      )}
    </>
  );
};
