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

import { Button, Space, Typography } from '@arco-design/web-react';
import { IconCopy, IconDownload } from '@arco-design/web-react/icon';
// ✅ Optimization: Use shortest path, merge same-source imports
import {
  type RawDataProps,
  STYLES,
  copyToClipboard,
  downloadRawData,
} from '@ec/shared';
import type React from 'react';

const { Text } = Typography;

/**
 * Raw data component
 * Displays and operates on event raw data
 */
export const RawData: React.FC<RawDataProps> = ({
  selectedRecord,
  format,
  onFormatChange,
}) => {
  const handleCopy = () => {
    copyToClipboard(
      JSON.stringify(selectedRecord.raw_data, null, 2),
      '原始数据',
    );
  };

  const handleDownload = () => {
    downloadRawData(selectedRecord);
  };

  // Render data based on format
  const renderData = () => {
    if (format === 'formatted') {
      // Formatted view: Beautified display, suitable for reading
      return (
        <div className="text-[#1D2129] leading-[1.8] text-sm">
          <pre className="m-0 whitespace-pre-wrap break-words">
            {JSON.stringify(selectedRecord.raw_data, null, 2)}
          </pre>
        </div>
      );
    } else {
      // JSON view: Compact display, suitable for copying and debugging
      return (
        <div className="text-[#1D2129] leading-[1.2] text-xs">
          <pre className="m-0 whitespace-pre-wrap break-words">
            {JSON.stringify(selectedRecord.raw_data)}
          </pre>
        </div>
      );
    }
  };

  if (!selectedRecord.raw_data) {
    return (
      <div
        className="text-center py-10 px-10 rounded-lg border border-dashed border-[#E5E6EB]"
        style={{
          color: STYLES.TEXT_SECONDARY,
          backgroundColor: STYLES.BACKGROUND_LIGHT,
          borderRadius: STYLES.INFO_BORDER_RADIUS,
        }}
      >
        <Text>暂无原始数据</Text>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex justify-between items-center mb-3 pb-2"
        style={{
          borderBottom: STYLES.CARD_BORDER,
        }}
      >
        <Space>
          <Button
            size="small"
            type={format === 'formatted' ? 'primary' : 'outline'}
            onClick={() => onFormatChange('formatted')}
          >
            格式化视图
          </Button>
          <Button
            size="small"
            type={format === 'json' ? 'primary' : 'outline'}
            onClick={() => onFormatChange('json')}
          >
            JSON 视图
          </Button>
        </Space>
        <Space>
          <Button size="small" icon={<IconCopy />} onClick={handleCopy}>
            复制
          </Button>
          <Button size="small" icon={<IconDownload />} onClick={handleDownload}>
            下载
          </Button>
        </Space>
      </div>

      <div
        className="p-4 max-h-[400px] overflow-auto text-[13px] leading-[1.5] rounded-lg font-mono"
        style={{
          backgroundColor: STYLES.BACKGROUND_LIGHT,
          border: STYLES.CARD_BORDER,
          borderRadius: STYLES.INFO_BORDER_RADIUS,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        }}
      >
        {renderData()}
      </div>
    </div>
  );
};
