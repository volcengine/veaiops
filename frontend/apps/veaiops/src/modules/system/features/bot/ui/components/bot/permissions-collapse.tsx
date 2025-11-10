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

import { Button, Collapse, Message } from '@arco-design/web-react';
import { IconCopy, IconSafe } from '@arco-design/web-react/icon';
import { safeCopyToClipboard } from '@veaiops/utils';
import type React from 'react';
import { LARK_BOT_MIN_PERMISSIONS } from './lark-config-guide-constants';

const CollapseItem = Collapse.Item;

export const PermissionsCollapse: React.FC = () => {
  const handleCopyPermissions = async () => {
    try {
      const copyResult = await safeCopyToClipboard(
        JSON.stringify(LARK_BOT_MIN_PERMISSIONS, null, 2),
      );

      if (copyResult.success) {
        Message.success('已复制权限配置到剪贴板');
      } else if (copyResult.error) {
        const errorMessage =
          copyResult.error instanceof Error
            ? copyResult.error.message
            : '复制失败，请重试';
        Message.error(errorMessage);
      }
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || '复制失败，请重试';
      Message.error(errorMessage);
    }
  };

  return (
    <Collapse
      className="mt-2"
      bordered={false}
      style={{ background: 'transparent' }}
    >
      <CollapseItem
        header={
          <span>
            <IconSafe style={{ marginRight: '8px', color: '#f77234' }} />
            点击查看最小权限配置（可复制后在飞书页面导入）
          </span>
        }
        name="permissions"
      >
        <div className="relative">
          <pre
            className="bg-gray-100 p-3 rounded text-xs overflow-auto"
            style={{ maxHeight: '200px' }}
          >
            {JSON.stringify(LARK_BOT_MIN_PERMISSIONS, null, 2)}
          </pre>
          <Button
            type="primary"
            size="small"
            className="mt-2"
            icon={<IconCopy style={{ fontSize: '12px' }} />}
            onClick={handleCopyPermissions}
          >
            复制权限配置
          </Button>
        </div>
      </CollapseItem>
    </Collapse>
  );
};

export default PermissionsCollapse;
