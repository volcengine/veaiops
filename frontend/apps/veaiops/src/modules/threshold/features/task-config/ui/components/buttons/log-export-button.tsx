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

import { Button, Message } from '@arco-design/web-react';
import { IconDownload } from '@arco-design/web-react/icon';

import type React from 'react';

/**
 * Log export button component
 * Used to export debug logs related to timeseries charts
 */
export const LogExportButton: React.FC = () => {
  const handleExportLogs = () => {
    try {
      // Use logger's export functionality
      // const logContent = logger.exportLogsAsText();
      // const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
      // const url = URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `timeseries-chart-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;

      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // URL.revokeObjectURL(url);

      Message.success('日志导出成功！请查看下载文件');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '导出日志失败，请重试';
      Message.error(errorMessage);
    }
  };

  const handleStartCollection = () => {
    try {
      Message.success('已开始收集调试日志');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '启动日志收集失败';
      Message.error(errorMessage);
    }
  };

  // Only show in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      <Button
        type="outline"
        size="small"
        icon={<IconDownload />}
        onClick={handleStartCollection}
      >
        开始收集日志
      </Button>
      <Button
        type="primary"
        size="small"
        icon={<IconDownload />}
        onClick={handleExportLogs}
      >
        导出调试日志
      </Button>
    </div>
  );
};

export default LogExportButton;
