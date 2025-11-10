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
 * Log export feature demo component
 * @description Demonstrates how to use log export utilities
 * @author AI Assistant
 * @date 2025-01-16
 */

import { Alert, Button, Card, Space, Typography } from '@arco-design/web-react';
import {
  IconDownload,
  IconPause,
  IconPlayArrow,
} from '@arco-design/web-react/icon';
import {
  disableAutoSave,
  enableAutoSave,
  exportLogsToFile,
  getAutoSaveConfig,
  startLogCollection,
  stopLogCollection,
} from '@veaiops/utils';
import type React from 'react';
import { useEffect, useState } from 'react';

const { Title, Text, Paragraph } = Typography;

export const LogExportDemo: React.FC = () => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [logCount, setLogCount] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  // Simulate generating some test logs
  const generateTestLogs = () => {
    // Update log count
    setLogCount((prev) => prev + 4);
  };

  // Start log collection
  const handleStartCollection = () => {
    startLogCollection();
    setIsCollecting(true);
  };

  // Stop log collection
  const handleStopCollection = () => {
    stopLogCollection();
    setIsCollecting(false);
  };

  // Export logs
  const handleExportLogs = () => {
    try {
      exportLogsToFile(
        `log-export-demo-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
    }
  };

  // Toggle auto-save
  const handleToggleAutoSave = () => {
    if (autoSaveEnabled) {
      disableAutoSave();
      setAutoSaveEnabled(false);
    } else {
      enableAutoSave({
        interval: 10000, // 10 second interval
        directory: '/Users/bytedance/Desktop/logs',
        maxFiles: 5,
      });
      setAutoSaveEnabled(true);
    }
  };

  // Component mount initialization
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title heading={2}>日志导出功能演示</Title>

      <Alert
        type="info"
        content="此演示展示了如何使用 log-exporter.ts 和 logger.ts 工具来收集和导出应用日志。在开发环境中，您可以使用这些工具来调试和分析应用行为。"
        style={{ marginBottom: '24px' }}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Log collection control */}
        <Card title="日志收集控制" size="small">
          <Space>
            <Button
              type={isCollecting ? 'secondary' : 'primary'}
              icon={<IconPlayArrow />}
              onClick={handleStartCollection}
              disabled={isCollecting}
            >
              开始收集日志
            </Button>

            <Button
              type="outline"
              status="danger"
              icon={<IconPause />}
              onClick={handleStopCollection}
              disabled={!isCollecting}
            >
              停止收集日志
            </Button>

            <Text type={isCollecting ? 'success' : 'secondary'}>
              状态: {isCollecting ? '正在收集' : '已停止'}
            </Text>
          </Space>
        </Card>

        {/* Test log generation */}
        <Card title="测试日志生成" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              点击下面的按钮生成一些测试日志，包括 info、warn、error、debug
              等不同级别的日志。
            </Paragraph>

            <Space>
              <Button onClick={generateTestLogs}>生成测试日志</Button>

              <Text>已生成日志数: {logCount}</Text>
            </Space>
          </Space>
        </Card>

        {/* Log export */}
        <Card title="日志导出" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              导出收集到的日志到文件。日志文件将包含时间戳、日志级别、组件信息和详细数据。
            </Paragraph>

            <Space>
              <Button
                type="primary"
                icon={<IconDownload />}
                onClick={handleExportLogs}
              >
                导出日志文件
              </Button>

              <Button
                type={autoSaveEnabled ? 'secondary' : 'outline'}
                onClick={handleToggleAutoSave}
              >
                {autoSaveEnabled ? '禁用自动保存' : '启用自动保存'}
              </Button>
            </Space>

            {autoSaveEnabled && (
              <Alert
                type="success"
                content="自动保存已启用 - 日志将每10秒自动保存一次到指定目录"
                style={{ marginTop: '8px' }}
              />
            )}
          </Space>
        </Card>

        {/* Usage instructions */}
        <Card title="使用说明" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title heading={4}>在您的组件中使用日志工具：</Title>

            <pre
              style={{
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
              {`// 1. Import log utilities

// 2. Use in component
const MyComponent = () => {
  // Start log collection
  useEffect(() => {
    startLogCollection();
    return () => stopLogCollection();
  }, []);

  // Log events
  const handleAction = () => {

  };

  // Export logs
  const handleExport = () => {
    exportLogsToFile('my-app-logs.log');
  };

  return (
    <Button onClick={handleExport}>Export Logs</Button>
  );
};`}
            </pre>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default LogExportDemo;
