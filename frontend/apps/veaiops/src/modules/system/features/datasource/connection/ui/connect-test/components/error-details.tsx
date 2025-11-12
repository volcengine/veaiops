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
 * 错误详情组件
 */

import { Button, Card, Typography } from '@arco-design/web-react';
import {
  IconCopy,
  IconExclamationCircle,
  IconEye,
  IconEyeInvisible,
} from '@arco-design/web-react/icon';
import { logger, safeCopyToClipboard } from '@veaiops/utils';
import type React from 'react';
import { useState } from 'react';

const { Text } = Typography;

export interface ErrorDetailsProps {
  details: any;
  message: string;
}

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({
  details,
  message,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const result = await safeCopyToClipboard(JSON.stringify(details, null, 2));
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      // ✅ 正确：使用 logger 记录错误，并透出实际错误信息
      logger.error({
        message: '复制失败',
        data: {
          error: result.error?.message,
          stack: result.error?.stack,
          errorObj: result.error,
        },
        source: 'ErrorDetails',
        component: 'handleCopy',
      });
    }
  };

  return (
    <div
      className="rounded-lg p-4 my-4 border border-[#ffccc7]"
      style={{
        background: 'linear-gradient(135deg, #fff2f0 0%, #fff7e6 100%)',
      }}
    >
      <div className="flex items-center mb-3">
        <IconExclamationCircle style={{ color: '#f53f3f', marginRight: 8 }} />
        <Text style={{ color: '#f53f3f', fontWeight: 500 }}>{message}</Text>
      </div>

      {details && (
        <div className="flex gap-2 mb-2">
          <Button
            type="text"
            size="small"
            icon={showDetails ? <IconEyeInvisible /> : <IconEye />}
            onClick={() => setShowDetails(!showDetails)}
            style={{ color: '#86909c' }}
          >
            {showDetails ? '隐藏详情' : '查看详情'}
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconCopy />}
            onClick={handleCopy}
            style={{ color: '#86909c' }}
          >
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
      )}

      {showDetails && details && (
        <Card
          style={{
            marginTop: 12,
            backgroundColor: 'var(--color-fill-1)',
            border: '1px solid var(--color-border-2)',
          }}
        >
          <pre
            className="m-0 p-3 rounded text-xs leading-[1.5] max-h-[200px] overflow-auto font-mono"
            style={{
              backgroundColor: 'var(--color-bg-1)',
              color: 'var(--color-text-2)',
              fontFamily:
                "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
            }}
          >
            {JSON.stringify(details, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};
