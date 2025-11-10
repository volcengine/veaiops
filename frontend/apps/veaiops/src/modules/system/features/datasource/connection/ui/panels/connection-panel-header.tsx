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
 * Connection panel header component
 */

import {
  getDataSourceDescription,
  getDataSourceDisplayName,
} from '@/utils/data-source-utils';
import { Button, Card, Space, Typography } from '@arco-design/web-react';
import { IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import { logger } from '@veaiops/utils';
import type { DataSourceType } from 'api-generate';
import type React from 'react';
import { useEffect } from 'react';

const { Title, Text } = Typography;

interface ConnectionPanelHeaderProps {
  type: DataSourceType;
  loading: boolean;
  selectedCount: number;
  onCreateClick: () => void;
  onRefreshClick: () => void;
  onBatchDeleteClick: () => void;
}

export const ConnectionPanelHeader: React.FC<ConnectionPanelHeaderProps> = ({
  type,
  loading,
  selectedCount,
  onCreateClick,
  onRefreshClick,
  onBatchDeleteClick,
}) => {
  // Log component rendering and button creation
  useEffect(() => {
    logger.info({
      message:
        '[ConnectionPanelHeader] Connection panel header component rendered',
      data: {
        type,
        loading,
        selectedCount,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
      source: 'ConnectionPanelHeader',
      component: 'render',
    });

    // Check if new connection button exists
    const checkButton = () => {
      const button = document.querySelector(
        '[data-testid="new-connection-btn"]',
      );
      if (button) {
        logger.info({
          message: '[ConnectionPanelHeader] New connection button found',
          data: {
            type,
            buttonExists: true,
            buttonText: button.textContent,
            buttonClasses: button.className,
            buttonVisible: (button as HTMLElement).offsetParent !== null,
            buttonRect: button.getBoundingClientRect(),
            url: window.location.href,
            timestamp: new Date().toISOString(),
          },
          source: 'ConnectionPanelHeader',
          component: 'buttonCheck',
        });
      } else {
        logger.warn({
          message: '[ConnectionPanelHeader] New connection button not found',
          data: {
            type,
            buttonExists: false,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          },
          source: 'ConnectionPanelHeader',
          component: 'buttonCheck',
        });
      }
    };

    // Delay check to ensure DOM is fully rendered
    const timer = setTimeout(checkButton, 100);
    return () => clearTimeout(timer);
  }, [type, loading, selectedCount]);

  // Enhance onCreateClick handling, add logging
  const handleCreateClick = () => {
    logger.info({
      message: '[ConnectionPanelHeader] New connection button clicked',
      data: {
        type,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
      source: 'ConnectionPanelHeader',
      component: 'createClick',
    });
    onCreateClick();
  };

  return (
    <Card className="mb-4">
      <div className="flex justify-between items-start">
        <div>
          <Title heading={5} style={{ margin: 0, marginBottom: 8 }}>
            {getDataSourceDisplayName(type)} 连接管理
          </Title>
          <Text type="secondary">{getDataSourceDescription(type)}</Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={handleCreateClick}
            data-testid="new-connection-btn"
          >
            新建连接
          </Button>
          <Button
            type="outline"
            icon={<IconRefresh />}
            loading={loading}
            onClick={onRefreshClick}
          >
            刷新
          </Button>
          {selectedCount > 0 && (
            <Button status="danger" onClick={onBatchDeleteClick}>
              批量删除 ({selectedCount})
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );
};
