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
 * CustomTable performance test control panel
 * @description Provides visual performance monitoring interface

 *
 */

import {
  Alert,
  Button,
  Card,
  Grid,
  Progress,
  Space,
  Statistic,
  Typography,
} from '@arco-design/web-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { performanceLogger } from './performance-logger';

const { Text } = Typography;
const { Row, Col } = Grid;

interface PerformanceStats {
  totalRenders: number;
  averageRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  renderFrequency: number;
  componentBreakdown: Record<string, number>;
}

/**
 * Performance control panel component
 */
export const PerformancePanel: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto refresh statistics data
  useEffect(() => {
    if (!autoRefresh || !isMonitoring) {
      return undefined;
    }

    const interval = setInterval(() => {
      setStats(performanceLogger.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, isMonitoring]);

  // Start monitoring
  const handleStartMonitoring = () => {
    performanceLogger.enable();
    setIsMonitoring(true);
    setStats(performanceLogger.getStats());
  };

  // Stop monitoring
  const handleStopMonitoring = () => {
    performanceLogger.disable();
    setIsMonitoring(false);
  };

  // Export logs
  const handleExportLogs = () => {
    performanceLogger.exportLogs();
  };

  // Clear logs
  const handleClearLogs = () => {
    performanceLogger.clear();
    setStats(null);
  };

  // Manual refresh
  const handleRefresh = () => {
    if (isMonitoring) {
      setStats(performanceLogger.getStats());
    }
  };

  return (
    <Card
      title="CustomTable 性能监控面板" // Keep Chinese for UI text
      style={{ width: '100%', marginBottom: 16 }}
      extra={
        <Space>
          {!isMonitoring ? (
            <Button type="primary" onClick={handleStartMonitoring}>
              开始监控
            </Button>
          ) : (
            <Button onClick={handleStopMonitoring}>停止监控</Button>
          )}
          <Button onClick={handleRefresh} disabled={!isMonitoring}>
            刷新 {/* Keep Chinese for UI text */}
          </Button>
          <Button onClick={handleExportLogs} disabled={!stats}>
            导出日志 {/* Keep Chinese for UI text */}
          </Button>
          <Button onClick={handleClearLogs}>清空日志</Button>{' '}
          {/* Keep Chinese for UI text */}
        </Space>
      }
    >
      {!isMonitoring && !stats && (
        <Alert
          type="info"
          content="点击开始监控按钮开始收集 CustomTable 的性能数据" // Keep Chinese for UI text
          style={{ marginBottom: 16 }}
        />
      )}

      {isMonitoring && (
        <Alert
          type="success"
          content="性能监控已启用，正在实时收集数据..." // Keep Chinese for UI text
          style={{ marginBottom: 16 }}
        />
      )}

      {stats && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic
                title="总渲染次数" // Keep Chinese for UI text
                value={stats.totalRenders}
                suffix="次" // Keep Chinese for UI text
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="平均渲染时间" // Keep Chinese for UI text
                value={stats.averageRenderTime}
                precision={2}
                suffix="ms"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="最大渲染时间" // Keep Chinese for UI text
                value={stats.maxRenderTime}
                precision={2}
                suffix="ms"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="渲染频率" // Keep Chinese for UI text
                value={stats.renderFrequency}
                precision={2}
                suffix="次/秒" // Keep Chinese for UI text
              />
            </Col>
          </Row>

          {/* Performance metrics evaluation */}
          <Card size="small" title="性能评估" style={{ marginBottom: 16 }}>
            {' '}
            {/* Keep Chinese for UI text */}
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>平均渲染时间: </Text> {/* Keep Chinese for UI text */}
                <Progress
                  percent={Math.min((stats.averageRenderTime / 50) * 100, 100)}
                  status={stats.averageRenderTime > 16 ? 'error' : 'success'}
                  size="small"
                  showText={false}
                />
                <Text style={{ marginLeft: 8 }}>
                  {stats.averageRenderTime > 16 ? '需要优化' : '性能良好'}{' '}
                  {/* Keep Chinese for UI text */}
                </Text>
              </div>
              <div>
                <Text>渲染频率: </Text> {/* Keep Chinese for UI text */}
                <Progress
                  percent={Math.min((stats.renderFrequency / 60) * 100, 100)}
                  status={stats.renderFrequency > 60 ? 'error' : 'success'}
                  size="small"
                  showText={false}
                />
                <Text style={{ marginLeft: 8 }}>
                  {stats.renderFrequency > 60 ? '渲染过于频繁' : '渲染频率正常'}{' '}
                  {/* Keep Chinese for UI text */}
                </Text>
              </div>
            </Space>
          </Card>

          {/* Component render count breakdown */}
          <Card size="small" title="组件渲染次数分解">
            {' '}
            {/* Keep Chinese for UI text */}
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(stats.componentBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([component, count]) => (
                  <div
                    key={component}
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Text>{component}</Text>
                    <Text bold>{count} 次</Text>{' '}
                    {/* Keep Chinese for UI text */}
                  </div>
                ))}
            </Space>
          </Card>
        </>
      )}
    </Card>
  );
};
