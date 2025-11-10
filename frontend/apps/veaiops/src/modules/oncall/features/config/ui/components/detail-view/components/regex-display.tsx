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

import { Button, Card, Tooltip } from '@arco-design/web-react';
import { IconCode, IconCopy } from '@arco-design/web-react/icon';
import { Interest } from 'api-generate';
import type React from 'react';

import type { UseCopyReturn } from '../hooks';

/**
 * Regex display component props
 */
export interface RegexDisplayProps {
  regularExpression: string;
  copyHook: UseCopyReturn;
}

/**
 * Regex display component
 */
export const RegexDisplay: React.FC<RegexDisplayProps> = ({
  regularExpression,
  copyHook,
}) => {
  const { copiedText, handleCopy } = copyHook;

  return (
    <Card
      title={
        <div className="flex items-center">
          <IconCode
            className="mr-2"
            style={{ color: 'var(--color-warning-6)' }}
          />
          正则表达式
        </div>
      }
      className="mb-4"
      size="small"
    >
      <div
        className="p-4 rounded-md font-mono text-sm break-all relative border border-[var(--color-border-2)]"
        style={{
          backgroundColor: 'var(--color-bg-3)',
        }}
      >
        <div className="pr-10">{regularExpression}</div>
        <Tooltip content={copiedText === 'regex' ? '已复制' : '复制正则表达式'}>
          <Button
            type="text"
            size="mini"
            icon={<IconCopy />}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              opacity: 0.7,
            }}
            onClick={() =>
              handleCopy({
                text: regularExpression,
                identifier: 'regex',
                displayLabel: '正则表达式',
              })
            }
          />
        </Tooltip>
      </div>
    </Card>
  );
};
