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

import { Button, Card, Space } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import type React from 'react';

import type { TableSchema } from '@/custom-table/types';

interface ToolbarSectionProps {
  schema: TableSchema;
  onReload: () => void;
}

/**
 * Toolbar section component
 */
export const ToolbarSection: React.FC<ToolbarSectionProps> = ({
  schema,
  onReload,
}) => {
  if (!schema.features?.toolbar) {
    return null;
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          {typeof schema.features.toolbar === 'object' &&
            schema.features.toolbar.title && (
              <h4 style={{ margin: 0 }}>{schema.features.toolbar.title}</h4>
            )}
          {typeof schema.features.toolbar === 'object' &&
            schema.features.toolbar.subTitle && (
              <p style={{ margin: 0, color: '#666' }}>
                {schema.features.toolbar.subTitle}
              </p>
            )}
        </div>
        <Space>
          {typeof schema.features.toolbar === 'object' &&
            schema.features.toolbar.actions?.map(
              (action: {
                key: string;
                type?: string;
                icon?: React.ReactNode;
                onClick?: () => void;
                [key: string]: unknown;
              }) => (
                <Button
                  key={action.key}
                  type={
                    action.type as
                      | 'primary'
                      | 'secondary'
                      | 'outline'
                      | 'text'
                      | 'default'
                      | 'dashed'
                      | undefined
                  }
                  icon={action.icon}
                  onClick={action.onClick}
                >
                  {action.label as React.ReactNode}
                </Button>
              ),
            )}
          {typeof schema.features.toolbar === 'object' &&
            schema.features.toolbar.settings?.reload && (
              <Button icon={<IconRefresh />} onClick={onReload} />
            )}
        </Space>
      </div>
    </Card>
  );
};
