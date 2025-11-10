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

import { Message } from '@arco-design/web-react';
import { TAB_KEYS } from '@datasource/lib';
import { logger } from '@veaiops/utils';
import type { DataSource } from 'api-generate';
import { useCallback } from 'react';
import type { DataSourceType } from '../lib/types';
import { useDataSourceRefresh } from './use-data-source-refresh';
import { useDataSourceState } from './use-data-source-state';

interface HandleDeleteParams {
  id: string;
  datasourceType: DataSourceType;
}

interface UseDataSourceHandlersProps {
  handleDelete: (params: HandleDeleteParams) => Promise<boolean>;
  handleTabChange?: (key: string) => void;
}

const mapDataSourceTypeToTabKey = (type: string): string | null => {
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case 'aliyun':
      return TAB_KEYS.ALIYUN;
    case 'volcengine':
      return TAB_KEYS.VOLCENGINE;
    case 'zabbix':
      return TAB_KEYS.ZABBIX;
    default:
      return null;
  }
};

export const useDataSourceHandlers = ({
  handleDelete,
  handleTabChange,
}: UseDataSourceHandlersProps) => {
  logger.info({
    message: '🚀 useDataSourceHandlers Hook initialized',
    data: {},
    source: 'useDataSourceHandlers',
    component: 'init',
  });

  const state = useDataSourceState();
  const refresh = useDataSourceRefresh({
    volcengineTableRef: state.volcengineTableRef,
    aliyunTableRef: state.aliyunTableRef,
    zabbixTableRef: state.zabbixTableRef,
  });

  const handleDeleteZabbix = useCallback(
    async (monitorId: string, _dataSourceType?: DataSourceType) => {
      return await handleDelete({
        id: monitorId,
        datasourceType: 'Zabbix' as DataSourceType,
      });
    },
    [handleDelete],
  );

  const handleDeleteAliyun = useCallback(
    async (monitorId: string, _dataSourceType?: DataSourceType) => {
      return await handleDelete({
        id: monitorId,
        datasourceType: 'Aliyun' as DataSourceType,
      });
    },
    [handleDelete],
  );

  const handleDeleteVolcengine = useCallback(
    async (monitorId: string, _dataSourceType?: DataSourceType) => {
      return await handleDelete({
        id: monitorId,
        datasourceType: 'Volcengine' as DataSourceType,
      });
    },
    [handleDelete],
  );

  const handleAdd = () => {
    logger.info({
      message: '➕ handleAdd called - opening DataSourceWizard',
      data: {
        currentState: {
          connectionDrawerVisible: state.connectionDrawerVisible,
          wizardVisible: state.wizardVisible,
        },
      },
      source: 'useDataSourceHandlers',
      component: 'handleAdd',
    });

    state.setEditingDataSource(null);
    state.setWizardVisible(true);
    logger.info({
      message: '✅ setWizardVisible(true) executed',
      data: { wizardVisible: true },
      source: 'useDataSourceHandlers',
      component: 'handleAdd',
    });
  };

  const handleEditDataSource = (dataSource: DataSource) => {
    logger.info({
      message: '✏️ handleEditDataSource called',
      data: {
        dataSourceId: dataSource?._id,
        dataSourceName: dataSource?.name,
        dataSourceType: dataSource?.type,
        currentState: {
          connectionDrawerVisible: state.connectionDrawerVisible,
          wizardVisible: state.wizardVisible,
        },
      },
      source: 'useDataSourceHandlers',
      component: 'handleEditDataSource',
    });

    state.setEditingDataSource(dataSource);
    state.setWizardVisible(true);
    logger.info({
      message: '✅ setWizardVisible(true) executed for edit mode',
      data: { wizardVisible: true },
      source: 'useDataSourceHandlers',
      component: 'handleEditDataSource',
    });
  };

  const handleWizardSuccess = useCallback(
    async (dataSource: unknown) => {
      logger.info({
        message: '[handleWizardSuccess] 开始处理创建成功回调',
        data: {
          hasDataSource: Boolean(dataSource),
          dataSourceType: (dataSource as { type?: string })?.type,
          dataSourceName: (dataSource as { name?: string })?.name,
          hasHandleTabChange: Boolean(handleTabChange),
        },
        source: 'useDataSourceHandlers',
        component: 'handleWizardSuccess',
      });

      state.setWizardVisible(false);

      const dataSourceInfo = dataSource as {
        type?: string;
        name?: string;
        dataSourceId?: string;
      };

      logger.info({
        message: '[handleWizardSuccess] 解析数据源信息',
        data: {
          dataSourceInfo,
          type: dataSourceInfo?.type,
          typeLowercase: dataSourceInfo?.type?.toLowerCase(),
          name: dataSourceInfo?.name,
        },
        source: 'useDataSourceHandlers',
        component: 'handleWizardSuccess',
      });

      if (dataSourceInfo?.type) {
        const normalizedType = dataSourceInfo.type.toLowerCase();

        let dataSourceTypeText: string;
        if (normalizedType === 'aliyun') {
          dataSourceTypeText = '阿里云';
        } else if (normalizedType === 'volcengine') {
          dataSourceTypeText = '火山引擎';
        } else if (normalizedType === 'zabbix') {
          dataSourceTypeText = 'Zabbix';
        } else {
          dataSourceTypeText = dataSourceInfo.type;
        }
        const successMessage = dataSourceInfo.name
          ? `数据源 "${dataSourceInfo.name}" 创建成功`
          : `${dataSourceTypeText} 数据源创建成功`;

        Message.success(successMessage);

        logger.info({
          message: '[handleWizardSuccess] 显示成功提示',
          data: {
            successMessage,
            dataSourceTypeText,
          },
          source: 'useDataSourceHandlers',
          component: 'handleWizardSuccess',
        });

        logger.info({
          message: '[handleWizardSuccess] 准备刷新表格',
          data: {
            normalizedType,
          },
          source: 'useDataSourceHandlers',
          component: 'handleWizardSuccess',
        });

        switch (normalizedType) {
          case 'volcengine':
            logger.info({
              message: '[handleWizardSuccess] 刷新 Volcengine 表格',
              data: {},
              source: 'useDataSourceHandlers',
              component: 'handleWizardSuccess',
            });
            refresh.volcengineRefresh.afterCreate();
            break;
          case 'aliyun':
            logger.info({
              message: '[handleWizardSuccess] 刷新 Aliyun 表格',
              data: {},
              source: 'useDataSourceHandlers',
              component: 'handleWizardSuccess',
            });
            refresh.aliyunRefresh.afterCreate();
            break;
          case 'zabbix':
            logger.info({
              message: '[handleWizardSuccess] 刷新 Zabbix 表格',
              data: {},
              source: 'useDataSourceHandlers',
              component: 'handleWizardSuccess',
            });
            refresh.zabbixRefresh.afterCreate();
            break;
          default:
            logger.warn({
              message: '[handleWizardSuccess] 未知的数据源类型，无法刷新表格',
              data: {
                normalizedType,
                originalType: dataSourceInfo.type,
              },
              source: 'useDataSourceHandlers',
              component: 'handleWizardSuccess',
            });
            break;
        }

        logger.info({
          message: '[handleWizardSuccess] 准备切换到对应的 tab',
          data: {
            hasHandleTabChange: Boolean(handleTabChange),
            dataSourceType: dataSourceInfo.type,
            normalizedType,
          },
          source: 'useDataSourceHandlers',
          component: 'handleWizardSuccess',
        });

        if (handleTabChange) {
          const tabKey = mapDataSourceTypeToTabKey(dataSourceInfo.type);

          logger.info({
            message: '[handleWizardSuccess] Tab Key 映射结果',
            data: {
              originalType: dataSourceInfo.type,
              normalizedType,
              tabKey,
              tabKeys: TAB_KEYS,
            },
            source: 'useDataSourceHandlers',
            component: 'handleWizardSuccess',
          });

          if (tabKey) {
            logger.info({
              message: '[handleWizardSuccess] 执行 tab 切换',
              data: {
                dataSourceType: dataSourceInfo.type,
                tabKey,
                handleTabChangeType: typeof handleTabChange,
              },
              source: 'useDataSourceHandlers',
              component: 'handleWizardSuccess',
            });

            try {
              handleTabChange(tabKey);

              logger.info({
                message: '[handleWizardSuccess] Tab 切换执行完成',
                data: {
                  tabKey,
                },
                source: 'useDataSourceHandlers',
                component: 'handleWizardSuccess',
              });
            } catch (error: unknown) {
              const errorObj =
                error instanceof Error ? error : new Error(String(error));
              logger.error({
                message: '[handleWizardSuccess] Tab 切换执行失败',
                data: {
                  error: errorObj.message,
                  stack: errorObj.stack,
                  errorObj,
                  tabKey,
                },
                source: 'useDataSourceHandlers',
                component: 'handleWizardSuccess',
              });
            }
          } else {
            logger.warn({
              message: '[handleWizardSuccess] 无法映射数据源类型到 tab key',
              data: {
                dataSourceType: dataSourceInfo.type,
                normalizedType,
                availableTabKeys: Object.values(TAB_KEYS),
              },
              source: 'useDataSourceHandlers',
              component: 'handleWizardSuccess',
            });
          }
        } else {
          logger.warn({
            message:
              '[handleWizardSuccess] handleTabChange 未提供，无法切换 tab',
            data: {
              dataSourceType: dataSourceInfo.type,
            },
            source: 'useDataSourceHandlers',
            component: 'handleWizardSuccess',
          });
        }
      } else {
        logger.warn({
          message: '[handleWizardSuccess] 数据源信息中缺少 type 字段',
          data: {
            dataSourceInfo,
          },
          source: 'useDataSourceHandlers',
          component: 'handleWizardSuccess',
        });
      }
    },
    [state, refresh, handleTabChange],
  );

  const handleOpenConnectionManager = () => {
    logger.info({
      message:
        '🔗 handleOpenConnectionManager called - opening ConnectionManager',
      data: {
        currentState: {
          connectionDrawerVisible: state.connectionDrawerVisible,
          wizardVisible: state.wizardVisible,
        },
      },
      source: 'useDataSourceHandlers',
      component: 'handleOpenConnectionManager',
    });

    state.setConnectionDrawerVisible(true);
    logger.info({
      message: '✅ setConnectionDrawerVisible(true) executed',
      data: { connectionDrawerVisible: true },
      source: 'useDataSourceHandlers',
      component: 'handleOpenConnectionManager',
    });
  };

  const handleCloseConnectionManager = () => {
    logger.info({
      message:
        '❌ handleCloseConnectionManager called - closing ConnectionManager',
      data: {
        currentState: {
          connectionDrawerVisible: state.connectionDrawerVisible,
          wizardVisible: state.wizardVisible,
        },
      },
      source: 'useDataSourceHandlers',
      component: 'handleCloseConnectionManager',
    });
    state.setConnectionDrawerVisible(false);
    logger.info({
      message: '✅ setConnectionDrawerVisible(false) executed',
      data: { connectionDrawerVisible: false },
      source: 'useDataSourceHandlers',
      component: 'handleCloseConnectionManager',
    });
  };

  return {
    connectionDrawerVisible: state.connectionDrawerVisible,
    wizardVisible: state.wizardVisible,
    editingDataSource: state.editingDataSource,
    volcengineTableRef: state.volcengineTableRef,
    aliyunTableRef: state.aliyunTableRef,
    zabbixTableRef: state.zabbixTableRef,
    volcengineRefresh: refresh.volcengineRefresh,
    aliyunRefresh: refresh.aliyunRefresh,
    zabbixRefresh: refresh.zabbixRefresh,
    handleDeleteZabbix,
    handleDeleteAliyun,
    handleDeleteVolcengine,
    handleAdd,
    handleEditDataSource,
    handleWizardSuccess,
    handleOpenConnectionManager,
    handleCloseConnectionManager,
    setWizardVisible: state.setWizardVisible,
    setEditingDataSource: state.setEditingDataSource,
  };
};
