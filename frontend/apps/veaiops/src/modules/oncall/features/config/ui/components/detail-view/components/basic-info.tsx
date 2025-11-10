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

import { Button, Card, Descriptions, Tooltip } from '@arco-design/web-react';
import {
  IconCalendar,
  IconCheckCircle,
  IconCloseCircle,
  IconCopy,
} from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type { Interest } from 'api-generate';
import type React from 'react';

import type { UseCopyReturn } from '../hooks';
import {
  formatActionCategoryText,
  formatInspectCategoryText,
  formatInspectHistory,
} from '../utils';

const { StampTime } = CellRender;

const { CustomOutlineTag } = CellRender;

/**
 * Basic info card component props
 */
export interface BasicInfoProps {
  rule: Interest;
  copyHook: UseCopyReturn;
}

/**
 * Basic info card component
 */
export const BasicInfo: React.FC<BasicInfoProps> = ({ rule, copyHook }) => {
  const { copiedText, handleCopy } = copyHook;

  return (
    <Card
      title={
        <div className="flex items-center">
          <span className="text-sm">① 基本信息</span>
        </div>
      }
      className="mb-4"
      size="small"
    >
      <Descriptions
        column={2}
        border
        size="medium"
        data={[
          {
            label: '规则名称',
            value: (
              <div className="flex items-center justify-between">
                <span className="font-bold">{rule.name}</span>
                <Tooltip
                  content={copiedText === 'name' ? '已复制' : '复制规则名称'}
                >
                  <Button
                    type="text"
                    size="mini"
                    icon={<IconCopy />}
                    onClick={() =>
                      handleCopy({
                        text: rule.name,
                        identifier: 'name',
                        displayLabel: '规则名称',
                      })
                    }
                  />
                </Tooltip>
              </div>
            ),
            span: 2,
          },
          {
            label: '规则UUID',
            value: rule.uuid ? (
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  {rule.uuid}
                </span>
                <Tooltip
                  content={copiedText === 'uuid' ? '已复制' : '复制UUID'}
                >
                  <Button
                    type="text"
                    size="mini"
                    icon={<IconCopy />}
                    onClick={() =>
                      handleCopy({
                        text: rule.uuid || '',
                        identifier: 'uuid',
                        displayLabel: 'UUID',
                      })
                    }
                  />
                </Tooltip>
              </div>
            ) : (
              '-'
            ),
            span: 2,
          },
          {
            label: '规则描述',
            value: rule.description || '暂无描述',
            span: 2,
          },
          {
            label: '动作类别',
            value: (
              <CustomOutlineTag>
                {formatActionCategoryText(rule.action_category)}
              </CustomOutlineTag>
            ),
          },
          {
            label: '检查类别',
            value: (
              <CustomOutlineTag>
                {formatInspectCategoryText(rule.inspect_category)}
              </CustomOutlineTag>
            ),
          },
          {
            label: '检查历史记录数',
            value: formatInspectHistory(rule.inspect_history),
          },
          {
            label: '版本号',
            value: rule.version ? (
              <CustomOutlineTag>v{rule.version}</CustomOutlineTag>
            ) : (
              '-'
            ),
          },
          {
            label: '状态',
            value: (
              <CustomOutlineTag>
                {rule.is_active ? (
                  <>
                    <IconCheckCircle style={{ marginRight: 4 }} />
                    已启用
                  </>
                ) : (
                  <>
                    <IconCloseCircle style={{ marginRight: 4 }} />
                    已停用
                  </>
                )}
              </CustomOutlineTag>
            ),
          },
          {
            label: '创建时间',
            value: (
              <div className="flex items-center">
                <IconCalendar
                  className="mr-1"
                  style={{ color: 'var(--color-text-3)' }}
                />
                <StampTime time={rule.created_at} />
              </div>
            ),
          },
          {
            label: '更新时间',
            value: (
              <div className="flex items-center">
                <IconCalendar
                  className="mr-1"
                  style={{ color: 'var(--color-text-3)' }}
                />
                <StampTime time={rule.updated_at} />
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
};
